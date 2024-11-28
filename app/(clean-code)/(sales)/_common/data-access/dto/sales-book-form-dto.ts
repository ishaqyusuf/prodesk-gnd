import { AsyncFnType } from "@/app/(clean-code)/type";
import { getSalesBookFormDataDta } from "../sales-form-dta";
import {
    DykeDoorType,
    DykeFormStepMeta,
    DykeProductMeta,
    DykeStepProduct,
    HousePackageToolMeta,
    MultiSalesFormItem,
    SalesItemMeta,
    ShelfItemMeta,
    StepComponentMeta,
    StepMeta,
    TypedDykeSalesDoor,
} from "../../../types";
import { inToFt, isComponentType } from "../../utils/sales-utils";
import { generateRandomString, safeFormText, sum } from "@/lib/utils";
import { DykeStepMeta } from "@/app/(v2)/(loggedIn)/sales-v2/type";

type SalesFormData = AsyncFnType<typeof getSalesBookFormDataDta>;
type SalesFormItems = AsyncFnType<typeof typedSalesBookFormItems>;
export function transformSalesBookForm(data: SalesFormData) {
    const items = typedSalesBookFormItems(data);
    const itemArray = transformSalesBookFormItem(data, items);
    const footer = {
        footerPrices: JSON.stringify(footerPrices),
        footerPricesJson: footerPrices,
    };
    let paidAmount = sum(data.order?.payments || [], "amount");
    return {
        order: data.order,
        _rawData: { ...data.order, footer, formItem: itemArray },
        itemArray,
        paidAmount,
        footer,
        _refresher,
        batchSetting,
    };
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
                      stepProduct: transformStepProduct(
                          item.housePackageTool.stepProduct
                      ),
                  }
                : undefined,
            meta: item.meta as any as SalesItemMeta,
            formSteps: item.formSteps
                .map((item) => ({
                    ...item,
                    meta: item.meta as any as DykeFormStepMeta,

                    step: {
                        ...item.step,
                        meta: (item.step.meta || {}) as any as DykeStepMeta &
                            StepMeta,
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
export function transformSalesBookFormItem(
    data: SalesFormData,
    items: SalesFormItems
) {
    const itemArray = (items || [null])
        .filter((item) => {
            if (item?.multiDykeUid) return item?.multiDyke;
            return true;
        })
        .map((item, itemIndex) => {
            const { formSteps, shelfItems, housePackageTool, ...itemData } =
                item || {};
            const shelfItemArray = transformShelfItem(item);
            const multiItem = transformMultiDykeItem(item, items, itemIndex);
            return {
                opened: true,
                stepIndex: 0,
                multiComponent: multiItem.multiComponent,
                expanded: data.order.id ? false : true,
                stillChecked: true,
                sectionPrice:
                    multiItem.sectionPrice || shelfItemArray.sectionPrice,
                priceReferesher: null,
                formStepArray: formSteps.map(({ step, ...rest }) => ({
                    step,
                    item: rest,
                })),
                item: {
                    ...itemData,
                    housePackageTool,
                    shelfItemArray: shelfItemArray.shelfItemArray,
                },
                uid: generateRandomString(4),
                stepSequence: getStepSequence(item, data),
            };
        });

    return itemArray?.every((item) => item?.item?.meta?.lineIndex > -1)
        ? itemArray.sort(
              (item, item2) =>
                  item.item.meta.lineIndex - item2.item.meta.lineIndex
          )
        : itemArray;
}
function getStepSequence(item: SalesFormItems[number], data: SalesFormData) {
    const stepSequence: {
        [uid in string]: StepComponentMeta["stepSequence"];
    } = {};
    item.formSteps.map((s, i) => {
        const seq = data.stepComponents.find((sq) => sq.uid == s.prodUid);
        if (seq?.meta?.stepSequence) {
            stepSequence[seq.uid] = seq.meta?.stepSequence;
        }
    });
}
const footerPrices: {
    [id in string]: {
        doorType: DykeDoorType;
        price: number;
        tax?: boolean;
    };
} = {};
const _refresher: {
    [token in string]: {
        components: string;
    };
} = {};
const batchSetting: {
    [token in string]: {
        selections: {
            [token in string]: boolean;
        };
    };
} = {};
export function transformShelfItem(item: SalesFormItems[number]) {
    const { shelfItems, ...itemData } = item;
    let sectionPrice = 0;
    const shelfItemArray: {
        [k in string]: {
            productArray: {
                item: (typeof shelfItems)[0];
            }[];
            categoryIds: number[];
            categoryId: number;
            uid;
        };
    } = {};
    shelfItems.map((s) => {
        const cid = s.categoryId?.toString();
        const uid = generateRandomString(4);
        if (!shelfItemArray[cid])
            shelfItemArray[cid] = {
                productArray: [],
                categoryIds: s.meta.categoryIds,
                categoryId: s.categoryId,
                uid,
            };
        if (shelfItemArray[cid])
            (shelfItemArray[cid] as any)?.productArray?.push({
                item: s,
            });
        sectionPrice += s.totalPrice || 0;
        footerPrices[uid] = {
            price: s.totalPrice || 0,
            doorType: itemData?.meta?.doorType,
            tax: itemData.meta?.tax,
        };
    });
    return {
        sectionPrice,
        shelfItemArray: Object.values(shelfItemArray),
    };
}
export function transformMultiDykeItem(
    item: SalesFormItems[number],
    items: SalesFormItems,
    itemIndex
) {
    const { formSteps, shelfItems, housePackageTool, ...itemData } = item;
    const multiComponent: MultiSalesFormItem = {
        components: {},
        uid: itemData.multiDykeUid as any,
        multiDyke: itemData.multiDyke as any,
    };
    multiComponent.primary = ((multiComponent.uid &&
        multiComponent.multiDyke) ||
        (!multiComponent.multiDyke && multiComponent.uid)) as any;
    if (multiComponent.primary) multiComponent.rowIndex = itemIndex;
    const _comps = items.filter((item) => {
        if (item.id == itemData.id) {
            return true;
        }
        if (itemData.multiDyke && itemData.multiDykeUid == item.multiDykeUid)
            return true;
        return false;
    });
    let sectionPrice = 0;
    _comps.map((item) => {
        const component =
            item.housePackageTool?.door ||
            item.housePackageTool?.molding ||
            (item.meta.doorType == "Services"
                ? {
                      title: generateRandomString(4),
                  }
                : null);

        const isMoulding = item.housePackageTool?.moldingId != null;

        let _dykeSizes: any = item.meta._dykeSizes;
        if (!_dykeSizes) {
            _dykeSizes = {};
            item.housePackageTool?.doors?.map((door) => {
                const dim = door.dimension?.replaceAll('"', "in");
                _dykeSizes[dim] = {
                    dim,
                    dimFt: inToFt(door.dimension),
                    width: inToFt(door.dimension.split(" x ")[0]),
                    checked: true,
                };
            });
        }
        if (component) {
            const uid = generateRandomString(4);
            function getMouldingId() {
                let mid = item.housePackageTool.moldingId;

                return mid;
            }
            const price = item?.housePackageTool?.totalPrice || item.total || 0;

            const safeTitle = safeFormText(component.title);
            let priceTags = item.housePackageTool?.meta?.priceTags;
            if (!priceTags) {
                priceTags = {};
                if (isMoulding) {
                    // console.log(item.rate);
                    priceTags = {
                        moulding: {
                            price: 0,
                            addon: item.rate,
                        },
                    };
                }
            }
            const c = (multiComponent.components[safeTitle] = {
                uid,
                checked: true,
                heights: _dykeSizes,
                itemId: item.id,
                qty: item.qty,
                description: item.description as any,
                tax: item.meta.tax,
                production: itemData?.dykeProduction,
                doorQty: item.qty,
                unitPrice: item.rate,
                totalPrice: price,
                toolId: isMoulding
                    ? getMouldingId()
                    : item.housePackageTool?.dykeDoorId,
                _doorForm:
                    item.housePackageTool?._doorForm ||
                    ({
                        priceData: {},
                    } as any),
                hptId: item.housePackageTool?.id as any,
                mouldingPriceData:
                    item?.housePackageTool?.priceData || ({} as any),
                doorTotalPrice: price,
                priceTags,
                stepProductId: item.housePackageTool?.stepProductId,
                stepProduct: item.housePackageTool?.stepProduct as any,
            });

            footerPrices[uid] = {
                price: c.totalPrice || 0,
                tax: c.tax,
                doorType: item.meta.doorType,
            };
            sectionPrice += price;
        }
    });
    return {
        multiComponent,
        sectionPrice,
    };
}
export function transformStepProduct(stepProduct): DykeStepProduct | undefined {
    if (!stepProduct) return undefined;
    const result = stepProduct as DykeStepProduct;
    if (!result.meta)
        result.meta = {
            stepSequence: [],
            show: {},
        };
    const prodMeta = result.product?.meta || result.door?.meta;
    if (!result.product)
        result.product = {
            ...result.door,
            // value: result.door.title,
            // description: result.door.title,
        };
    result.metaData = {};
    return stepProduct;
}
