import { GetSalesBookForm } from "@/app/(clean-code)/(sales)/_common/use-case/sales-book-form-use-case";
import { SalesFormZusData } from "@/app/(clean-code)/(sales)/types";
import {
    useFormDataStore,
    ZusSales,
} from "../../../_common/_stores/form-data-store";
import { StepHelperClass } from "./zus-helper-class";
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
    data.itemArray.map((item) => {
        const uid = item.uid;
        resp.sequence.formItem.push(uid);
        resp.kvFormItem[uid] = {
            collapsed: !item.expanded,
            uid,
            id: item.item.id,
            title: "",
        };
        resp.sequence.stepComponent[uid] = [];
        item.formStepArray.map((fs) => {
            // fs.
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
                // componentUid: fs.item.prodUid,
                // nextStepId: fs.step.stepValueId
            };
            if (stepMeta.doorSizeVariation) {
            }
            resp.sequence.stepComponent[uid].push(suid);
            resp.kvFormItem[uid].currentStepUid = suid;
        });
        item.multiComponent.components;
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
