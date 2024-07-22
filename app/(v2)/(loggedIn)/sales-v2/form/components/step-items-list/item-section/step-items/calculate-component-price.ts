import {
    DykeStep,
    DykeStepMeta,
    FormStepArray,
} from "@/app/(v2)/(loggedIn)/sales-v2/type";
import { IStepProducts } from ".";

interface Props {
    stepProducts: IStepProducts;
    stepForm: DykeStep;
    stepArray: FormStepArray;
    stepIndex;
}
export default function calculateComponentPrice({
    stepProducts,
    stepForm,
    stepArray,
    stepIndex,
}: Props) {
    const formData = stepArray
        .filter((a, i) => i < stepIndex)
        .map((s) => ({
            title: s.step.title,
            stepId: s.step.id,
            value: s.item.value,
        }));
    let priceCondition: DykeStepMeta["priceConditions"][number];
    // console.log(stepForm.step.meta?.priceConditions);

    stepForm.step.meta?.priceConditions?.map((c) => {
        if (
            c.rules.length &&
            c.formula &&
            c.rules.every((r) => {
                const sf = formData.find((fd) => fd.stepId == r.stepId);
                console.log(sf, r);
                return sf?.value == r.value;
            })
        ) {
            priceCondition = c;
        }
    });

    stepProducts = stepProducts.map((product) => {
        let basePrice = product.product.meta?.priced
            ? product.product.price
            : 0;
        if (priceCondition?.formula) {
            let _basePrice = eval(
                priceCondition.formula?.replace("basePrice", basePrice as any)
            );
            console.log(priceCondition?.formula, basePrice, _basePrice);
            basePrice = _basePrice;
        }
        if (!product._estimate) product._estimate = {} as any;

        product._estimate.price = basePrice;
        return product;
    });
    return stepProducts;
}
