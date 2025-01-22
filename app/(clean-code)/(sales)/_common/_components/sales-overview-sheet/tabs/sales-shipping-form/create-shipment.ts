import { salesOverviewStore } from "../../store";
import { ShipmentForm, UseSalesShipmentForm } from "./ctx";

export async function createSalesShipment(ctx: UseSalesShipmentForm) {
    const { form } = ctx;
    const data = form.getValues();
}
