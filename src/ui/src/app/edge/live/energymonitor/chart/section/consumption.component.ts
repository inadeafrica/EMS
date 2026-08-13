// @ts-strict-ignore
import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { UnitvaluePipe } from "src/app/shared/pipe/unitvalue/unitvalue.pipe";
import { Service, Utils } from "../../../../../shared/shared";
import { DefaultTypes } from "../../../../../shared/type/defaulttypes";
import { AbstractSection } from "./abstractsection.component";

@Component({
    selector: "[consumptionsection]",
    templateUrl: "./consumption.component.html",
    standalone: false,
})
export class ConsumptionSectionComponent extends AbstractSection {

    private unitpipe: UnitvaluePipe;

    constructor(
        unitpipe: UnitvaluePipe,
        translate: TranslateService,
        service: Service,
    ) {
        super("GENERAL.CONSUMPTION", translate, service, "Consumption");
        this.unitpipe = unitpipe;
    }

    protected getStartAngle(): number {
        return 46;
    }

    protected getEndAngle(): number {
        return 134;
    }

    protected _updateCurrentData(sum: DefaultTypes.Summary): void {
        const flowRatio = sum.consumption.activePower > 49
            ? Utils.multiplySafely(Utils.divideSafely(sum.consumption.activePower, sum.system.totalPower), -1)
            : 0;
        super.updateSectionData(sum.consumption.activePower, sum.consumption.powerRatio, flowRatio);
    }

    protected getValueText(value: number): string {
        if (value == null || Number.isNaN(value)) {
            return "";
        }
        return this.unitpipe.transform(value, "kW");
    }
}
