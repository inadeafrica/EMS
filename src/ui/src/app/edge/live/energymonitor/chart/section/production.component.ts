// @ts-strict-ignore
import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { UnitvaluePipe } from "src/app/shared/pipe/unitvalue/unitvalue.pipe";
import { Service, Utils } from "../../../../../shared/shared";
import { DefaultTypes } from "../../../../../shared/type/defaulttypes";
import { AbstractSection } from "./abstractsection.component";

@Component({
    selector: "[productionsection]",
    templateUrl: "./production.component.html",
    standalone: false,
})
export class ProductionSectionComponent extends AbstractSection {

    private unitpipe: UnitvaluePipe;

    constructor(
        translate: TranslateService,
        service: Service,
        unitpipe: UnitvaluePipe,
    ) {
        super("GENERAL.PRODUCTION", translate, service, "Common_Production");
        this.unitpipe = unitpipe;
    }

    protected getStartAngle(): number {
        return 316;
    }

    protected getEndAngle(): number {
        return 404;
    }

    protected _updateCurrentData(sum: DefaultTypes.Summary): void {
        const flowRatio = sum.production.activePower > 49
            ? Utils.divideSafely(sum.production.activePower, sum.system.totalPower)
            : 0;
        super.updateSectionData(sum.production.activePower, sum.production.powerRatio, flowRatio);
    }

    protected getValueText(value: number): string {
        if (value == null || Number.isNaN(value)) {
            return "";
        }

        return this.unitpipe.transform(value, "kW");
    }
}
