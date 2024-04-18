"use client";
import { useDykeForm } from "../../form-context";
import Btn from "@/components/_v1/btn";
import { useTransition } from "react";
import { saveDykeSales } from "../_action/save-dyke";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DykeForm } from "../../type";
import { calculateSalesEstimate } from "../../_utils/calculate-sales-estimate";

export default function HeaderSection({}) {
    const form = useDykeForm();
    const [orderId, id, type] = form.getValues([
        "order.orderId",
        "order.id",
        "order.type",
    ]);
    const router = useRouter();
    const [loading, startTransition] = useTransition();
    async function save(data: DykeForm) {
        startTransition(async () => {
            // console.log(data.itemArray[0]?.item);
            // return;
            const e = calculateSalesEstimate(data);
            debugger;
            const resp = await saveDykeSales(e);
            toast.success("Saved");
            if (!id) router.push(`/sales-v2/form/${resp.type}/${resp.slug}`);
        });
    }
    return (
        <div className="flex justify-between items-center">
            <div className="">
                <h2 className="text-2xl font-bold tracking-tight">
                    {orderId && id && type == "order" ? "#ORD" : "#EST"}{" "}
                    {orderId || "New"}
                </h2>
            </div>
            <div className="">
                <Btn onClick={() => form.handleSubmit(save)()}>Save</Btn>
            </div>
        </div>
    );
}
