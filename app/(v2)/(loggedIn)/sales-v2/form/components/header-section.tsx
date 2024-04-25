"use client";
import { useDykeForm } from "../_hooks/form-context";
import Btn from "@/components/_v1/btn";
import { _revalidate } from "@/app/(v1)/_actions/_revalidate";
import useDykeFormSaver from "../_hooks/use-dyke-form-saver";

export default function HeaderSection({}) {
    const form = useDykeForm();
    const [orderId, id, type] = form.getValues([
        "order.orderId",
        "order.id",
        "order.type",
    ]);
    const saver = useDykeFormSaver(form);
    return (
        <div className="flex justify-between items-center">
            <div className="">
                <h2 className="text-2xl font-bold tracking-tight">
                    {orderId && id && type == "order" ? "#ORD" : "#EST"}{" "}
                    {orderId || "New"}
                </h2>
            </div>
            <div className="">
                <Btn
                    isLoading={saver.saving}
                    onClick={() => form.handleSubmit(saver.save)()}
                >
                    Save
                </Btn>
            </div>
        </div>
    );
}
