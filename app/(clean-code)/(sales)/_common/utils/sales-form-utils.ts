import { UseFormReturn } from "react-hook-form";
import { DykeForm } from "../data-access/sales-form-dta";
import { formatMoney } from "@/lib/use-number";
type DykeFormReturn = UseFormReturn<DykeForm>;
function salesProfileChanged(form: DykeFormReturn, id) {
    const data = form.getValues();
    const profile = data.data.profiles.find((p) => p.id == id);
    form.setValue("order.paymentTerm", profile?.meta?.net || ("None" as any));
    form.setValue("order.goodUntil", profile?.goodUntil);
    // return;
    setTimeout(() => {
        data.itemArray.map((item, index) => {
            item.item.formStepArray.map((formStep, formStepIndex) => {
                let basePrice = formStep.item.basePrice || 0;
                let price = salesProfileCost(form, basePrice);
                form.setValue(
                    `itemArray.${index}.formStepArray.${formStepIndex}.item.price` as any,
                    price
                );
            });
            // return;
            Object.entries(item.multiComponent?.components).map(([k, v]) => {
                if (v.priceTags?.moulding?.price) {
                    const bPrice = v.priceTags.moulding.basePrice;
                    const price = salesProfileCost(form, bPrice);
                    // console.log({ bPrice, price });
                    console.log(item.multiComponent.components);

                    form.setValue(
                        `itemArray.${index}.multiComponent.components.${k}.priceTags.moulding.price` as any,
                        price
                    );
                    // console.log({ price, bPrice });
                    v._doorForm;
                }
            });
        });
    }, 500);
}

function salesProfileCost(form: DykeFormReturn, baseCost) {
    if (!baseCost) return null;
    const data = form.getValues();

    const profile = data.data.profiles.find(
        (p) => p.id == data.order.customerProfileId
    );
    console.log(profile);
    if (!profile || profile.coefficient == 0) return baseCost;
    return formatMoney(baseCost / (profile.coefficient || 1));
}
export default { salesProfileChanged, salesProfileCost };
