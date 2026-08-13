// @ts-strict-ignore
import { Component, Input, OnDestroy } from "@angular/core";
import { format, getDate, getDaysInMonth, startOfDay, startOfMonth, subDays, subMonths } from "date-fns";

import { ChronoUnit, Resolution, calculateResolution } from "src/app/edge/history/shared";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { QueryHistoricTimeseriesDataRequest } from "src/app/shared/jsonrpc/request/queryHistoricTimeseriesDataRequest";
import { QueryHistoricTimeseriesEnergyPerPeriodRequest } from "src/app/shared/jsonrpc/request/queryHistoricTimeseriesEnergyPerPeriodRequest";
import { QueryHistoricTimeseriesDataResponse } from "src/app/shared/jsonrpc/response/queryHistoricTimeseriesDataResponse";
import { QueryHistoricTimeseriesEnergyPerPeriodResponse } from "src/app/shared/jsonrpc/response/queryHistoricTimeseriesEnergyPerPeriodResponse";
import { ChannelAddress, CurrentData, Utils } from "src/app/shared/shared";
import { DateUtils } from "src/app/shared/utils/date/dateutils";
import { EnergyFlowModalComponent } from "./energy-flow-modal/energy-flow-modal.component";

@Component({
    selector: "oe-meridian",
    templateUrl: "./meridian.component.html",
    styleUrls: ["./meridian.component.scss"],
    standalone: false,
})
export class MeridianComponent extends AbstractFlatWidget implements OnDestroy {

    /**
     * Grid carbon-intensity used to estimate CO2 avoided by self-consumed solar.
     * There is no metered/backend CO2 channel today (OpenEMS does not expose one) —
     * this is a client-side estimate, not measured data. Value is the EEA's average
     * EU-27 electricity-generation emission intensity for 2022 (~366 gCO2/kWh,
     * European Environment Agency "Greenhouse gas emission intensity of electricity
     * generation"). Swap for a market-specific factor if one becomes available.
     */
    private static readonly GRID_EMISSIONS_FACTOR_KG_PER_KWH = 0.366;

    /**
     * A mature tree absorbs roughly 21 kg CO2 per year (commonly cited EPA / reforestation
     * estimate). Used only to translate CO2 avoided into a plain-language equivalence — not
     * a precise figure.
     */
    private static readonly TREE_CO2_ABSORPTION_KG_PER_MONTH = 21 / 12;

    /** How many completed months of consumption history to average for the "typical month" baseline. */
    private static readonly TYPICAL_MONTH_LOOKBACK_MONTHS = 6;

    /**
     * Whether the Edge has the ring-based "Energy Monitor" available at all
     * (mirrors the same `Energymonitor` widget-class check the Live overview
     * page uses). Controls whether the "view energy flow" link is shown.
     */
    @Input() protected hasEnergyFlow = false;

    protected readonly Math = Math;
    protected hasStorage = false;

    // live values
    protected productionW: number | null = null;
    protected consumptionW: number | null = null;
    protected soc: number | null = null;
    /** _sum/EssActivePower: > 0 discharging, < 0 charging */
    protected essActivePowerW: number | null = null;
    /** _sum/GridActivePower: > 0 buying, < 0 selling */
    protected gridActivePowerW: number | null = null;

    // today (queried via Service.queryEnergy — real cumulated deltas, not estimates)
    protected todayProducedKwh: number | null = null;
    protected todayConsumedKwh: number | null = null;
    protected todayBatteryUsableKwh: number | null = null;
    protected todayExportedKwh: number | null = null;
    protected selfSufficientTodayPct: number | null = null;
    protected vsYesterdayDeltaPct: number | null = null;

    // this month
    protected monthConsumedKwh: number | null = null;
    /** Average of up to the last {@link TYPICAL_MONTH_LOOKBACK_MONTHS} completed months. Null until at least one full month of history exists. */
    protected monthTypicalKwh: number | null = null;
    /** Straight-line projection of the current run-rate to the end of the month: monthConsumedKwh / daysElapsed * daysInMonth. */
    protected monthOnPaceKwh: number | null = null;
    protected monthDaysElapsed: number = 1;
    protected monthDaysTotal: number = 30;
    /** Estimated — see {@link GRID_EMISSIONS_FACTOR_KG_PER_KWH}. */
    protected monthCo2AvoidedKg: number | null = null;
    protected monthSelfConsumedKwh: number | null = null;
    protected monthProducedKwh: number | null = null;
    protected monthTreesEquivalent: number | null = null;

    // hero chart: today's production power curve
    protected heroLabels: Date[] = [];
    protected heroValuesKw: (number | null)[] = [];
    /** Evenly-spaced time-of-day labels shown under the hero chart, e.g. "06:00", "09:00" … */
    protected heroAxisLabels: string[] = [];

    protected clockLabel = "";
    private clockInterval: ReturnType<typeof setInterval> | null = null;

    /** Picks 6 evenly-spaced timestamps (first → last) from the queried series and formats them as "HH:mm". */
    private static buildAxisLabels(labels: Date[], tickCount = 6): string[] {
        if (labels.length === 0) {
            return [];
        }
        const ticks: string[] = [];
        for (let i = 0; i < tickCount; i++) {
            const index = Math.round((i / (tickCount - 1)) * (labels.length - 1));
            ticks.push(format(labels[index], "HH:mm"));
        }
        return ticks;
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
    }

    protected override getChannelAddresses(): ChannelAddress[] {
        this.hasStorage = (this.config?.getComponentsImplementingNature("io.openems.edge.ess.api.SymmetricEss") ?? []).length > 0;
        return [
            new ChannelAddress("_sum", "ProductionActivePower"),
            new ChannelAddress("_sum", "ConsumptionActivePower"),
            new ChannelAddress("_sum", "EssSoc"),
            new ChannelAddress("_sum", "EssActivePower"),
            new ChannelAddress("_sum", "GridActivePower"),
        ];
    }

    protected override onCurrentData(currentData: CurrentData): void {
        const c = currentData.allComponents;
        this.productionW = c["_sum/ProductionActivePower"] ?? null;
        this.consumptionW = c["_sum/ConsumptionActivePower"] ?? null;
        this.soc = c["_sum/EssSoc"] ?? null;
        this.essActivePowerW = c["_sum/EssActivePower"] ?? null;
        this.gridActivePowerW = c["_sum/GridActivePower"] ?? null;
    }

    protected override afterIsInitialized(): void {
        this.loadTodayStats();
        this.loadMonthStats();
        this.loadHeroChart();
        this.updateClock();
        this.clockInterval = setInterval(() => this.updateClock(), 30_000);
    }

    protected async openEnergyFlow(): Promise<void> {
        const modal = await this.modalController.create({ component: EnergyFlowModalComponent });
        await modal.present();
    }

    private updateClock(): void {
        this.clockLabel = format(new Date(), "HH:mm");
    }

    private loadTodayStats(): void {
        const now = new Date();
        const todayStart = DateUtils.maxDate(startOfDay(now), this.edge?.firstSetupProtocol);
        const yesterdaySameTime = subDays(now, 1);
        const yesterdayStart = DateUtils.maxDate(startOfDay(yesterdaySameTime), this.edge?.firstSetupProtocol);

        const productionCh = new ChannelAddress("_sum", "ProductionActiveEnergy");
        const consumptionCh = new ChannelAddress("_sum", "ConsumptionActiveEnergy");
        const gridBuyCh = new ChannelAddress("_sum", "GridBuyActiveEnergy");
        const gridSellCh = new ChannelAddress("_sum", "GridSellActiveEnergy");
        const essDischargeCh = new ChannelAddress("_sum", "EssDcDischargeEnergy");

        const todayChannels = this.hasStorage
            ? [productionCh, consumptionCh, gridBuyCh, gridSellCh, essDischargeCh]
            : [productionCh, consumptionCh, gridBuyCh, gridSellCh];

        Promise.all([
            this.service.queryEnergy(todayStart, now, todayChannels),
            this.service.queryEnergy(yesterdayStart, yesterdaySameTime, [productionCh]),
        ]).then(([todayResponse, yesterdayResponse]) => {
            const today = todayResponse.result.data;
            this.todayProducedKwh = Utils.divideSafely(today[productionCh.toString()], 1000);
            this.todayConsumedKwh = Utils.divideSafely(today[consumptionCh.toString()], 1000);
            this.todayExportedKwh = Utils.divideSafely(today[gridSellCh.toString()], 1000);
            this.todayBatteryUsableKwh = this.hasStorage
                ? Utils.divideSafely(today[essDischargeCh.toString()], 1000)
                : null;
            this.selfSufficientTodayPct = Utils.calculateAutarchy(
                Utils.divideSafely(today[gridBuyCh.toString()], 1000),
                Utils.divideSafely(today[consumptionCh.toString()], 1000));

            const yesterdayProducedWh: number | null = yesterdayResponse.result.data[productionCh.toString()];
            const todayProducedWh: number | null = today[productionCh.toString()];
            this.vsYesterdayDeltaPct = (yesterdayProducedWh > 0 && todayProducedWh != null)
                ? ((todayProducedWh - yesterdayProducedWh) / yesterdayProducedWh) * 100
                : null;
        }).catch(() => {
            // leave values at null — template falls back to "–"
        });
    }

    private loadMonthStats(): void {
        const now = new Date();
        const monthStart = DateUtils.maxDate(startOfMonth(now), this.edge?.firstSetupProtocol);
        this.monthDaysElapsed = Math.max(1, getDate(now));
        this.monthDaysTotal = getDaysInMonth(now);

        const consumptionCh = new ChannelAddress("_sum", "ConsumptionActiveEnergy");
        const productionCh = new ChannelAddress("_sum", "ProductionActiveEnergy");
        const gridSellCh = new ChannelAddress("_sum", "GridSellActiveEnergy");

        this.service.queryEnergy(monthStart, now, [consumptionCh, productionCh, gridSellCh]).then(response => {
            const data = response.result.data;
            const consumedWh: number | null = data[consumptionCh.toString()];
            const producedWh: number | null = data[productionCh.toString()];
            const soldWh: number | null = data[gridSellCh.toString()] ?? 0;

            this.monthConsumedKwh = Utils.divideSafely(consumedWh, 1000);
            this.monthOnPaceKwh = this.monthConsumedKwh != null
                ? (this.monthConsumedKwh / this.monthDaysElapsed) * this.monthDaysTotal
                : null;

            if (producedWh != null) {
                this.monthProducedKwh = producedWh / 1000;
                this.monthSelfConsumedKwh = Math.max(0, producedWh - soldWh) / 1000;
                this.monthCo2AvoidedKg = this.monthSelfConsumedKwh * MeridianComponent.GRID_EMISSIONS_FACTOR_KG_PER_KWH;
                this.monthTreesEquivalent = this.monthCo2AvoidedKg / MeridianComponent.TREE_CO2_ABSORPTION_KG_PER_MONTH;
            }
        }).catch(() => { /* leave at null */ });

        this.loadTypicalMonthBaseline(monthStart, consumptionCh);
    }

    /**
     * Averages up to the last {@link TYPICAL_MONTH_LOOKBACK_MONTHS} *completed* calendar
     * months of consumption to build a "typical month" baseline. Real historic data, not a
     * fabricated number — but stays null (and the UI hides the comparison) for systems with
     * less than one full month of history.
     */
    private loadTypicalMonthBaseline(currentMonthStart: Date, consumptionCh: ChannelAddress): void {
        const from = DateUtils.maxDate(
            startOfMonth(subMonths(currentMonthStart, MeridianComponent.TYPICAL_MONTH_LOOKBACK_MONTHS)),
            this.edge?.firstSetupProtocol);
        const to = subDays(currentMonthStart, 1);

        if (!from || from >= to) {
            this.monthTypicalKwh = null;
            return;
        }

        const resolution: Resolution = { value: 1, unit: ChronoUnit.Type.MONTHS };
        const request = new QueryHistoricTimeseriesEnergyPerPeriodRequest(from, to, [consumptionCh], resolution);
        this.edge.sendRequest(this.websocket, request).then(response => {
            const values: number[] = ((response as QueryHistoricTimeseriesEnergyPerPeriodResponse).result.data[consumptionCh.toString()] ?? [])
                .filter(value => value != null);
            if (values.length === 0) {
                this.monthTypicalKwh = null;
                return;
            }
            const averageWh = values.reduce((sum, value) => sum + value, 0) / values.length;
            this.monthTypicalKwh = averageWh / 1000;
        }).catch(() => {
            this.monthTypicalKwh = null;
        });
    }

    private loadHeroChart(): void {
        const now = new Date();
        const todayStart = DateUtils.maxDate(startOfDay(now), this.edge?.firstSetupProtocol);
        const productionCh = new ChannelAddress("_sum", "ProductionActivePower");
        const resolution = calculateResolution(this.service, todayStart, now).resolution;
        const request = new QueryHistoricTimeseriesDataRequest(todayStart, now, [productionCh], resolution);

        this.edge.sendRequest(this.websocket, request).then(response => {
            const result = (response as QueryHistoricTimeseriesDataResponse).result;
            this.heroLabels = result.timestamps.map(timestamp => new Date(timestamp));
            this.heroValuesKw = (result.data[productionCh.toString()] ?? []).map(value => value != null ? value / 1000 : null);
            this.heroAxisLabels = MeridianComponent.buildAxisLabels(this.heroLabels);
        }).catch(() => {
            this.heroLabels = [];
            this.heroValuesKw = [];
            this.heroAxisLabels = [];
        });
    }
}
