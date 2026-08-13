// @ts-strict-ignore
import { TranslateService } from "@ngx-translate/core";
import { v4 as uuidv4 } from "uuid";
import { GridMode, Service } from "src/app/shared/shared";
import { DefaultTypes } from "../../../../../shared/type/defaulttypes";

export interface Point {
    x: number;
    y: number;
}

/**
 * Layout for one icon/label/value cluster, stacked vertically and centered on
 * {@link AbstractSection.clusterPosition} — badge circle, then label, then value,
 * then an optional sub-label. All sizes derive from innerRadius so the whole
 * cluster scales with the ring at any viewport width.
 */
export class ClusterLayout {
    constructor(
        public badgeRadius: number,
        public iconSize: number,
        public badgeCenterY: number,
        public labelY: number,
        public labelFontSize: number,
        public valueY: number,
        public valueFontSize: number,
        public subLabelY: number,
        public subLabelFontSize: number,
    ) { }
}

/**
 * A single ring quadrant: a plain stroke-based arc (track + a shorter, centered
 * "value" arc on top, both round-capped) plus a thin animated dashed line
 * ("connector") running from the center hub out to the ring, and an icon/label/value
 * cluster sitting just outside the ring. This mirrors the approved "Energy Flow"
 * design exactly — a plain circular stroke arc, not a d3 filled-wedge donut.
 */
export abstract class AbstractSection {

    /** Gap between the ring's outer edge and the icon/label/value cluster, as a fraction of outerRadius. */
    private static readonly CLUSTER_GAP_FACTOR = 0.484;
    /** Hub circle radius as a fraction of outerRadius. */
    private static readonly HUB_RADIUS_FACTOR = 0.5625;
    /** Value arc stroke width as a fraction of the track's stroke width — the value arc is a thinner, centered line within the wider track. */
    private static readonly VALUE_STROKE_FACTOR = 0.45;

    public trackPath: string = "";
    public valuePath: string = "";
    public trackStrokeWidth: number = 0;
    public valueStrokeWidth: number = 0;
    public connector: { x1: number, y1: number, x2: number, y2: number } | null = null;
    public connectorActive: boolean = false;
    public connectorReverse: boolean = false;
    public cluster: ClusterLayout | null = null;
    public clusterPosition: Point | null = null;
    /** Short secondary line under the cluster value, e.g. "Exporting", "Charging" — communicates direction/state in place of arc asymmetry. */
    public subLabel: string = "";
    public name: string = "";
    public sectionId: string = "";
    public isEnabled: boolean = false;

    protected valueText: string = "";
    protected innerRadius: number = 0;
    protected outerRadius: number = 0;
    protected trackRadius: number = 0;
    protected height: number = 0;
    protected width: number = 0;
    protected gridMode: GridMode;
    protected restrictionMode: number;

    private lastCurrentData: DefaultTypes.Summary | null = null;

    constructor(
        translateName: string,
        protected translate: TranslateService,
        protected service: Service,
        widgetClass: string,
    ) {
        this.sectionId = translateName + "-" + uuidv4();
        this.name = translate.instant(translateName);
        service.getConfig().then(config => {
            config.widgets.classes.forEach(clazz => {
                if (clazz.toString() === widgetClass) {
                    this.isEnabled = true;
                }
            });
        });
    }

    /**
     * Converts a point at (r, angleDeg) — where 0deg is straight up (12 o'clock) and
     * angles increase clockwise — into (x, y) coordinates centered on the ring's origin.
     */
    protected static polar(r: number, angleDeg: number): Point {
        const rad = (angleDeg - 90) * (Math.PI / 180);
        return { x: r * Math.cos(rad), y: r * Math.sin(rad) };
    }

    /** Builds a round-stroked circular arc path from startDeg to endDeg at radius r. */
    protected static arcPath(r: number, startDeg: number, endDeg: number): string {
        const start = AbstractSection.polar(r, startDeg);
        const end = AbstractSection.polar(r, endDeg);
        const largeArc = ((endDeg - startDeg) % 360) > 180 ? 1 : 0;
        return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
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
        this.trackRadius = (outerRadius + innerRadius) / 2;
        this.trackStrokeWidth = outerRadius - innerRadius;
        this.valueStrokeWidth = Math.max(2, this.trackStrokeWidth * AbstractSection.VALUE_STROKE_FACTOR);

        const center = (this.getStartAngle() + this.getEndAngle()) / 2;
        const halfWidth = (this.getEndAngle() - this.getStartAngle()) / 2;
        this.trackPath = AbstractSection.arcPath(this.trackRadius, center - halfWidth, center + halfWidth);

        const hubRadius = outerRadius * AbstractSection.HUB_RADIUS_FACTOR;
        const p1 = AbstractSection.polar(hubRadius + 4, center);
        const p2 = AbstractSection.polar(innerRadius - 4, center);
        this.connector = { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };

        /**
         * icon/label/value cluster — placed just outside the ring, at the quadrant's
         * compass-point angle, using the same angle math the ring itself uses.
         */
        this.cluster = this.buildClusterLayout(innerRadius);
        const clusterCenterRadius = outerRadius + (outerRadius * AbstractSection.CLUSTER_GAP_FACTOR);
        this.clusterPosition = AbstractSection.polar(clusterCenterRadius, center);

        // now update also the value specific elements
        if (this.lastCurrentData) {
            this.updateCurrentData(this.lastCurrentData);
        }
    }

    /**
     * This method is called on every change of values.
     *
     * @param valueAbsolute the absolute value of the Section
     * @param valueRatio    the relative value of the Section in [-1,1] — sign communicated via {@link subLabel}, not arc asymmetry
     * @param flowRatio     the relative value of the Section compared to the total System.InPower/OutPower [-1,1] — drives the connector's animation direction
     */
    protected updateSectionData(valueAbsolute: number, valueRatio: number, flowRatio: number) {
        if (!this.isEnabled) {
            return;
        }

        this.valueText = this.getValueText(valueAbsolute);

        const center = (this.getStartAngle() + this.getEndAngle()) / 2;
        const halfWidth = (this.getEndAngle() - this.getStartAngle()) / 2;
        const ratio = Math.min(1, Math.abs(valueRatio ?? 0));
        const filledSpan = halfWidth * 2 * ratio;
        this.valuePath = AbstractSection.arcPath(this.trackRadius, center - filledSpan / 2, center + filledSpan / 2);

        this.connectorActive = !!flowRatio;
        this.connectorReverse = flowRatio < 0;
    }

    /**
     * Lays out the badge/label/value/sub-label stack, vertically centered as a whole
     * on {@link clusterPosition} (mirrors CSS `translate(-50%, -50%)` centering).
     * All sizes scale off innerRadius.
     */
    private buildClusterLayout(innerRadius: number): ClusterLayout {
        const badgeRadius = innerRadius * 0.19;
        const iconSize = badgeRadius * 1.05;
        const labelFontSize = innerRadius * 0.05;
        const valueFontSize = innerRadius * 0.075;
        const subLabelFontSize = innerRadius * 0.045;
        const gapBadgeToLabel = innerRadius * 0.09;
        const gapLabelToValue = innerRadius * 0.03;
        const gapValueToSubLabel = innerRadius * 0.03;

        const hasSubLabel = !!this.subLabel;
        const totalHeight = (badgeRadius * 2) + gapBadgeToLabel + labelFontSize + gapLabelToValue + valueFontSize
            + (hasSubLabel ? gapValueToSubLabel + subLabelFontSize : 0);

        const top = -totalHeight / 2;
        const badgeCenterY = top + badgeRadius;
        const labelY = top + (badgeRadius * 2) + gapBadgeToLabel + labelFontSize;
        const valueY = labelY + gapLabelToValue + valueFontSize;
        const subLabelY = valueY + gapValueToSubLabel + subLabelFontSize;

        return new ClusterLayout(badgeRadius, iconSize, badgeCenterY, labelY, labelFontSize, valueY, valueFontSize, subLabelY, subLabelFontSize);
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
     * Updates the Values for this Section. Should internally call updateSectionData().
     *
     * @param sum the CurrentData.Summary
     */
    protected abstract _updateCurrentData(sum: DefaultTypes.Summary): void;
    protected abstract getValueText(value: number): string;

}
