import { ZusSales } from "../../../_common/_stores/form-data-store";
import { StepHelperClass } from "./zus-helper-class";

export class HptClass extends StepHelperClass {
    constructor(public itemStepUid, public zus: ZusSales) {
        super(itemStepUid, zus);
    }
    public getDoorStep() {
        return Object.entries(this.zus.kvStepForm).filter(
            ([uid, data]) =>
                uid.endsWith(`-${this.stepUid}`) && data.title == "Door"
        )?.[0]?.[1];
    }
    public getSelectedDoors() {
        const itemForm = this.getItemForm();
        // stepUid + size, componentUid
        return itemForm.groupItem?.itemIds
            ?.map((s) => s.split("-")[0])
            .map((componentUid) => {
                this.getNextRouteFromSettings;
            });
    }
}
