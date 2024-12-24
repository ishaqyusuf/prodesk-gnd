import { GetSalesBookForm } from "@/app/(clean-code)/(sales)/_common/use-case/sales-book-form-use-case";
import {
    DykeDoorType,
    SalesFormZusData,
} from "@/app/(clean-code)/(sales)/types";
import { getFormState } from "../../../_common/_stores/form-data-store";
import { StepHelperClass } from "./zus-helper-class";
import { generateRandomString } from "@/lib/utils";
import { formatMoney } from "@/lib/use-number";
import { inToFt } from "@/app/(clean-code)/(sales)/_common/utils/sales-utils";
import { CostingClass } from "./costing-class";
import { SettingsClass } from "./zus-settings-class";
export function zhInitializeState(data: GetSalesBookForm, copy = false) {
    const profile = data.order?.id
        ? data.salesProfile
        : data.data?.defaultProfile;
    const salesMultiplier = profile?.coefficient
        ? formatMoney(1 / profile.coefficient)
        : 1;
    // if (copy) {
    //     data.order.id = data.order.slug = data.order.orderId = null;
    // }
    function basePrice(sp) {
        if (!sp) return sp;
        return formatMoney(sp * salesMultiplier);
    }
    const selectedTax = data._taxForm?.selection?.[0];
    if (copy && selectedTax) selectedTax.salesTaxId = null;

    const resp: SalesFormZusData = {
        // data,
        setting: data.salesSetting,
        pricing: data.pricing,
        profiles: data.data.profiles,
        _taxForm: data._taxForm,
        sequence: {
            formItem: [],
            stepComponent: {},
            multiComponent: {},
        },
        kvFormItem: {},
        kvStepForm: {},
        kvFilteredStepComponentList: {},
        kvStepComponentList: {},
        currentTab: !data.order?.id ? "info" : "invoice",
        metaData: {
            salesRepId: data.order?.salesRepId || data.order.salesRep?.id,
            type: data.order?.type as any,
            id: copy ? null : data.order?.id,
            salesId: copy ? null : data.order?.orderId,
            tax: selectedTax,
            createdAt: data.order?.createdAt,
            paymentTerm: data.order?.paymentTerm as any,
            paymentDueDate: data.order?.paymentDueDate,
            goodUntil: data.order?.goodUntil,
            paymentMethod: data.order?.meta?.payment_option,
            pricing: {
                discount: data.order?.meta?.discount,
                labour: data.order?.meta?.labor_cost,
                taxValue: data.order?.tax,
                taxCode: selectedTax?.taxCode,
                ccc: data.order?.meta?.ccc,
                subTotal: data.order?.subTotal,
                grandTotal: data.order?.grandTotal,
                paid: copy ? 0 : data.paidAmount || 0,
            },
            salesMultiplier,
            deliveryMode: data.order.deliveryOption as any,
            po: data.order?.meta?.po,
            qb: data.order?.meta?.qb,
            salesProfileId: profile?.id,
            cad: data.customer?.id,
            bad: data.billingAddress?.id,
            sad: data.shippingAddress?.id,
            customer: {
                id: data.customer?.id,
                businessName: data?.customer?.businessName,
                name: data?.customer?.name,
                isBusiness: data?.customer?.businessName != null,
            },
            sameAddress: data.billingAddress?.id == data.shippingAddress?.id,
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
        console.log({ mc: item.multiComponent });

        resp.sequence.formItem.push(uid);
        resp.kvFormItem[uid] = {
            collapsed: !item.expanded,
            uid,
            id: copy ? null : item.item.id,
            title: "",
        };
        resp.sequence.stepComponent[uid] = [];
        // let doorStepUid, mouldingComponentUid;
        let itemType: DykeDoorType;
        item.formStepArray.map((fs, i) => {
            // console.log(i);
            // if (fs.step.title == "Door") doorStepUid = fs.step.uid;
            const stepMeta = fs.step.meta;
            const suid = `${uid}-${fs.step.uid}`;
            const stp = (resp.kvStepForm[suid] = {
                componentUid: fs.item?.prodUid,
                title: fs.step.title,
                value: fs.item?.value,
                salesPrice: fs.item?.price,
                basePrice: fs.item?.basePrice || basePrice(fs.item?.price),
                stepFormId: copy ? null : fs.item.id,
                stepId: fs.step.id,
                meta: stepMeta as any,
            });
            if (stp.title == "Item Type") {
                itemType = stp.value as any;
            }
            resp.sequence.stepComponent[uid].push(suid);
            resp.kvFormItem[uid].currentStepUid = suid;
        });
        if (!resp.kvFormItem[uid].groupItem)
            resp.kvFormItem[uid].groupItem = {
                // componentsBasePrice: 0,
                // componentsSalesPrice: 0,
                //  type: "HPT",
                groupUid: item.multiComponent?.uid,

                itemType,
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
        function pushItemId(itemId) {
            resp.kvFormItem[uid].groupItem.itemIds?.push(itemId);
        }
        type GroupType = (typeof resp.kvFormItem)[""]["groupItem"];
        function setType(type: GroupType["type"]) {
            resp.kvFormItem[uid].groupItem.type = type;
        }

        function addFormItem(formId, formData: GroupType["form"][""]) {
            formData.primaryGroupItem =
                formData.meta.salesItemId == item.item.id;

            // resp.kvFormItem[uid].groupItem.itemIds.push(formId); //= formData;
            resp.kvFormItem[uid].groupItem.form[formId] = formData;
        }
        Object.entries(item.multiComponent.components).map(([id, data]) => {
            const sp = item.item?.housePackageTool?.stepProduct;
            const stepProdUid =
                sp?.uid ||
                item.item.housePackageTool?.door?.stepProducts?.[0]?.uid;
            const stepProductId = sp?.id;

            const doorCount = Object.keys(data._doorForm).length;

            if (doorCount) {
                setType("HPT");
                resp.kvFormItem[uid].groupItem.hptId = copy
                    ? null
                    : item.item?.housePackageTool?.id;
                resp.kvFormItem[uid].groupItem.doorStepProductId =
                    stepProductId;
                Object.entries(data._doorForm).map(([dimIn, doorForm]) => {
                    const formId = `${stepProdUid}-${inToFt(dimIn)}`;
                    pushItemId(formId);

                    addFormItem(formId, {
                        doorId: doorForm.id,
                        pricing: {
                            itemPrice: {
                                salesPrice: doorForm.jambSizePrice,
                                basePrice: basePrice(doorForm.jambSizePrice),
                            },
                            unitPrice: doorForm.unitPrice,
                            customPrice: doorForm?.meta?.overridePrice,
                            // unitPrice: doorForm.jambSizePrice,
                            // totalPrice: doorForm.jambSizePrice,
                            addon: doorForm.doorPrice,
                        },
                        meta: {
                            salesItemId: copy ? null : data.itemId,
                        },
                        hptId: copy ? null : doorForm.housePackageToolId,

                        selected: true,
                        swing: doorForm.swing,
                        qty: {
                            lh: doorForm.lhQty,
                            rh: doorForm.rhQty,
                            total: doorForm.totalQty,
                        },
                        stepProductId,
                    });
                });
            } else if (item.item?.meta?.doorType == "Moulding") {
                const formId = `${id}`;
                pushItemId(formId);
                // console.log({ formId, stepProdUid, id });
                // console.log({
                //     m: item.item?.housePackageTool?.molding,
                //     md: data,
                // });
                setType("MOULDING");
                addFormItem(formId, {
                    hptId: copy ? null : data.hptId,
                    mouldingProductId: data.stepProduct?.dykeProductId,
                    selected: true,
                    meta: {
                        salesItemId: copy ? null : data.itemId,
                    },
                    qty: {
                        total: data.qty,
                    },
                    pricing: {
                        customPrice: data.priceTags?.moulding?.overridePrice,
                        itemPrice: {
                            basePrice: data.priceTags?.moulding?.basePrice,
                            salesPrice:
                                data.priceTags?.moulding?.salesPrice ||
                                data.priceTags?.moulding?.price,
                        },
                        unitPrice: data.priceTags?.moulding?.price,
                        addon: data.priceTags?.moulding?.addon,
                    },
                    stepProductId: data.stepProduct?.id,
                });
            } else {
                const formId = `${data.uid}`;
                pushItemId(formId);
                setType("SERVICE");
                addFormItem(formId, {
                    pricing: {
                        itemPrice: {},
                        unitPrice: data.unitPrice,
                        customPrice: data.unitPrice,
                        addon: 0,
                    },
                    selected: true,

                    qty: {
                        total: data.qty,
                    },
                    meta: {
                        description: data.description,
                        produceable: data.production,
                        taxxable: data.tax,
                        salesItemId: copy ? null : data.itemId,
                    },
                    stepProductId: null,
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
    const rootStep = state.setting.rootStep;
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
