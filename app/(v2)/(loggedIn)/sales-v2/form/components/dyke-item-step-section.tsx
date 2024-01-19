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
import { DykeStep } from "../../type";
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
    const dykeCtx = useDykeCtx();
    return (
        <Collapsible
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
                    <StepProducts stepForm={stepForm} stepIndex={stepIndex} />
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}

interface StepProductProps extends Props {}
export type IStepProducts = Awaited<ReturnType<typeof getStepProduct>>;
function StepProducts({ stepForm, stepIndex }: StepProductProps) {
    const [stepProducts, setStepProducts] = useState<IStepProducts>([]);
    const form = useDykeForm();
    const item = useContext(DykeItemFormContext);
    const ctx = useDykeCtx();
    useEffect(() => {
        (async () => {
            setStepProducts(await getStepProduct(stepForm?.step?.id));
        })();
    }, []);
    async function selectProduct(stepProd: IStepProducts[0]) {
        ctx.startLoadingStep(async () => {
            const val = stepProd.product.title || stepProd.product.value;

            form.setValue(
                `itemArray.${item.rowIndex}.item.formStepArray.${stepIndex}.item.value` as any,
                val
            );
            const nextStep = await getNextDykeStepAction(
                stepForm.step as any,
                stepProd.product
            );
            console.log({ stepForm, nextStep });
            if (nextStep) {
                for (let i = item.formStepArray.length - 1; i > stepIndex; i--)
                    item.removeStep(i);
                item.appendStep(nextStep as any);
                item.toggleStep(item.openedStepIndex + 1);
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
                        className="flex flex-col items-center border-2 border-transparent hover:border-muted-foreground rounded p-2 space-y-2 justify-end"
                        onClick={() => {
                            selectProduct(b);
                        }}
                        key={i}
                    >
                        {b.product.img && (
                            <Image
                                className="cursor-pointer"
                                width={150}
                                height={150}
                                src={`${env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/dyke/${b.product.img}`}
                                alt={b.product.description || b.product.value}
                            />
                        )}
                        <Label className="text-sm">{b.product.title}</Label>
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
