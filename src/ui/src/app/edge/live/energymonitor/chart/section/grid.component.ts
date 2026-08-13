// @ts-strict-ignore
import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { UnitvaluePipe } from "src/app/shared/pipe/unitvalue/unitvalue.pipe";
import { DefaultTypes } from "src/app/shared/type/defaulttypes";
import { Icon } from "src/app/shared/type/widget";
import { CurrentData, EdgeConfig, GridMode, Service, Utils } from "../../../../../shared/shared";
import { AbstractSection } from "./abstractsection.component";

@Component({
    selector: "[gridsection]",
    templateUrl: "./grid.component.html",
    standalone: false,
})
export class GridSectionComponent extends AbstractSection {

    private unitpipe: UnitvaluePipe;

    constructor(
        translate: TranslateService,
        service: Service,
        unitpipe: UnitvaluePipe,
    ) {
        super("GENERAL.GRID", translate, service, "Grid");
        this.unitpipe = unitpipe;
    }

    public static getCurrentGridIcon(currentData: CurrentData): Icon {
        const gridMode = currentData.allComponents["_sum/GridMode"];
        const restrictionMode = currentData.allComponents["ctrlEssLimiter14a0/RestrictionMode"];
        if (gridMode === GridMode.OFF_GRID) {
            return {
                color: "dark",
                name: "oe-offgrid",
                size: "",
            };
        }
        if (restrictionMode === 1) {
            return {
                color: "dark",
                name: "oe-grid-restriction",
                size: "",
            };
        }
        return {
            color: "dark",
            name: "oe-grid",
            size: "",
        };
    }

    public static isControllerEnabled(config: EdgeConfig, factoryId: string): boolean {
        return config.getComponentsByFactory(factoryId).filter(component => component.isEnabled).length > 0;
    }

    public _updateCurrentData(sum: DefaultTypes.Summary): void {
        let flowRatio = 0;
        let power = 0;
        // only reacts to kW values (50 W => 0.1 kW rounded)
        if (sum.grid.buyActivePower && sum.grid.buyActivePower > 49) {
            power = sum.grid.buyActivePower;
            flowRatio = Utils.multiplySafely(Utils.divideSafely(sum.grid.buyActivePower, sum.system.totalPower), -1);
            this.subLabel = this.translate.instant("LIVE.MERIDIAN.BUYING");
        } else if (sum.grid.sellActivePower && sum.grid.sellActivePower > 49) {
            power = sum.grid.sellActivePower;
            flowRatio = Utils.divideSafely(sum.grid.sellActivePower, sum.system.totalPower);
            this.subLabel = this.translate.instant("LIVE.MERIDIAN.SELLING");
        } else {
            this.subLabel = "";
        }

        super.updateSectionData(power, sum.grid.powerRatio, flowRatio);

        // set grid mode
        this.gridMode = sum.grid.gridMode;
    }

    protected getStartAngle(): number {
        return 226;
    }

    protected getEndAngle(): number {
        return 314;
    }

    protected getValueText(value: number): string {
        if (value == null || Number.isNaN(value)) {
            return "";
        }
        return this.unitpipe.transform(value, "kW");
    }
}
