import { UseFormReturn } from "react-hook-form";
import { DykeForm } from "../data-access/sales-form-dta";
type DykeFormReturn = UseFormReturn<DykeForm>;
function salesProfileChanged(form: DykeFormReturn) {
    const data = form.getValues();
    data.itemArray.map((item, index) => {
        item.item.formStepArray.map((formStep, formStepIndex) => {
            let basePrice = formStep.item.basePrice || 0;
            let price = salesProfileCost(form, basePrice);
            // update latest price
            form.setValue(
                `itemArray.${index}.formStepArray.${formStepIndex}.item.price` as any,
                price
            );
            // formStep.item.price
        });
        Object.entries(item.multiComponent?.components).map(([k, v]) => {
            if (item.item.meta.doorType == "Moulding") {
                console.log("....");
                const price = v.priceTags.moulding.price;
            }
            // if(v.)
        });
    });
}

function salesProfileCost(form: DykeFormReturn, baseCost) {
    if (!baseCost) return null;
    const data = form.getValues();
    const defaultProfile = data.data.defaultProfile;
    const profiles = data.data.profiles;
    const profileTitle = data.order.meta.sales_profile;
    console.log(profileTitle);

    const profile = profiles.find((p) => p.title == profileTitle);
    if (!profile || profile.coefficient == 0) return baseCost;
    return baseCost / (profile.coefficient || 1);
}
export default { salesProfileChanged, salesProfileCost };
