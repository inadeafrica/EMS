import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { SharedModule } from "src/app/shared/shared.module";
import { EnergymonitorModule } from "../energymonitor/energymonitor.module";
import { EnergyFlowModalComponent } from "./energy-flow-modal/energy-flow-modal.component";
import { MeridianHeroChartComponent } from "./hero-chart/hero-chart.component";
import { MeridianComponent } from "./meridian.component";

@NgModule({
    imports: [
        BrowserModule,
        SharedModule,
        EnergymonitorModule,
    ],
    declarations: [
        EnergyFlowModalComponent,
        MeridianComponent,
        MeridianHeroChartComponent,
    ],
    exports: [
        MeridianComponent,
    ],
})
export class MeridianModule { }
