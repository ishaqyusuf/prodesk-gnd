import { UseFormReturn } from "react-hook-form";
import { DykeForm } from "../data-access/sales-form-dta";
type DykeFormReturn = UseFormReturn<DykeForm>;
function salesProfileChanged(form: DykeFormReturn) {
    const data = form.getValues();
    data.itemArray.map((item, index) => {
        item.item.formStepArray.map((formStep) => {
            // formStep.item.price
        });
    });
}
export default { salesProfileChanged };
