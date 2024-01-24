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
import { DykeForm, DykeStep } from "../../type";
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
import { getWidthFromStep } from "../../utils/get-width-from-step";
import { getDykeStepDoors } from "../_action/get-dyke-step-doors";
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
            className={cn("")}
            open={stepIndex == item.openedStepIndex}
            // onOpenChange={() => item.openBlock(stepIndex)}
        >
            <CollapsibleTrigger asChild>
                <div className="flex bg-accent">
                    <button
                        className="flex  w-full p-2 px-4 border space-x-2"
                        onClick={(e) => {
                            e.preventDefault();
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
    useEffect(() => {
        (async () => {
            if (stepForm.step?.title == "Door") {
                const steps: DykeForm["itemArray"][0]["item"]["formStepArray"] =
                    form.getValues(
                        `itemArray.${rowIndex}.item.formStepArray` as any
                    );
                console.log(steps);
                let [w, height] = steps
                    .filter((step) =>
                        ["Width", "Height"].some((s) => step.step.title == s)
                    )
                    .map((s) => s.item.value);
                const { width, qty } = getWidthFromStep(w);
                const prods = await getDykeStepDoors(
                    width,
                    height,
                    qty,
                    stepForm?.step?.id
                );
                // console.log(prods);
                setStepProducts(prods);
            } else setStepProducts(await getStepProduct(stepForm?.step?.id));
        })();
    }, []);
    async function selectProduct(stepProd: IStepProducts[0]) {
        // return;
        ctx.startLoadingStep(async () => {
            await timeout(1000);
            const val = stepProd.product.title || stepProd.product.value;
            form.setValue(
                `itemArray.${item.rowIndex}.item.meta.shelfMode`,
                false
            );
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
                stepProd.nextStepId
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
    return (
        <div className="">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                {stepProducts?.map((b, i) => (
                    <button
                        disabled={ctx.loadingStep}
                        className="flex flex-col items-center border-2 border-transparent hover:border-muted-foreground rounded p-2 space-y-2 justify-end"
                        onClick={() => {
                            selectProduct(b);
                        }}
                        key={i}
                    >
                        {b.product.img && (
                            <Image
                                className="cursor-pointer"
                                width={100}
                                height={100}
                                src={`${env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/dyke/${b.product.img}`}
                                alt={b.product.description || b.product.value}
                            />
                        )}
                        {(b.product.meta as any)?.svg && (
                            <object
                                data={b.product.meta?.svg}
                                type={"image/svg+xml"}
                            />
                        )}
                        <Label className="text-sm">{b.product.title}</Label>
                        {
                            <div
                                className={cn(
                                    "text-xs font-bold",
                                    !b.product.price && "opacity-0"
                                )}
                            >
                                <Money value={b.product.price} />{" "}
                                <span>x{b.product.qty}</span>
                            </div>
                        }
                    </button>
                ))}
            </div>
            <div className="flex justify-center">
                {ctx.loadingStep && (
                    <Icons.spinner className="h-8 w-8 animate-spin" />
                )}
            </div>
        </div>
    );
}
