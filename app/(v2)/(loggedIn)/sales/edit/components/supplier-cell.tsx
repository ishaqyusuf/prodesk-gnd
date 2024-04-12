import { Icons } from "@/components/_v1/icons";
import { Button } from "@/components/ui/button";
import { ISalesOrder } from "@/types/sales";
import { Dot } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export default function SupplierCell({
    InputHelper,
    rowHover,
    index,
    suppliers,
}) {
    const [hover, setHover] = useState(false);
    const form = useFormContext<ISalesOrder>();

    const valueKey: any = `items.${index}.supplier`;
    const supplyDateKey: any = `items.${index}.meta.supplyDate`;
    const [supplier, date] = form.watch([valueKey, supplyDateKey]);
    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="relative"
        >
            <InputHelper
                index={index}
                formKey={"supplier"}
                options={suppliers}
                watchValue={[supplier]}
            />
            {!hover && (
                <div className="absolute -top-[10px] -right-[10px]">
                    <Dot className="text-muted-foreground" />
                </div>
            )}
            {hover && (
                <div className="absolute -top-[15px] -right-[15px]">
                    <Button
                        variant={"secondary"}
                        size="icon"
                        className="w-6 h-7"
                    >
                        <Icons.calendar className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </div>
            )}
        </div>
    );
}
