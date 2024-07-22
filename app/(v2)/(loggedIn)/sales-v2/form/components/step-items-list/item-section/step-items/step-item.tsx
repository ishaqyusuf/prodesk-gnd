import { useContext } from "react";
import { DykeItemFormContext } from "../../../../_hooks/form-context";
import { cn, safeFormText } from "@/lib/utils";
import Image from "next/image";
import { env } from "@/env.mjs";
import SVG from "react-inlinesvg";
import { Label } from "@/components/ui/label";
import Money from "@/components/_v1/money";
import { IStepProducts } from ".";
import { Icons } from "@/components/_v1/icons";

interface Props {
    item: IStepProducts[number];
    select;
    loadingStep;
    isMultiSection;
    isRoot;
    stepTitle?;
}
export function StepItem({
    item,
    select,
    loadingStep,
    isMultiSection,
    stepTitle,
    isRoot,
}: Props) {
    const ctx = useContext(DykeItemFormContext);
    const selected = isMultiSection
        ? ctx.multi.watchItemSelected(safeFormText(item.product.title))
        : false;
    const doorPriceCount = Object.keys(
        item.product.meta.doorPrice || {}
    ).length;
    return (
        <button
            disabled={loadingStep}
            className={cn(
                "w-full  flex flex-col items-center border-2 border-muted-foreground/10  hover:border-muted-foreground rounded  space-y-2 justify-end h-[200px] overflow-hidden p-2",
                selected && "hover:border-green-500 border-green-500"
            )}
            onClick={() => {
                select(selected, item);
            }}
        >
            {item.product.img ? (
                <Image
                    className="cursor-pointer"
                    width={100}
                    height={100}
                    src={`${env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/dyke/${item.product.img}`}
                    alt={item.product.description || item.product.value}
                />
            ) : (item.product.meta as any)?.svg ? (
                <SVG src={item.product.meta?.svg} />
            ) : item.product.meta?.url ? (
                <object data={item.product.meta?.url} type={"image/svg+xml"} />
            ) : null}
            <Label className="text-sm">
                {isRoot
                    ? item.product?.value || item.product.title
                    : item.product.title}
            </Label>
            <div className="text-xs absolute top-0 right-0 p-4 px-8 font-bold">
                {stepTitle == "Door" ? (
                    <span className="inline-flex space-x-1 text-muted-foreground">
                        {doorPriceCount > 0 && (
                            <>
                                <Icons.dollar className="w-4 h-4" />
                                <span>{doorPriceCount}</span>
                            </>
                        )}
                    </span>
                ) : (
                    item._estimate.price > 0 && (
                        <Money value={item._estimate.price} />
                    )
                )}
            </div>
        </button>
    );
}
