"use client";

import { IStepProducts, StepProductProps } from ".";

import { getMouldingStepProduct } from "../../../../_action/get-dyke-step-product";

import { useContext, useEffect, useState } from "react";
import {
    DykeItemFormContext,
    useDykeCtx,
    useDykeForm,
} from "../../../../_hooks/form-context";
import { DykeDoorType, DykeStep } from "../../../../../type";
import {
    getSlabDoorTypes,
    getStepProduct,
} from "../../../../_action/get-dyke-step-product";
import { toast } from "sonner";
import { getNextDykeStepAction } from "../../../../_action/get-next-dyke-step";
import { getDykeStepDoors } from "../../../../_action/get-dyke-step-doors";
import { doorQueryBuilder } from "../../../../../_utils/door-query-builder";

import { useModal } from "@/components/common/modal-old/provider";
import { Button } from "@/components/ui/button";
import EditStepItemModal from "../../../modals/edit-step-item-modal";
import { SaveStepProductExtra } from "../../../../_action/save-step-product";
import { _deleteDoorStep, _deleteStepItem } from "./_actions";
import { calculateComponentPrices } from "./calculate-prices";
import calculateComponentPrice from "./calculate-component-price";
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
            // console.log("QUERY>", query);
            const _props = { ...query, stepId: stepForm?.step?.id };
            // console.log(_props);
            const { result: prods } = await getDykeStepDoors(_props as any);
            _stepProducts = prods;
            // setStepProducts(prods);
        } else if (doorType == "Moulding" && stepFormTitle == "Moulding") {
            setStep("Moulding");
            const specie = item.get.getMouldingSpecie();
            const prods = await getMouldingStepProduct(specie);
            // console.log(prods);
            _stepProducts = prods;
            // setStepProducts(prods);
        } else if (
            doorType == "Door Slabs Only" &&
            stepFormTitle == "Door Type"
        ) {
            setStep("Slab");
            setStepProducts(await getSlabDoorTypes());
            // if(stepFormTitle == 'Height' )
        } else {
            const _stepProds = await getStepProduct(stepForm?.step?.id);
            // console.log(_stepProds);
            // setStepProducts(_stepProds);
            _stepProducts = _stepProds;
        }
        if (_stepProducts)
            setStepProducts(
                calculateComponentPrice({
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
            if (
                stepProd?.product?.meta.priced &&
                !isMultiSection &&
                stepTitle !== "Moulding"
            )
                price = stepProd?.product?.price;

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
                case "Casing":
                    if (doorType != "Moulding")
                        form.setValue(
                            `itemArray.${item.rowIndex}.item.housePackageTool.casingId`,
                            stepProd?.dykeProductId
                        );
                    else {
                        //
                    }
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
                meta: {
                    custom,
                } as any,
                // title: stepProd?.product?.description,
            };
            form.setValue(
                `itemArray.${item.rowIndex}.item.formStepArray.${stepIndex}.item` as any,
                data
            );
            const nextSteps = await getNextDykeStepAction(
                stepForm.step as any,
                stepProd?.product as any,
                stepProd,
                [],
                doorType
            );

            if (nextSteps) {
                for (let i = item.formStepArray.length - 1; i > stepIndex; i--)
                    item.removeStep(i);

                item.appendStep(nextSteps as any);
                item.toggleStep(item.openedStepIndex + nextSteps.length);
            } else toast.error("Next step not found");
        });
    }
    const modal = useModal();
    function onCreate(stepItem: IStepProducts[0]) {
        // console.log(stepItem);
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
            product: {
                id: prodId,
                createdAt,
                updatedAt,
                value,
                description,
                img,
                meta,
                query,
                ...prod
            },
            dykeProductId,
            ...stepProd
        } = itm ||
        stepProducts.filter((s) => (s.product as any).query)[0] ||
        stepProducts[0] ||
        ({
            dykeStepId: stepForm.step?.id,
            nextStepId: null,
            product: {
                meta: {},
            },
        } as IStepProducts[0]);
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
            console.log(prods.length, index);

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
