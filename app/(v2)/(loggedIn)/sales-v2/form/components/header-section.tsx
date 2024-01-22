"use client";
import { useDykeForm } from "../../form-context";
import Btn from "@/components/_v1/btn";
import { useTransition } from "react";
import { saveDykeSales } from "../_action/save-dyke";
import { toast } from "sonner";

export default function HeaderSection({}) {
    const form = useDykeForm();
    const [orderId, id, type] = form.getValues([
        "order.orderId",
        "order.id",
        "order.type",
    ]);
    const [loading, startTransition] = useTransition();
    async function save(data) {
        startTransition(async () => {
            await saveDykeSales(data);
            toast.success("Saved");
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
