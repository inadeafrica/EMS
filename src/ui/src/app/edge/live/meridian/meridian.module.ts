import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { SharedModule } from "src/app/shared/shared.module";
import { MeridianHeroChartComponent } from "./hero-chart/hero-chart.component";
import { MeridianComponent } from "./meridian.component";

@NgModule({
    imports: [
        BrowserModule,
        SharedModule,
    ],
    declarations: [
        MeridianComponent,
        MeridianHeroChartComponent,
    ],
    exports: [
        MeridianComponent,
    ],
})
export class MeridianModule { }
