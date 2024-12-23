import { SalesFormFields } from "../../../types";
import { SaveSalesClass } from "./save-sales-class";

export async function saveSalesFormDta(
    form: SalesFormFields,
    oldFormState?: SalesFormFields,
    redirect = true
) {
    const worker = new SaveSalesClass(form, oldFormState);
    await worker.execute();
    return worker.result(redirect);
}
export async function copySalesDta(orderId, as) {}
