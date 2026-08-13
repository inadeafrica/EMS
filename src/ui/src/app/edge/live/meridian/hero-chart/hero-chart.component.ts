import { Component, Input, OnChanges } from "@angular/core";
import * as Chart from "chart.js";
import { format } from "date-fns";

@Component({
    selector: "oe-meridian-hero-chart",
    template: "<canvas baseChart [data]=\"chartData\" [options]=\"chartOptions\" type=\"line\"></canvas>",
    standalone: false,
})
export class MeridianHeroChartComponent implements OnChanges {

    @Input() public labels: Date[] = [];
    @Input() public values: (number | null)[] = [];
    /** CSS custom property (already resolved on :root) to color the line/fill with. */
    @Input() public colorVar: string = "--oe-production";

    protected chartData: Chart.ChartData<"line"> = { labels: [], datasets: [] };
    protected chartOptions: Chart.ChartOptions<"line"> = MeridianHeroChartComponent.buildOptions();

    private static buildOptions(): Chart.ChartOptions<"line"> {
        return {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            interaction: { mode: "index", intersect: false },
            scales: {
                x: { display: false },
                y: { display: false, beginAtZero: true },
            },
        };
    }

    private static toRgba(hex: string, alpha: number): string {
        const clean = hex.replace("#", "");
        if (clean.length !== 6) {
            return `rgba(245, 166, 35, ${alpha})`;
        }
        const bigint = parseInt(clean, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    public ngOnChanges(): void {
        const color = getComputedStyle(document.documentElement).getPropertyValue(this.colorVar).trim() || "#f5a623";
        const labels = this.labels;

        this.chartData = {
            labels: labels.map((_, index) => index.toString()),
            datasets: [{
                data: this.values,
                borderColor: color,
                backgroundColor: MeridianHeroChartComponent.toRgba(color, 0.18),
                borderWidth: 2,
                fill: true,
                tension: 0.35,
                pointRadius: 0,
                pointHitRadius: 10,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: color,
            }],
        };

        this.chartOptions = {
            ...MeridianHeroChartComponent.buildOptions(),
            plugins: {
                legend: { display: false },
                datalabels: { display: false } as any,
                tooltip: {
                    enabled: true,
                    callbacks: {
                        title: (items) => {
                            const index = items[0]?.dataIndex;
                            return index != null && labels[index] ? format(labels[index], "HH:mm") : "";
                        },
                        label: (item) => `${((item.raw as number) ?? 0).toFixed(2)} kW`,
                    },
                },
            },
        };
    }
}
