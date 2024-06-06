import { z } from "zod";

export function validateTaskQty(maxQty, form) {
    const formData = form.getValues();
    const costData = formData.meta.costData || {};

    const schem = {};
    Object.entries(costData).map(([k, v]) => {
        const maxQ = maxQty[k] || 0;
        if ((v as any)?.qty > 0)
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
        Object.entries(costData).map(([k, v]) => {
            v &&
                typeof (v as any)?.qty === "string" &&
                (costData[k] = {
                    ...(v as any),
                    qty: Number((v as any).qty),
                });
            // k == "undefined" && delete formData.meta.costData[k];
        });
        console.log(costData);
        schema.parse(formData);
    } catch (error) {
        console.log((error as any).issues);
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
