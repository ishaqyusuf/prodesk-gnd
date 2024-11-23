import { AsyncFnType } from "@/app/(clean-code)/type";
import { getSalesBookFormDataDta } from "../sales-book-form-dta";
import {
    DykeFormStepMeta,
    DykeProductMeta,
    HousePackageToolMeta,
    SalesItemMeta,
    ShelfItemMeta,
    StepComponentMeta,
    TypedDykeSalesDoor,
} from "../../../types";
import { isComponentType } from "../../utils/sales-utils";

type SalesFormData = AsyncFnType<typeof getSalesBookFormDataDta>;
export function typedSalesBookForm(data: SalesFormData) {
    const items = typedSalesBookFormItems(data);
}

export function typedSalesBookFormItems(data: SalesFormData) {
    return data.order.items.map((item) => {
        let _doorForm: {
            [dimension in string]: TypedDykeSalesDoor;
            // OrderType["items"][number]["housePackageTool"]["doors"][number];
        } = {};
        let _doorFormDefaultValue: {
            [dimension in string]: { id: number };
        } = {};
        const isType = isComponentType(item.housePackageTool?.doorType as any);
        item.housePackageTool?.doors?.map((d) => {
            if (d.rhQty && !isType.multiHandles) d.rhQty = 0;
            let dim = d.dimension?.replaceAll('"', "in");
            if (!d.priceId)
                d.priceData = {
                    salesUnitCost: d.jambSizePrice,
                } as any;
            // console.log(d.priceData);

            _doorForm[dim] = { ...d } as any;
            _doorFormDefaultValue[dim] = {
                id: d.id,
            };
        });
        return {
            ...item,
            housePackageTool: item.housePackageTool
                ? {
                      ...(item.housePackageTool || {}),
                      meta: (item?.housePackageTool?.meta ||
                          {}) as any as HousePackageToolMeta,
                      _doorForm,
                      _doorFormDefaultValue,
                      stepProduct: item.housePackageTool.stepProduct
                          ? {
                                ...(item.housePackageTool.stepProduct || {}),
                                meta: item.housePackageTool.stepProduct
                                    ?.meta as StepComponentMeta,
                                door: {
                                    ...(item.housePackageTool.stepProduct
                                        .door || {}),
                                    meta: item.housePackageTool?.stepProduct
                                        ?.door?.meta as any as DykeProductMeta,
                                },
                            }
                          : undefined,
                  }
                : undefined,
            meta: item.meta as any as SalesItemMeta,
            formSteps: item.formSteps
                .map((item) => ({
                    ...item,
                    meta: item.meta as any as DykeFormStepMeta,

                    step: {
                        ...item.step,
                        meta: item.step.meta || {},
                    },
                }))
                .filter(
                    (f, fi) =>
                        item.formSteps.findIndex((p) => p.stepId == f.stepId) ==
                        fi
                ),
            shelfItems: item.shelfItems.map((item) => ({
                ...item,
                meta: item.meta as any as ShelfItemMeta,
            })),
        };
    });
}
export function transformSalesBookFormItem(order: SalesFormData) {}
