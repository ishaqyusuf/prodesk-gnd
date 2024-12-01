import { GetSalesBookForm } from "@/app/(clean-code)/(sales)/_common/use-case/sales-book-form-use-case";
import { SalesFormZusData } from "@/app/(clean-code)/(sales)/types";
import {
    useFormDataStore,
    ZusSales,
} from "../../../_common/_stores/form-data-store";
import { StepHelperClass } from "./zus-helper-class";
import { generateRandomString } from "@/lib/utils";
export function zhInitializeState(data: GetSalesBookForm) {
    const resp: SalesFormZusData = {
        data,
        sequence: {
            formItem: [],
            stepComponent: {},
            multiComponent: {},
        },
        kvFormItem: {},
        kvMultiComponent: {},
        kvStepForm: {},
        kvFilteredStepComponentList: {},
        kvStepComponentList: {},
    };
    console.log(data.itemArray.length);
    data.itemArray.map((item) => {
        const uid = generateRandomString(4);
        console.log(uid);

        resp.sequence.formItem.push(uid);
        resp.kvFormItem[uid] = {
            collapsed: !item.expanded,
            uid,
            id: item.item.id,
            title: "",
        };
        resp.sequence.stepComponent[uid] = [];
        item.formStepArray.map((fs) => {
            const stepMeta = fs.step.meta;
            const suid = `${uid}-${fs.step.uid}`;
            resp.kvStepForm[suid] = {
                componentUid: fs.item?.prodUid,
                title: fs.step.title,
                value: fs.item?.value,
                price: fs.item?.price,
                stepFormId: fs.item.id,
                stepId: fs.step.id,
                _stepAction: {
                    selection: {},
                    selectionCount: 0,
                },
                meta: stepMeta as any,
            };
            resp.sequence.stepComponent[uid].push(suid);
            resp.kvFormItem[uid].currentStepUid = suid;
        });
        // resp.kvFormItem[uid].groupItem
        Object.entries(item.multiComponent.components).map(([id, data]) => {
            if (!resp.kvFormItem[uid].groupItem)
                resp.kvFormItem[uid].groupItem = {
                    componentsBasePrice: 0,
                    componentsSalesPrice: 0,
                    itemIds: [],
                    totalBasePrice: 0,
                    totalSalesPrice: 0,
                    form: {},
                };
            const stepProdUid = item.item?.housePackageTool?.stepProduct?.uid;
            if (data._doorForm)
                Object.entries(data._doorForm).map(([dimIn, doorForm]) => {
                    doorForm.casingPrice;
                    const formId = `${stepProdUid}-${dimIn}`;
                    resp.kvFormItem[uid].groupItem.form[formId] = {
                        salesPrice: doorForm.jambSizePrice,
                        addon: doorForm.doorPrice,
                        swing: doorForm.swing,
                        qty: {
                            lh: doorForm.lhQty,
                            rh: doorForm.rhQty,
                            total: doorForm.totalQty,
                        },
                    } as any;
                });
        });
        // item.multiComponent.components?.map()
        // zhHarvestDoorSizes(resp, uid);
    });
    return resp;
}
export function zhHarvestDoorSizes(data: SalesFormZusData, itemUid) {
    const form = data.kvFormItem[itemUid];
    let heightStepUid;
    const stepVar = Object.entries(data.kvStepForm)
        .filter(([k, d]) => k?.startsWith(`${itemUid}-`))
        .map(([itemStepUid, frm]) => {
            if (frm.title == "Height") heightStepUid = itemStepUid;
            return {
                variation: frm?.meta?.doorSizeVariation,
                itemStepUid,
            };
        })
        .find((v) => v.variation);
    if (!stepVar?.variation) return null;
    const validSizes = stepVar.variation
        .map((c) => {
            const rules = c.rules;
            const valid = rules.every(
                ({ componentsUid, operator, stepUid }) => {
                    const selectedComponentUid =
                        data.kvStepForm[`${itemUid}-${stepUid}`]?.componentUid;
                    return (
                        !componentsUid?.length ||
                        (operator == "is"
                            ? componentsUid?.some(
                                  (a) => a == selectedComponentUid
                              )
                            : componentsUid?.every(
                                  (a) => a != selectedComponentUid
                              ))
                    );
                }
            );
            return {
                widthList: c.widthList,
                valid,
            };
        })
        .filter((c) => c.valid);
    const stepCls = new StepHelperClass(heightStepUid, data as any);
    const visibleComponents = stepCls.getVisibleComponents();
    const sizeList: {
        size: string;
        height: string;
        width: string;
    }[] = [];
    visibleComponents?.map((c) => {
        validSizes.map((s) => {
            s.widthList.map((w) => {
                sizeList.push({
                    size: `${w} x ${c.title}`,
                    width: w,
                    height: c.title,
                });
            });
        });
    });
    return sizeList;
}
export async function zhDeleteItem(zus: ZusSales, uid, index) {
    zus.removeItem(uid, index);
}
export function zhItemUidFromStepUid(stepUid) {
    const [uid] = stepUid?.split("-");
    return uid;
}
