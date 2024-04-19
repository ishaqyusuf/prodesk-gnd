import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import HousePackageTool from "./house-package-tool";
import { useContext, useEffect, useState } from "react";
import {
    DykeItemFormContext,
    useDykeCtx,
    useDykeForm,
} from "../../form-context";
import { DykeDoorType, DykeForm, DykeStep } from "../../type";
import ShelfItemIndex from "./shelf-item";
import Image from "next/image";
import { env } from "@/env.mjs";
import { Label } from "@/components/ui/label";
import {
    getMouldingStepProduct,
    getStepProduct,
} from "../_action/get-dyke-step-product";
import { toast } from "sonner";
import { getNextDykeStepAction } from "../_action/get-next-dyke-step";
import { Icons } from "@/components/_v1/icons";
import {
    Menu,
    MenuItem,
} from "@/components/_v1/data-table/data-table-row-actions";
import Money from "@/components/_v1/money";
import { timeout } from "@/lib/timeout";
import { getDykeStepDoors } from "../_action/get-dyke-step-doors";
import { doorQueryBuilder } from "../../_utils/door-query-builder";

import SVG from "react-inlinesvg";
import { useModal } from "@/components/common/modal-old/provider";
import { Button } from "@/components/ui/button";
import EditStepItemModal from "./modals/edit-step-item-modal";
import { SaveStepProductExtra } from "../_action/save-step-product";
import LineItemSection from "./line-item-section";
interface Props {
    stepForm: DykeStep;
    stepIndex: number;
}
export function DykeItemStepSection({ stepForm, stepIndex }: Props) {
    const form = useDykeForm();
    const item = useContext(DykeItemFormContext);
    const stepValue = form.watch(
        `itemArray.${item.rowIndex}.item.formStepArray.${stepIndex}.item.value` as any
    );
    return (
        <Collapsible
            className={cn(stepForm?.item?.meta?.hidden && "hidden")}
            open={stepIndex == item.openedStepIndex}
            // onOpenChange={() => item.openBlock(stepIndex)}
        >
            <CollapsibleTrigger asChild>
                <div className="flex bg-accent">
                    <button
                        className="flex  w-full p-2 px-4 border space-x-2"
                        onClick={(e) => {
                            e.preventDefault();
                            if (stepForm?.item?.meta?.hidden) return;
                            item.toggleStep(stepIndex);
                        }}
                    >
                        <span className="font-semibold">
                            {stepForm?.step?.title}:
                        </span>
                        <span>{stepValue}</span>
                    </button>
                    <div className="px-2">
                        <Menu Icon={Icons.more}>
                            <MenuItem
                                SubMenu={
                                    <>
                                        <MenuItem>Before</MenuItem>
                                        <MenuItem>After</MenuItem>
                                    </>
                                }
                            >
                                New Step
                            </MenuItem>
                        </Menu>
                    </div>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-8 border">
                {stepForm?.step?.title == "House Package Tool" ? (
                    <HousePackageTool />
                ) : stepForm?.step?.title == "Shelf Items" ? (
                    <>
                        <ShelfItemIndex />
                    </>
                ) : stepForm?.step?.title == "Line Item" ? (
                    <>
                        <LineItemSection />
                    </>
                ) : (
                    <StepProducts
                        stepForm={stepForm}
                        stepIndex={stepIndex}
                        rowIndex={item.rowIndex}
                    />
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}

interface StepProductProps extends Props {
    rowIndex;
}
export type IStepProducts = Awaited<ReturnType<typeof getStepProduct>>;
function StepProducts({ stepForm, stepIndex, rowIndex }: StepProductProps) {
    const [stepProducts, setStepProducts] = useState<IStepProducts>([]);
    const form = useDykeForm();
    // stepProducts[0].

    const item = useContext(DykeItemFormContext);
    let doorType = item.get.doorType();
    const isMoulding = doorType == "Moulding";
    const stepFormTitle = stepForm.step?.title;
    const ctx = useDykeCtx();
    const load = async () => {
        if (stepForm?.item?.meta?.hidden) return;
        if (stepFormTitle == "Door") {
            const query = doorQueryBuilder(
                item.get.getFormStepArray(),
                item.get.doorType()
            );
            const { result: prods } = await getDykeStepDoors(
                { ...query, stepId: stepForm?.step?.id } as any
                // query.q,
                // query.omit,
                // query.qty,
                // stepForm?.step?.id,
                // query.query
            );
            // console.log(prods);
            setStepProducts(prods);
        } else if (doorType == "Moulding" && stepFormTitle == "Moulding") {
            const specie = item.get.getMouldingSpecie();
            const prods = await getMouldingStepProduct(specie);
            // console.log(prods);

            setStepProducts(prods);
        } else setStepProducts(await getStepProduct(stepForm?.step?.id));
    };
    useEffect(() => {
        load();
    }, []);
    async function selectProduct(stepProd: IStepProducts[0]) {
        // return;
        ctx.startLoadingStep(async () => {
            await timeout(1000);
            const val = stepProd.product.title || stepProd.product.value;
            const hpt = form.getValues(
                `itemArray.${item.rowIndex}.item.housePackageTool`
            );
            // form.getValues('order.id')

            switch (stepForm.step?.title) {
                case "Height":
                    form.setValue(
                        `itemArray.${item.rowIndex}.item.housePackageTool`,
                        {
                            height: val,
                            totalDoors: 0,
                            totalPrice: 0,
                            doorType: hpt.doorType,
                            // doors: {},
                            _doorForm: {
                                ...(hpt._doorFormDefaultValue as any),
                            },
                            _doorFormDefaultValue: {
                                ...hpt._doorFormDefaultValue,
                            },
                        }
                    );
                    break;
                case "Jamb Size":
                    form.setValue(
                        `itemArray.${item.rowIndex}.item.housePackageTool.jambSizeId`,
                        stepProd.dykeProductId
                    );
                    break;
                case "Door":
                    form.setValue(
                        `itemArray.${item.rowIndex}.item.housePackageTool.dykeDoorId`,
                        stepProd.dykeProductId
                    );
                    break;
                case "Casing":
                    if (doorType != "Moulding")
                        form.setValue(
                            `itemArray.${item.rowIndex}.item.housePackageTool.casingId`,
                            stepProd.dykeProductId
                        );
                    else {
                        //
                    }
                    break;
                // case "Moulding":
                //     form.setValue(
                //         `itemArray.${item.rowIndex}.item.housePackageTool.moldingId`,
                //         stepProd.dykeProductId
                //     );
                //     break;
                case "Specie":
                    break;
                case "Door Type":
                    switch (stepProd.product.title) {
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
                                stepProd.dykeProductId
                            );
                        case "Interior":
                        case "Exterior":
                        case "Bifold":
                        case "Garage":
                        case "Moulding":
                            console.log(".");
                            form.setValue(
                                `itemArray.${item.rowIndex}.item.housePackageTool.doorType`,
                                stepProd.product.title as any
                            );
                            doorType = stepProd.product.title;
                            break;
                    }
                    break;
                case "Cutdown Height":
                    break;
            }

            const data: DykeStep["item"] = {
                value: val,
                // qty: stepProd.product.qty,
                // price: stepProd.product.price,
                stepId: stepProd.dykeStepId,
                // title: stepProd.product.description,
            } as any;

            form.setValue(
                `itemArray.${item.rowIndex}.item.formStepArray.${stepIndex}.item` as any,
                data
            );

            const nextSteps = await getNextDykeStepAction(
                stepForm.step as any,
                stepProd.product as any,
                stepProd,
                [],
                doorType
            );
            // console.log({ stepForm, nextStep });
            if (nextSteps) {
                for (let i = item.formStepArray.length - 1; i > stepIndex; i--)
                    item.removeStep(i);
                item.appendStep(nextSteps as any);
                item.toggleStep(item.openedStepIndex + nextSteps.length);
            } else toast.error("Next step not found");
        });
        // if(val == 'Shelf Items') {
        //     item.appendStep({
        //         step: {
        //             title: 'Shelf Items'
        //         }
        //     })
        // }
        // console.log(form.getValues());
        // console.log([item.rowIndex, stepIndex]);
        // toast.success("selected");
        //get next step
    }
    const modal = useModal();
    function onCreate(stepItem: IStepProducts[0]) {
        console.log("oncreate");
        console.log(stepItem);

        setStepProducts((cd) => {
            const index = cd.findIndex((c) => c.id == stepItem.id);
            const ret = [...cd];

            if (index > -1) ret[index] = stepItem;
            else ret.push(stepItem);
            return ret;
        });
    }
    function openStepForm(item?) {
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
        } = item ||
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

        const _item = item
            ? {
                  ...item,
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
                moulding={isMoulding && stepFormTitle == "Moulding"}
                item={_item}
            />
        );
    }
    return (
        <div className="">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {stepProducts?.map((b, i) => (
                    <div className="relative p-4 group" key={i}>
                        <div className=" hidden group-hover:flex absolute top-0 right-0  flex-col space-y-2 p-1 rounded-lg shadow-xl -m-2 bg-white z-10 border">
                            <Button
                                size="icon"
                                variant={"outline"}
                                className="w-8 h-8"
                                onClick={() => {
                                    openStepForm(b);
                                }}
                            >
                                <Icons.edit className="w-4 h-4" />
                            </Button>
                        </div>
                        <button
                            disabled={ctx.loadingStep}
                            className={cn(
                                "w-full  flex flex-col items-center border-2 border-muted-foreground/10  hover:border-muted-foreground rounded  space-y-2 justify-end h-[200px] overflow-hidden p-2"
                            )}
                            onClick={() => {
                                selectProduct(b);
                            }}
                        >
                            {b.product.img ? (
                                <Image
                                    className="cursor-pointer"
                                    width={100}
                                    height={100}
                                    src={`${env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/dyke/${b.product.img}`}
                                    alt={
                                        b.product.description || b.product.value
                                    }
                                />
                            ) : (b.product.meta as any)?.svg ? (
                                <SVG src={b.product.meta?.svg} />
                            ) : b.product.meta?.url ? (
                                <object
                                    data={b.product.meta?.url}
                                    type={"image/svg+xml"}
                                />
                            ) : null}
                            <Label className="text-sm">{b.product.title}</Label>
                        </button>
                    </div>
                ))}
                <div className="p-4">
                    <button
                        onClick={() => {
                            openStepForm();
                        }}
                        className={cn(
                            "border hover:shadow-xl hover:bg-slate-200 rounded-lg flex flex-col justify-center items-center h-[200px] w-full"
                            // stepForm?.step?.title == "Door Type" && "hidden"
                        )}
                    >
                        <Icons.add />
                    </button>
                </div>
            </div>
            <div className="flex justify-center">
                {ctx.loadingStep && (
                    <Icons.spinner className="h-8 w-8 animate-spin" />
                )}
            </div>
        </div>
    );
}
