import { z } from "zod";

export function validateTaskQty(maxQty, form) {
    const formData = form.getValues();
    const costData = formData.meta.costData || {};

    const schem = {};
    Object.entries(costData).map(([k, v]) => {
        const maxQ = maxQty[k] || 0;
        schem[k] = z.object({
            qty: z.number({}).max(maxQ).min(0),
        });
    });
    const schema = z.object({
        meta: z.object({
            costData: z.object({
                ...schem,
            }),
        }),
    });
    try {
        Object.entries(formData.meta.costData).map(
            ([k, v]) =>
                v &&
                typeof (v as any)?.qty === "string" &&
                (formData.meta.costData[k] = {
                    ...v,
                    qty: Number((v as any).qty),
                })
        );
        // console.log(formData.meta.costData);
        schema.parse(formData);
    } catch (error) {
        // console.log((error as any).issues);
        (error as any).issues.map((e) => {
            form.setError(e.path.join("."), {
                ...e,
            });
        });
        // console.log(error);
        return false;
    }
    return true;
}
