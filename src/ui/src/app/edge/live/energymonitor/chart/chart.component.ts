// @ts-strict-ignore
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { startOfDay } from "date-fns";
import { Subject, fromEvent } from "rxjs";
import { debounceTime, delay, takeUntil } from "rxjs/operators";
import { ChannelAddress, Service, Utils } from "src/app/shared/shared";
import { DateUtils } from "src/app/shared/utils/date/dateutils";
import { CurrentData } from "../../../../shared/components/edge/currentdata";
import { ConsumptionSectionComponent } from "./section/consumption.component";
import { GridSectionComponent } from "./section/grid.component";
import { ProductionSectionComponent } from "./section/production.component";
import { StorageSectionComponent } from "./section/storage.component";

@Component({
    selector: "energymonitor-chart",
    templateUrl: "./chart.component.html",
    standalone: false,
})
export class EnergymonitorChartComponent implements OnInit, OnDestroy {

    /** Fraction of the available half-viewport reserved for the icon/label/value clusters sitting outside the ring. */
    private static readonly CLUSTER_RESERVE_FRACTION = 0.30;

    @ViewChild(ConsumptionSectionComponent, { static: true })
    public consumptionSection: ConsumptionSectionComponent;

    @ViewChild(GridSectionComponent, { static: true })
    public gridSection: GridSectionComponent;

    @ViewChild(ProductionSectionComponent, { static: true })
    public productionSection: ProductionSectionComponent;

    @ViewChild(StorageSectionComponent, { static: true })
    public storageSection: StorageSectionComponent;

    @ViewChild("energymonitorChart", { static: true })
    private chartDiv: ElementRef;

    public translation: string;
    public width: number;
    public height: number;
    public gridMode: number;

    /** "N% self-sufficient today" shown in the center hub — null until the query resolves. */
    protected selfSufficientTodayPct: number | null = null;

    public readonly spinnerId = "energymonitor";

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(
        private service: Service,
    ) { }
    @Input()
    set currentData(currentData: CurrentData) {
        this.service.stopSpinner(this.spinnerId);
        this.updateCurrentData(currentData);
    }

    ngOnInit() {
        this.service.startSpinner(this.spinnerId);
        // make sure chart is redrawn in the beginning and on window resize
        setTimeout(() => this.updateOnWindowResize(), 500);
        const source = fromEvent(window, "resize", null, null);
        source.pipe(takeUntil(this.ngUnsubscribe), debounceTime(200), delay(100)).subscribe(e => {
            this.updateOnWindowResize();
        });
        this.loadSelfSufficientToday();
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
   * This method is called on every change of values.
   */
    updateCurrentData(currentData: CurrentData) {
    /*
     * Set values for energy monitor
     */
        const summary = currentData.summary;
        [this.consumptionSection, this.gridSection, this.productionSection, this.storageSection]
            .filter(section => section != null)
            .forEach(section => {
                section.updateCurrentData(summary);
            });
    }

    /**
   * This method is called on every change of resolution of the browser window.
   */
    private updateOnWindowResize(): void {
        let size = 300;
        if (this.chartDiv.nativeElement.offsetParent) {
            size = this.chartDiv.nativeElement.offsetParent.offsetWidth - 30;
        }
        if (size > window.innerHeight) {
            size = window.innerHeight;
        }
        this.height = this.width = size;
        this.translation = `translate(${this.width / 2}, ${this.height / 2})`;
        // Shrink the ring itself so the icon/label/value clusters — now placed just
        // outside the ring track — always have room within the same viewport, at any size.
        const outerRadius = (Math.min(this.width, this.height) / 2) * (1 - EnergymonitorChartComponent.CLUSTER_RESERVE_FRACTION);
        const innerRadius = outerRadius - (outerRadius * 0.1378);
        // All sections from update() in section
        [this.consumptionSection, this.gridSection, this.productionSection, this.storageSection]
            .filter(section => section != null)
            .forEach(section => {
                section.updateOnWindowResize(outerRadius, innerRadius, this.height, this.width);
            });
    }

    private deg2rad(value: number): number {
        return value * (Math.PI / 180);
    }

    /**
     * Loads today's self-sufficiency (autarchy) for the new center-hub figure. Reuses the
     * same formula as the existing Autarchy widget (Utils.calculateAutarchy), but computed
     * over *today's* cumulated energy (via Service.queryEnergy) rather than a lifetime total.
     */
    private loadSelfSufficientToday(): void {
        const now = new Date();
        this.service.getCurrentEdge().then(edge => {
            const todayStart = DateUtils.maxDate(startOfDay(now), edge?.firstSetupProtocol);
            const gridBuyCh = new ChannelAddress("_sum", "GridBuyActiveEnergy");
            const consumptionCh = new ChannelAddress("_sum", "ConsumptionActiveEnergy");

            this.service.queryEnergy(todayStart, now, [gridBuyCh, consumptionCh]).then(response => {
                const data = response.result.data;
                this.selfSufficientTodayPct = Utils.calculateAutarchy(
                    Utils.divideSafely(data[gridBuyCh.toString()], 1000),
                    Utils.divideSafely(data[consumptionCh.toString()], 1000));
            }).catch(() => {
                this.selfSufficientTodayPct = null;
            });
        });
    }
}
