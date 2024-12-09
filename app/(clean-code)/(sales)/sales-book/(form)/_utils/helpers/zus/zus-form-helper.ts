import { GetSalesBookForm } from "@/app/(clean-code)/(sales)/_common/use-case/sales-book-form-use-case";
import { SalesFormZusData } from "@/app/(clean-code)/(sales)/types";
import {
    getFormState,
    ZusSales,
} from "../../../_common/_stores/form-data-store";
import { StepHelperClass } from "./zus-helper-class";
import { generateRandomString } from "@/lib/utils";
import { formatMoney } from "@/lib/use-number";
import { inToFt } from "@/app/(clean-code)/(sales)/_common/utils/sales-utils";
import { CostingClass } from "./costing-class";
import { SettingsClass } from "./zus-settings-class";
export function zhInitializeState(data: GetSalesBookForm) {
    const profile = data.order?.id
        ? data.salesProfile
        : data.data?.defaultProfile;
    const salesMultiplier = profile?.coefficient
        ? formatMoney(1 / profile.coefficient)
        : 1;
    function basePrice(sp) {
        if (!sp) return sp;
        return formatMoney(sp * salesMultiplier);
    }
    const tax =
        data._taxForm?.taxByCode?.[data._taxForm?.selection?.[0]?.taxCode]
            ?._tax;

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
        metaData: {
            tax,
            paymentMethod: data.order?.meta?.payment_option,
            pricing: {
                discount: data.order?.meta?.discount,
                labour: data.order?.meta?.labor_cost,
                taxValue: data.order?.tax,
                ccc: data.order?.meta?.ccc,
                subTotal: data.order?.subTotal,
                grandTotal: data.order?.grandTotal,
            },
            salesMultiplier,
            deliveryMode: data.order.deliveryOption as any,
            po: data.order?.meta?.po,
            qb: data.order?.meta?.qb,
            salesProfileId: profile?.id,
            customer: {
                id: data.customer?.id,
                businessName: data?.customer?.businessName,
                name: data?.customer?.name,
            },
            samesAddress: data.billingAddress?.id == data.shippingAddress?.id,
            billing: {
                id: data.billingAddress?.id,
                address1: data.billingAddress?.address1,
                city: data.billingAddress?.city,
                state: data.billingAddress?.state,
                primaryPhone: data.billingAddress?.phoneNo,
                secondaryPhone: data.billingAddress?.phoneNo2,
                email: data.billingAddress?.email,
                name: data.billingAddress?.name,
                zipCode: data.billingAddress?.meta?.zip_code,
            },
            shipping: {
                id: data.shippingAddress?.id,
                address1: data.shippingAddress?.address1,
                city: data.shippingAddress?.city,
                state: data.shippingAddress?.state,
                primaryPhone: data.shippingAddress?.phoneNo,
                secondaryPhone: data.shippingAddress?.phoneNo2,
                email: data.shippingAddress?.email,
                name: data.shippingAddress?.name,
                zipCode: data.shippingAddress?.meta?.zip_code,
            },
        },
        formStatus: "ready",
    };

    data.itemArray.map((item) => {
        const uid = generateRandomString(4);

        resp.sequence.formItem.push(uid);
        resp.kvFormItem[uid] = {
            collapsed: !item.expanded,
            uid,
            id: item.item.id,
            title: "",
        };
        resp.sequence.stepComponent[uid] = [];
        let doorStepUid, mouldingStepUid;
        item.formStepArray.map((fs) => {
            // if (fs.step.title == "Door") doorStepUid = fs.step.uid;
            const stepMeta = fs.step.meta;
            const suid = `${uid}-${fs.step.uid}`;
            resp.kvStepForm[suid] = {
                componentUid: fs.item?.prodUid,
                title: fs.step.title,
                value: fs.item?.value,
                salesPrice: fs.item?.price,
                basePrice: fs.item?.basePrice || basePrice(fs.item?.price),
                stepFormId: fs.item.id,
                stepId: fs.step.id,
                meta: stepMeta as any,
            };
            resp.sequence.stepComponent[uid].push(suid);
            resp.kvFormItem[uid].currentStepUid = suid;
        });
        if (!resp.kvFormItem[uid].groupItem)
            resp.kvFormItem[uid].groupItem = {
                // componentsBasePrice: 0,
                // componentsSalesPrice: 0,
                //  type: "HPT",
                pricing: {
                    components: {
                        basePrice: 0,
                        salesPrice: 0,
                    },
                    total: {
                        basePrice: 0,
                        salesPrice: 0,
                    },
                },
                itemIds: [],
                form: {},
                //  stepUid: stepProdUid,
                qty: {
                    lh: 0,
                    rh: 0,
                    total: 0,
                },
            };
        // resp.kvFormItem[uid].groupItem
        Object.entries(item.multiComponent.components).map(([id, data]) => {
            const stepProdUid = item.item?.housePackageTool?.stepProduct?.uid;
            console.log({ spid: data.stepProduct?.uid, stepProdUid });
            if (data._doorForm) {
                resp.kvFormItem[uid].groupItem.type = "HPT";
                Object.entries(data._doorForm).map(([dimIn, doorForm]) => {
                    const formId = `${stepProdUid}-${inToFt(dimIn)}`;
                    resp.kvFormItem[uid].groupItem.itemIds?.push(formId);

                    resp.kvFormItem[uid].groupItem.form[formId] = {
                        pricing: {
                            itemPrice: {
                                salesPrice: doorForm.jambSizePrice,
                                basePrice: doorForm.jambSizePrice,
                            },
                            estimatedComponentPrice: doorForm.jambSizePrice,
                            customPrice: doorForm?.meta?.overridePrice,
                            unitPrice: doorForm.jambSizePrice,
                            totalPrice: doorForm.jambSizePrice,
                            addon: doorForm.doorPrice,
                        },
                        meta: {},
                        selected: true,
                        swing: doorForm.swing,
                        qty: {
                            lh: doorForm.lhQty,
                            rh: doorForm.rhQty,
                            total: doorForm.totalQty,
                        },
                    };
                });
            }
        });
        const costCls = new CostingClass(
            new SettingsClass("", uid, "", resp as any)
        );
        costCls.updateComponentCost();
        costCls.updateGroupedCost();
    });
    const costCls = new CostingClass(
        new SettingsClass("", "", "", resp as any)
    );
    costCls.calculateTotalPrice();
    console.log({ resp });
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
    const stepCls = new StepHelperClass(heightStepUid);
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
    return {
        sizeList,
        height: stepCls.getStepForm()?.value,
    };
}
export async function zhDeleteItem(zus: ZusSales, uid, index) {
    zus.removeItem(uid, index);
}
export function zhItemUidFromStepUid(stepUid) {
    const [uid] = stepUid?.split("-");
    return uid;
}
export function zhAddItem() {
    const state = getFormState();
    const uid = generateRandomString(4);
    const _sequence = state.sequence;
    _sequence.formItem.push(uid);
    const kvFormItem = state.kvFormItem;
    kvFormItem[uid] = {
        collapsed: false,
        uid,
        id: null,
        title: "",
    };
    const rootStep = state.data.salesSetting.rootStep;
    const itemStepUid = `${uid}-${rootStep.uid}`;
    const kvStepForm = state.kvStepForm;
    kvStepForm[itemStepUid] = {
        componentUid: "",
        title: rootStep.title,
        value: "",
        meta: rootStep.meta,
        stepId: rootStep.id,
    };
    kvFormItem[uid].currentStepUid = itemStepUid;
    _sequence.stepComponent[uid] = [itemStepUid];
    state.dotUpdate("sequence", _sequence);
    state.dotUpdate("kvFormItem", kvFormItem);
    state.dotUpdate("kvStepForm", kvStepForm);
}
