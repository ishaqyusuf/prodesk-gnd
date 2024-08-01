"use client";

import {
    IStepProducts,
    StepProductProps,
} from "../components/step-items-list/item-section/step-items";

import { getMouldingStepProduct } from "../_action/get-dyke-step-product";

import { useContext, useEffect, useState } from "react";
import { DykeItemFormContext, useDykeCtx, useDykeForm } from "./form-context";
import { DykeDoorType, DykeStep } from "../../type";
import {
    getSlabDoorTypes,
    getStepProduct,
} from "../_action/get-dyke-step-product";
import { toast } from "sonner";
import { getNextDykeStepAction } from "../_action/get-next-dyke-step";
import { getDykeStepDoors } from "../_action/get-dyke-step-doors";
import { doorQueryBuilder } from "../../_utils/door-query-builder";

import { useModal } from "@/components/common/modal-old/provider";
import EditStepItemModal from "../components/modals/edit-step-item-modal";
import { SaveStepProductExtra } from "../_action/save-step-product";
import {
    _deleteDoorStep,
    _deleteStepItem,
} from "../components/step-items-list/item-section/step-items/_actions";
import { calculateComponentPrices } from "../components/step-items-list/item-section/step-items/calculate-prices";
import { initStepComponents } from "../components/step-items-list/item-section/step-items/init-step-components";
export default function useStepItems({
    stepForm,
    stepIndex,
    stepProducts,
    setStepProducts,
}: StepProductProps) {
    const form = useDykeForm();

    const item = useContext(DykeItemFormContext);

    let doorType = item.get.doorType();
    const isMoulding = doorType == "Moulding";
    const stepFormTitle = stepForm.step?.title;
    const ctx = useDykeCtx();
    const [step, setStep] = useState<"Door" | "Moulding" | "Slab" | null>(null);
    const load = async () => {
        const doorType = item.get.doorType();
        if (stepForm?.item?.meta?.hidden) return;
        let _stepProducts: IStepProducts = [];
        if (stepFormTitle == "Door") {
            setStep("Door");
            const query = doorQueryBuilder(
                item.get.getFormStepArray(),
                item.get.doorType()
            );
            console.log("QUERY>", query);
            const _props = { ...query, stepId: stepForm?.step?.id };
            const prods = await getDykeStepDoors(_props as any);
            _stepProducts = prods;
        } else if (doorType == "Moulding" && stepFormTitle == "Moulding") {
            setStep("Moulding");
            const specie = item.get.getMouldingSpecie();
            const prods = await getMouldingStepProduct(specie);
            _stepProducts = prods as any;
        } else if (
            doorType == "Door Slabs Only" &&
            stepFormTitle == "Door Type"
        ) {
            setStep("Slab");
            _stepProducts = await getSlabDoorTypes();
            // setStepProducts(await getSlabDoorTypes());
            // if(stepFormTitle == 'Height' )
        } else {
            const _stepProds = await getStepProduct(stepForm?.step?.id);
            _stepProducts = _stepProds;
        }
        if (_stepProducts)
            setStepProducts(
                await initStepComponents({
                    stepProducts: _stepProducts,
                    stepForm,
                    stepArray: item.get.getFormStepArray(),
                    stepIndex,
                })
            );
    };
    const uid = item.get.uid();

    useEffect(() => {
        load();
        allowsCustom();
        calculateComponentPrices(form, item.rowIndex);
    }, []);
    const t = stepForm?.step?.title;
    const isMultiSection = t == "Moulding" || t == "Door";
    async function selectProduct(
        currentState,
        stepProd?: IStepProducts[0],
        custom = false
    ) {
        // return;
        let proceed = !stepProd;
        if (isMultiSection && !proceed && stepProd) {
            item.multi.select(
                currentState,
                stepProd as any,
                stepFormTitle,
                () => {
                    selectProduct(false);
                }
            );
            return;
        }
        if (proceed) {
            stepProd = item.multi.validateMultiSelect(
                stepProducts,
                stepFormTitle
            ) as any;
        }
        if (!stepProd || !stepProd?.product) {
            toast.error("Unable to proceed, no item selected");
            return;
        }
        ctx.startLoadingStep(async () => {
            const val = stepProd?.product?.title || stepProd?.product?.value;
            const hpt = form.getValues(
                `itemArray.${item.rowIndex}.item.housePackageTool`
            );
            const stepTitle = stepForm.step?.title;
            let price = 0;
            if (!isMultiSection && stepTitle !== "Moulding") {
                price = stepProd._metaData?.price || 0;
            }

            switch (stepTitle) {
                case "Height":
                    const _doorType: DykeDoorType = hpt.doorType as any;
                    form.setValue(
                        `itemArray.${item.rowIndex}.item.housePackageTool`,
                        {
                            height: val,
                            totalDoors: 0,
                            totalPrice: 0,
                            doorType: _doorType,
                            _doorForm: {
                                ...(hpt._doorFormDefaultValue as any),
                            },
                            _doorFormDefaultValue: {
                                ...hpt._doorFormDefaultValue,
                            },
                            meta: {
                                priceTags:
                                    _doorType == "Moulding"
                                        ? {
                                              moulding: {
                                                  price: 0,
                                                  addon: 0,
                                              },
                                              components: 0,
                                          }
                                        : {
                                              components: 0,
                                              doorSizePriceTag: {},
                                          },
                            },
                            stepProduct: null as any,
                        }
                    );
                    break;
                case "Jamb Size":
                    form.setValue(
                        `itemArray.${item.rowIndex}.item.housePackageTool.jambSizeId`,
                        stepProd?.dykeProductId
                    );
                    break;
                case "Door":
                    form.setValue(
                        `itemArray.${item.rowIndex}.item.housePackageTool.dykeDoorId`,
                        stepProd?.dykeProductId
                    );
                    break;
                case "Specie":
                    break;
                case "Item Type":
                    form.setValue(
                        `itemArray.${item.rowIndex}.multiComponent.components`,
                        {}
                    );
                    form.setValue(
                        `itemArray.${item.rowIndex}.item.meta.doorType`,
                        stepProd?.product?.title as any
                    );
                    switch (stepProd?.product?.title) {
                        case "Services":
                            await item.multi.initServices();
                            break;
                        case "Shelf Items":
                            form.setValue(
                                `itemArray.${item.rowIndex}.item.housePackageTool`,
                                null as any
                            );
                            //clean up package tools
                            break;
                        case "Moulding":
                            form.setValue(
                                `itemArray.${item.rowIndex}.item.housePackageTool.moldingId`,
                                stepProd?.dykeProductId
                            );
                        case "Interior":
                        case "Exterior":
                        case "Bifold":
                        case "Garage":
                        case "Moulding":
                        case "Door Slabs Only":
                            // console.log(".");
                            form.setValue(
                                `itemArray.${item.rowIndex}.item.housePackageTool.doorType`,
                                stepProd?.product?.title as any
                            );
                            doorType = stepProd?.product?.title;
                            break;
                    }
                    break;
                case "Cutdown Height":
                    break;
            }
            const data: Partial<DykeStep["item"]> = {
                value: val,
                // qty: stepProd?.product?.qty,
                price,
                stepId: stepProd?.dykeStepId,
                prodUid: stepProd.uid,
                meta: {
                    custom,
                } as any,
                // title: stepProd?.product?.description,
            };

            const formSteps = form.getValues(
                `itemArray.${item.rowIndex}.item.formStepArray`
            );
            formSteps[stepIndex].item = data as any;
            form.setValue(
                `itemArray.${item.rowIndex}.item.formStepArray.${stepIndex}.item` as any,
                data
            );
            const seq =
                form.getValues(`itemArray.${item.rowIndex}.stepSequence`) || {};
            const stepSeq = stepProd.meta?.stepSequence;
            if (stepSeq?.length) {
                console.log(stepProd);
                seq[stepProd.uid] = stepSeq;
                form.setValue(
                    `itemArray.${item.rowIndex}.stepSequence.${stepProd.uid}`,
                    stepSeq as any
                );
            }
            let nextStepId = null;
            for (let si = stepIndex; si > -1; si--) {
                if (nextStepId) continue;
                const formStep = formSteps[si];
                const formSeq = seq[formStep.item.prodUid];
                if (formSeq) {
                    formSeq.map(({ id: fsId }) => {
                        const existingStep = formSteps.find(
                            (f) => f.step.id == fsId
                        );

                        if (!existingStep && !nextStepId) nextStepId = fsId;
                    });
                }
            }
            console.log({ stepsIds: formSteps.map((s) => s.step.id) });

            if (nextStepId) {
                stepProd.nextStepId = nextStepId;
            }
            const nextSteps = await getNextDykeStepAction(
                stepForm.step as any,
                nextStepId ? null : (stepProd?.product as any),
                stepProd,
                [],
                doorType
            );
            console.log({ nextSteps, nextStepId });
            if (nextSteps.length) {
                const currentNextStep = item.formStepArray[stepIndex + 1];
                if (currentNextStep) {
                    if (currentNextStep.step?.id == nextSteps[0]?.step?.id) {
                        item.toggleStep(item.openedStepIndex + 1);
                        return;
                    }
                }
                for (let i = item.formStepArray.length - 1; i > stepIndex; i--)
                    item.removeStep(i);
                item.appendStep(nextSteps as any);
                item.toggleStep(item.openedStepIndex + nextSteps.length);
            } else toast.error("Next step not found");
        });
    }
    const modal = useModal();
    function onCreate(stepItem: IStepProducts[number]) {
        if (stepItem.door) stepItem.product = stepItem.door as any;
        console.log(stepItem);
        setStepProducts((cd) => {
            const index = cd.findIndex((c) => c.id == stepItem.id);
            const ret = [...cd];

            if (index > -1) ret[index] = stepItem;
            else ret.push(stepItem);
            return ret;
        });
    }
    function openStepForm(itm?) {
        const {
            id,
            uid,
            custom,
            sortIndex,
            doorId,
            door: { query } = {} as any,
            product: {
                id: prodId,
                createdAt,
                updatedAt,
                value,
                description,
                img,
                meta,
                // query,
                ...prod
            },
            dykeProductId,
            ...stepProd
        }: IStepProducts[0] = itm ||
            stepProducts.filter((s) => !s._metaData.hidden)[0] || {
                dykeStepId: stepForm.step?.id,
                nextStepId: null,
                product: {
                    meta: {},
                },
            };
        if (!itm) stepProd.meta.deleted = {};
        let _meta: SaveStepProductExtra["_meta"] = {
            isMoulding: doorType == "Moulding",
            doorType: doorType,
            stepTitle: stepFormTitle,
            doorQuery: query,
        };
        const _item = itm
            ? {
                  ...itm,
                  _meta,
              }
            : ({
                  ...stepProd,
                  product: {
                      ...prod,
                      meta: {},
                  },
                  _meta,
              } as any);

        modal?.open(
            <EditStepItemModal
                onCreate={onCreate}
                root={isRoot}
                stepTitle={stepFormTitle}
                mainForm={form}
                rowIndex={item.rowIndex}
                moulding={isMoulding && stepFormTitle == "Moulding"}
                item={_item}
            />
        );
    }

    async function deleteStepItem(index, stepProd: IStepProducts[0]) {
        switch (step) {
            case "Door":
                await _deleteDoorStep(stepProd);
                break;
            default:
                await _deleteStepItem(stepProd);
        }
        setStepProducts((current) => {
            const prods = [
                ...current.slice(0, index),
                ...current.slice(index + 1),
            ];
            return prods;
        });
    }
    const isRoot = stepFormTitle == "Item Type";
    const [allowCustom, setAllowCustom] = useState(false);
    const customsChanged = form.watch(
        "data.settings.dyke.customInputSection.changed"
    );
    useEffect(() => {
        allowsCustom();
    }, [customsChanged]);
    function allowsCustom() {
        const settings = form.getValues(
            "data.settings.dyke.customInputSection.sections"
        );
        const title = stepForm.step.title;
        setAllowCustom(
            settings?.findIndex(
                (s) => s.name?.toLowerCase() == title?.toLowerCase()
            ) > -1
        );
    }
    return {
        load,
        allowCustom,
        isRoot,
        stepProducts,
        step,
        openStepForm,
        isMultiSection,
        selectProduct,
        deleteStepItem,
        ctx,
    };
}
