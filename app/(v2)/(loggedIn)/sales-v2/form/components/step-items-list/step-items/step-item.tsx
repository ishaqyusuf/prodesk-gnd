import { useContext } from "react";
import { DykeItemFormContext } from "../../../_hooks/form-context";
import { cn, safeFormText } from "@/lib/utils";
import Image from "next/image";
import { env } from "@/env.mjs";
import SVG from "react-inlinesvg";
import { Label } from "@/components/ui/label";

export function StepItem({ item, select, loadingStep, isMultiSection }) {
    const ctx = useContext(DykeItemFormContext);
    const selected = isMultiSection
        ? ctx.multi.watchItemSelected(safeFormText(item.product.title))
        : false;
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
            <Label className="text-sm">{item.product.title}</Label>
        </button>
    );
}
