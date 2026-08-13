import { Component } from "@angular/core";
import { ModalController } from "@ionic/angular";

/**
 * Hosts the existing ring-based Energy Monitor as a detail view opened from
 * the Meridian widget, instead of it always being rendered alongside Meridian
 * on the Live overview page (the two would otherwise show the same
 * production/consumption/storage/grid values and self-sufficiency figure
 * twice, in two different visual styles, on one screen).
 */
@Component({
    selector: "oe-energy-flow-modal",
    templateUrl: "./energy-flow-modal.component.html",
    standalone: false,
})
export class EnergyFlowModalComponent {

    constructor(
        protected modalCtrl: ModalController,
    ) { }
}
