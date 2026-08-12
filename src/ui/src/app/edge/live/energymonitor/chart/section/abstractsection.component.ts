// @ts-strict-ignore
import { TranslateService } from "@ngx-translate/core";
import * as d3 from "d3";
import { v4 as uuidv4 } from "uuid";
import { GridMode, Service } from "src/app/shared/shared";
import { DefaultTypes } from "../../../../../shared/type/defaulttypes";

export type Ratio = "Only Positive [0,1]" | "Negative and Positive [-1,1]";

export class SectionValue {
    public absolute: number;
    public ratio: number;
}

export class SvgSquarePosition {
    constructor(
        public x: number,
        public y: number,
    ) { }
}

export class SvgSquare {
    constructor(
        public length: number,
        public valueRatio: SvgTextPosition,
        public valueText: SvgTextPosition,
        public image: SvgImagePosition,
    ) { }
}

export class SvgTextPosition {
    constructor(
        public x: number,
        public y: number,
        public anchor: "start" | "middle" | "end",
        public fontsize: number,
    ) { }
}

export class SvgImagePosition {
    constructor(
        public image: string,
        public x: number,
        public y: number,
        public length: number,
    ) { }
}

export interface SvgEnergyFlow {
    topLeft: { x: number, y: number },
    middleLeft?: { x: number, y: number },
    bottomLeft: { x: number, y: number },
    middleBottom?: { x: number, y: number },
    bottomRight: { x: number, y: number },
    middleRight?: { x: number, y: number },
    topRight: { x: number, y: number },
    middleTop?: { x: number, y: number }
}

export class EnergyFlow {
    public points: string = "0,0 0,0";
    public animationPoints: string = "0,0 0,0";
    public state: "one" | "two" | "three" = "one";

    constructor(
        public radius: number,
        public gradient: {
            x1: string,
            y1: string,
            x2: string,
            y2: string
        },
    ) { }

    public update(energyFlow: SvgEnergyFlow, animationEnergyFlow: SvgEnergyFlow) {
        if (energyFlow == null) {
            this.points = "0,0 0,0";
        } else {
            const p = energyFlow;
            this.points = p.topLeft.x + "," + p.topLeft.y
                + (p.middleTop ? " " + p.middleTop.x + "," + p.middleTop.y : "")
                + " " + p.topRight.x + "," + p.topRight.y
                + (p.middleRight ? " " + p.middleRight.x + "," + p.middleRight.y : "")
                + " " + p.bottomRight.x + "," + p.bottomRight.y
                + (p.middleBottom ? " " + p.middleBottom.x + "," + p.middleBottom.y : "")
                + " " + p.bottomLeft.x + "," + p.bottomLeft.y
                + (p.middleLeft ? " " + p.middleLeft.x + "," + p.middleLeft.y : "");
        }
        if (animationEnergyFlow == null) {
            this.animationPoints = "0,0 0,0";
        } else {
            const p = animationEnergyFlow;
            this.animationPoints = p.topLeft.x + "," + p.topLeft.y
                + (p.middleTop ? " " + p.middleTop.x + "," + p.middleTop.y : "")
                + " " + p.topRight.x + "," + p.topRight.y
                + (p.middleRight ? " " + p.middleRight.x + "," + p.middleRight.y : "")
                + " " + p.bottomRight.x + "," + p.bottomRight.y
                + (p.middleBottom ? " " + p.middleBottom.x + "," + p.middleBottom.y : "")
                + " " + p.bottomLeft.x + "," + p.bottomLeft.y
                + (p.middleLeft ? " " + p.middleLeft.x + "," + p.middleLeft.y : "");
        }
    }

    public switchState() {
        if (this.state == "one") {
            this.state = "two";
        } else if (this.state == "two") {
            this.state = "one";
        } else {
            this.state = "one";
        }
    }

    public hide() {
        this.state = "three";
    }
}

export abstract class AbstractSection {

    /** Number of rounded-cap pill segments the ring track is split into, per quadrant. */
    private static readonly SEGMENT_COUNT = 10;
    /** Angular gap between adjacent segments, in degrees. */
    private static readonly SEGMENT_GAP_DEG = 2.2;
    /** Corner radius (px) applied to each segment — gives the rounded-cap "pill" look. */
    private static readonly SEGMENT_CORNER_RADIUS = 4;
    /** Gap between the ring's outer edge and the icon/label/value cluster, as a fraction of outerRadius. */
    private static readonly CLUSTER_GAP_FACTOR = 0.16;

    public fillRef: string = "";
    /** Rounded-cap pill segments for the full quadrant track (background). */
    public trackSegments: string[] = [];
    /** Rounded-cap pill segments currently "filled" by the live value, subset of the track grid. */
    public valueSegments: string[] = [];
    public energyFlow: EnergyFlow | null = null;
    public square: SvgSquare;
    public squarePosition: SvgSquarePosition;
    public name: string = "";
    public sectionId: string = "";
    public isEnabled: boolean = false;
    public animationSpeed: number = 500;

    protected valueText: string = "";
    protected innerRadius: number = 0;
    protected outerRadius: number = 0;
    protected height: number = 0;
    protected width: number = 0;
    protected gridMode: GridMode;
    protected restrictionMode: number;

    /** Fixed angular grid (start/end in degrees) the track segments were last built from — reused so value segments line up with the track. */
    private segmentGrid: { start: number, end: number }[] = [];

    private lastCurrentData: DefaultTypes.Summary | null = null;

    constructor(
        translateName: string,
        protected direction: "left" | "right" | "down" | "up" = "left",
        public color: string,
        protected translate: TranslateService,
        protected service: Service,
        widgetClass: string,
    ) {
        this.sectionId = translateName + "-" + uuidv4();
        this.name = translate.instant(translateName);
        this.energyFlow = this.initEnergyFlow(0);
        service.getConfig().then(config => {
            config.widgets.classes.forEach(clazz => {
                if (clazz.toString() === widgetClass) {
                    this.isEnabled = true;
                }
            });
        });
    }

    /**
    * Updates the Values for this Section.
     *
     * @param sum the CurrentData.Summary
    */
    public updateCurrentData(sum: DefaultTypes.Summary): void {
        this.lastCurrentData = sum;
        this._updateCurrentData(sum);
    }

    /**
    * This method is called on every change of resolution of the browser window.
     */
    public updateOnWindowResize(outerRadius: number, innerRadius: number, height: number, width: number) {
        this.outerRadius = outerRadius;
        this.innerRadius = innerRadius;
        this.height = height;
        this.width = width;

        this.segmentGrid = this.buildSegmentGrid(this.getStartAngle(), this.getEndAngle());
        this.trackSegments = this.segmentGrid
            .map(segment => this.pathForAngles(segment.start, segment.end))
            .filter(path => path != null);

        /**
         * imaginary positioning "square" — placed just outside the ring, at the
         * quadrant's compass-point angle, using the same angle math as the ring itself.
         */
        this.square = this.getSquare(innerRadius);
        this.squarePosition = this.getSquarePosition(this.square, innerRadius);
        /**
         * energy flow rectangle
         */
        const availableInnerRadius = innerRadius - this.square.image.y - this.square.image.length - 10;
        this.energyFlow = this.initEnergyFlow(availableInnerRadius);

        // now update also the value specific elements
        if (this.lastCurrentData) {
            this.updateCurrentData(this.lastCurrentData);
        }

        // update correct positioning for Image + Text
        this.setElementHeight();
    }

    /**
     * attr.fill="{{ fillRef }}" has to be specific if using Safari (IOS Browser)
     * otherwise Energymonitor wont be displayed correctly
     */
    protected adjustFillRefbyBrowser(): void {
        if (navigator.vendor.match(/apple/i)) {
            this.fillRef = "url(" + window.location.origin + window.location.pathname + "#" + this.sectionId + ")";
        }
        else {
            this.fillRef = "url(#" + this.sectionId + ")";
        }
    }

    protected getArc(): any {
        return d3.arc()
            .innerRadius(this.innerRadius)
            .outerRadius(this.outerRadius)
            .cornerRadius(AbstractSection.SEGMENT_CORNER_RADIUS);
    }

    protected deg2rad(value: number): number {
        return value * (Math.PI / 180);
    }

    /**
    * This method is called on every change of values.
    *
    * @param valueAbsolute the absolute value of the Section
    * @param valueRatio    the relative value of the Section in [-1,1]
    * @param sumRatio      the relative value of the Section compared to the total System.InPower/OutPower [0,1]
    */
    protected updateSectionData(valueAbsolute: number, valueRatio: number, sumRatio: number) {
        if (!this.isEnabled) {
            return;
        }

        // TODO smoothly resize the arc
        this.valueText = this.getValueText(valueAbsolute);

        /*
         * Create the percentage Arc
         */
        let startAngle;
        switch (this.getRatioType()) {
            case "Only Positive [0,1]":
                startAngle = this.getStartAngle();
                valueRatio = Math.min(1, Math.max(0, valueRatio));
                break;
            case "Negative and Positive [-1,1]":
                startAngle = (this.getStartAngle() + this.getEndAngle()) / 2;
                valueRatio = Math.min(1, Math.max(-1, valueRatio));
                break;
        }
        const valueEndAngle = (this.getEndAngle() - startAngle) * valueRatio + startAngle;

        /*
         * Re-use the exact same fixed segment grid the track was built from, and keep
         * only the segments whose center falls inside [startAngle, valueEndAngle] — this
         * is what makes the filled pills line up perfectly with the track pills.
         */
        const fillStart = Math.min(startAngle, valueEndAngle);
        const fillEnd = Math.max(startAngle, valueEndAngle);
        this.valueSegments = this.segmentGrid
            .filter(segment => {
                const center = (segment.start + segment.end) / 2;
                return center >= fillStart && center <= fillEnd;
            })
            .map(segment => this.pathForAngles(segment.start, segment.end))
            .filter(path => path != null);

        /*
         * Create the energy flow direction arrow
         */
        if (!sumRatio) {
            sumRatio = 0;
        } else if (sumRatio > 0 && sumRatio < 0.1) {
            sumRatio = 0.1; // scale ratio to [0.1,1]
        } else if (sumRatio < 0 && sumRatio > -0.1) {
            sumRatio = -0.1; // scale ratio to [-0.1,-1]
        }
        sumRatio *= 10;

        //radius * 1.2 for longer arrows
        const svgEnergyFlow = this.getSvgEnergyFlow(sumRatio, this.energyFlow.radius * 1.2);
        const svgAnimationEnergyFlow = this.getSvgAnimationEnergyFlow(sumRatio, this.energyFlow.radius * 1.2);
        this.energyFlow.update(svgEnergyFlow, svgAnimationEnergyFlow);
    }

    /**
     * Places the icon/label/value cluster just outside the ring, centered on the
     * quadrant's compass-point angle (the midpoint between {@link getStartAngle} and
     * {@link getEndAngle}) — using the same angle math the ring arcs are drawn with,
     * rather than a per-section hand-tuned Cartesian offset. Because every distance here
     * scales with outerRadius/innerRadius, the cluster never overlaps the ring track at
     * any viewport width.
     */
    protected getSquarePosition(square: SvgSquare, innerRadius: number): SvgSquarePosition {
        const angleDeg = (this.getStartAngle() + this.getEndAngle()) / 2;
        const angleRad = this.deg2rad(angleDeg);
        const clusterCenterRadius = this.outerRadius + (this.outerRadius * AbstractSection.CLUSTER_GAP_FACTOR) + (square.length / 2);

        // d3-arc angle convention: 0deg = 12 o'clock, clockwise positive
        const centerX = Math.sin(angleRad) * clusterCenterRadius;
        const centerY = -Math.cos(angleRad) * clusterCenterRadius;

        return new SvgSquarePosition(centerX - (square.length / 2), centerY - (square.length / 2));
    }

    /**
     * calculate...
     * ...length of square and image;
     * ...x and y of text and image;
     * ...fontsize of text;
     */
    private getSquare(innerRadius: number): SvgSquare {
        const width = innerRadius / 2.5;

        const textSize = width / 4;
        const yText = textSize;

        const numberSize = textSize - 3;
        const yNumber = yText + 5 + numberSize;

        const imageSize = width;
        const yImage = yNumber + 5;

        const length = yImage + imageSize;

        const xText = length / 2;

        return new SvgSquare(
            length,
            new SvgTextPosition(xText, yText, "middle", textSize),
            new SvgTextPosition(xText, yNumber, "middle", numberSize),
            new SvgImagePosition("assets/img/" + this.getImagePath(), (length / 2) - (imageSize / 2), yImage, imageSize),
        );
    }

    /**
     * Splits [rangeStart, rangeEnd] (in degrees) into {@link SEGMENT_COUNT} equal slices,
     * each shrunk by half of {@link SEGMENT_GAP_DEG} on either side so a visible gap
     * separates neighbouring pills.
     */
    private buildSegmentGrid(rangeStart: number, rangeEnd: number): { start: number, end: number }[] {
        const totalSpan = rangeEnd - rangeStart;
        const stepSpan = totalSpan / AbstractSection.SEGMENT_COUNT;
        const grid: { start: number, end: number }[] = [];
        for (let i = 0; i < AbstractSection.SEGMENT_COUNT; i++) {
            grid.push({
                start: rangeStart + (i * stepSpan) + (AbstractSection.SEGMENT_GAP_DEG / 2),
                end: rangeStart + ((i + 1) * stepSpan) - (AbstractSection.SEGMENT_GAP_DEG / 2),
            });
        }
        return grid;
    }

    /** Builds a single rounded-cap pill path for [start, end] (in degrees), or null if the gap left no room. */
    private pathForAngles(start: number, end: number): string | null {
        if (end <= start) {
            return null;
        }
        const arc = this.getArc()
            .startAngle(this.deg2rad(start))
            .endAngle(this.deg2rad(end));
        return arc();
    }

    /**
     * Gets the Start-Angle in Degree
     */
    protected abstract getStartAngle(): number;

    /**
     * Gets the End-Angle in Degree
     */
    protected abstract getEndAngle(): number;

    /**
     * Gets the Ratio-Type of this Section
     */
    protected abstract getRatioType(): Ratio;

    /**
     * Gets the SVG for EnergyFlow
     *
     * @param ratio  the ratio of the value [-1,1] * scale factor
     * @param radius the available radius
     */
    protected abstract getSvgEnergyFlow(ratio: number, radius: number): SvgEnergyFlow;

    /**
     * Gets the SVG for EnergyFlowAnimation
     *
     * @param ratio  the ratio of the value [-1,1] * scale factor
     * @param radius the available radius
     */
    protected abstract getSvgAnimationEnergyFlow(ratio: number, radius: number): SvgEnergyFlow;

    /**
     * Updates the Values for this Section. Should internally call updateSectionData().
     *
     * @param sum the CurrentData.Summary
     */
    protected abstract _updateCurrentData(sum: DefaultTypes.Summary): void;
    protected abstract getImagePath(): string;
    protected abstract getValueText(value: number): string;
    protected abstract initEnergyFlow(radius: number): EnergyFlow;
    protected abstract setElementHeight();

}
