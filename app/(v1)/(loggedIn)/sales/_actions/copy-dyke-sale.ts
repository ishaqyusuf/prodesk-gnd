"use server";

import initDykeSaving from "@/app/(v2)/(loggedIn)/sales-v2/_utils/init-dyke-saving";
import { getDykeFormAction } from "@/app/(v2)/(loggedIn)/sales-v2/form/_action/get-dyke-form";
import { saveDykeSales } from "@/app/(v2)/(loggedIn)/sales-v2/form/_action/save-dyke";
import { removeKeys } from "@/lib/utils";
import { ISalesType } from "@/types/sales";

export async function copyDykeSales(slug, as: ISalesType) {
    const form = await getDykeFormAction(as, slug);
    console.log(form);
    // form.order.id;
    const data = removeKeys(form, []);
    data.paidAmount = 0;
    // data.salesRep.id = form.salesRep?.id as any;
    const e = initDykeSaving(data);
    try {
        console.log(data);
        const { order: resp, createHpts } = await saveDykeSales({
            ...e,
            order: removeKeys(e.order, [
                "id",
                "id",
                "slug",
                "orderId",
                "salesRepId",
                "customerId",
                "shippingAddressId",
                "billingAddressId",
            ]),
            itemArray: [
                ...e.itemArray.map((itemA) => {
                    return {
                        ...itemA,
                        item: {
                            ...removeKeys(itemA.item, ["id", "salesOrderId"]),
                            housePackageTool: !itemA.item.housePackageTool
                                ? itemA.item.housePackageTool
                                : {
                                      ...removeKeys(
                                          itemA.item.housePackageTool,
                                          ["id"]
                                      ),
                                  },
                        },
                    };
                }),
            ],
        });
        // form.order.id
        console.log(resp);
        let link = `/sales-v2/overview/${resp.type}/${resp.slug}`;
        return {
            link,
        };
    } catch (error) {
        console.log(error);
        return {
            // error: error.message,
            data,
            form,
        };
    }
}
