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
import { getStepProduct } from "../_action/get-dyke-step-product";
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
    const ctx = useDykeCtx();
    const load = async () => {
        if (stepForm?.item?.meta?.hidden) return;
        if (stepForm.step?.title == "Door") {
            const query = doorQueryBuilder(
                form.getValues(
                    `itemArray.${rowIndex}.item.formStepArray` as any
                ),
                form.getValues(
                    `itemArray.${rowIndex}.item.housePackageTool.doorType` as any
                )
            );
            // console.log(query);

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
                    form.setValue(
                        `itemArray.${item.rowIndex}.item.housePackageTool.casingId`,
                        stepProd.dykeProductId
                    );
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
                        case "Interior":
                        case "Exterior":
                        case "Bifold":
                        case "Garage":
                        case "Moldings":
                            form.setValue(
                                `itemArray.${item.rowIndex}.item.housePackageTool.doorType`,
                                stepProd.product.title as any
                            );
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
            const doorType = form.getValues(
                `itemArray.${item.rowIndex}.item.housePackageTool.doorType`
            ) as DykeDoorType;
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
                                    const { ...data } = b;
                                    console.log(data);

                                    modal?.open(
                                        <EditStepItemModal
                                            onCreate={onCreate}
                                            item={data as any}
                                        />
                                    );
                                }}
                            >
                                <Icons.edit className="w-4 h-4" />
                            </Button>
                            {/* <Button
                                size="icon"
                                className="w-8 h-8"
                                onClick={() => {
                                    const { id, ...data } = b;
                                    modal?.open(
                                        <EditStepItemModal
                                            onCreate={onCreate}
                                            item={data as any}
                                        />
                                    );
                                }}
                            >
                                <Icons.copy className="w-4 h-4" />
                                 
                            </Button> */}
                        </div>
                        <button
                            disabled={ctx.loadingStep}
                            className={cn(
                                "w-full  flex flex-col items-center border-2 border-transparent hover:border-muted-foreground rounded  space-y-2 justify-end"
                            )}
                            onClick={() => {
                                selectProduct(b);
                            }}
                        >
                            {b.product.img && !(b.product.meta as any)?.svg && (
                                <Image
                                    className="cursor-pointer"
                                    width={100}
                                    height={100}
                                    src={`${env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/dyke/${b.product.img}`}
                                    alt={
                                        b.product.description || b.product.value
                                    }
                                />
                            )}
                            {(b.product.meta as any)?.svg &&
                                (b.product.meta?.svg ? (
                                    <SVG src={b.product.meta?.svg} />
                                ) : b.product.meta?.url ? (
                                    <object
                                        data={b.product.meta?.url}
                                        type={"image/svg+xml"}
                                    />
                                ) : null)}
                            <Label className="text-sm">{b.product.title}</Label>
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => {
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
                                ...prod
                            },
                            dykeProductId,
                            ...stepProd
                        } = stepProducts[0] as IStepProducts[0];
                        modal?.open(
                            <EditStepItemModal
                                onCreate={onCreate}
                                item={
                                    {
                                        ...stepProd,
                                        product: {
                                            ...prod,
                                            meta: {},
                                        },
                                    } as any
                                }
                            />
                        );
                    }}
                    className="border hover:shadow-xl hover:bg-slate-200 rounded-lg flex flex-col justify-center items-center"
                >
                    <Icons.add />
                </button>
            </div>
            <div className="flex justify-center">
                {ctx.loadingStep && (
                    <Icons.spinner className="h-8 w-8 animate-spin" />
                )}
            </div>
        </div>
    );
}
