// @ts-strict-ignore
import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { CurrentData } from "src/app/shared/components/edge/currentdata";
import { Service, Utils } from "../../../../../shared/shared";
import { DefaultTypes } from "../../../../../shared/type/defaulttypes";
import { AbstractSection } from "./abstractsection.component";

@Component({
    selector: "[storagesection]",
    templateUrl: "./storage.component.html",
    standalone: false,
})
export class StorageSectionComponent extends AbstractSection {

    private socValue: number | null = null;

    constructor(
        translate: TranslateService,
        protected override service: Service,
    ) {
        super("EDGE.INDEX.ENERGYMONITOR.STORAGE", translate, service, "Storage");
    }

    public _updateCurrentData(sum: DefaultTypes.Summary): void {
        this.service.getCurrentEdge().then(async edge => {
            edge.currentData.subscribe(curr => {
                const maxApparentPower = edge.isVersionAtLeast("2024.2.2")
                    ? curr.channel["_sum/EssMaxDischargePower"]
                    : curr.channel["_sum/EssMaxApparentPower"];
                const minDischargePower = edge.isVersionAtLeast("2024.2.2")
                    ? curr.channel["_sum/EssMinDischargePower"]
                    : curr.channel["_sum/EssMaxApparentPower"];

                sum.storage.powerRatio = CurrentData.getEssPowerRatio(maxApparentPower, minDischargePower, sum.storage.effectivePower);
                this.socValue = sum.storage.soc;

                let signedPowerW = 0;
                let flowRatio = 0;
                if (sum.storage.effectiveChargePower != null && sum.storage.effectiveChargePower > 49) {
                    signedPowerW = -sum.storage.effectiveChargePower;
                    flowRatio = Utils.divideSafely(sum.storage.effectiveChargePower, sum.system.totalPower);
                } else if (sum.storage.effectiveDischargePower != null && sum.storage.effectiveDischargePower > 49) {
                    signedPowerW = sum.storage.effectiveDischargePower;
                    flowRatio = Utils.multiplySafely(Utils.divideSafely(sum.storage.effectiveDischargePower, sum.system.totalPower), -1);
                }

                this.subLabel = signedPowerW ? `${signedPowerW >= 0 ? "+" : "-"}${(Math.abs(signedPowerW) / 1000).toFixed(1)} kW` : "";
                super.updateSectionData(this.socValue, Utils.divideSafely(this.socValue, 100), flowRatio);
            });
        });
    }

    protected getStartAngle(): number {
        return 136;
    }

    protected getEndAngle(): number {
        return 224;
    }

    protected getValueText(value: number): string {
        if (value == null || Number.isNaN(value)) {
            return "";
        }
        return `${Math.round(value)}%`;
    }
}
