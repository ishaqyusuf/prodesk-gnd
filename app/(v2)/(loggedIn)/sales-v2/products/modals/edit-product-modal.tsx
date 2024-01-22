"use client";

import RenderForm from "@/_v2/components/common/render-form";
import {
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { IDykeProduct } from "../components/products-table";
import ControlledInput from "@/_v2/components/controls/controlled-input";
import ControlledCheckbox from "@/_v2/components/controls/controlled-checkbox";
import { Button } from "@/components/ui/button";
import Btn from "@/components/_v1/btn";
import { useModal } from "@/_v2/components/common/modal/provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ControlledSelect from "@/_v2/components/controls/controlled-select";
import { getDykeCategoriesList } from "../../_actions/dyke-categories-list";
import { saveDykeProduct } from "../_actions/save-dyke-product";
import { toast } from "sonner";

interface Props {
    data?: IDykeProduct;
}
const Schema = z.object({
    id: z.number().nullable(),
    title: z.string().min(2),
    description: z.string(),
    noteRequired: z.boolean().default(false),
    price: z.number().nullable(),
    qty: z.number().nullable(),
    categoryId: z.number().nullable(),
    img: z.string().nullable(),
    value: z.string().nullable(),
});
export default function EditProductModal({ data }: Props) {
    // const defaultValues = {}
    const modal = useModal();
    const form = useForm<IDykeProduct>({
        resolver: zodResolver(Schema),
        defaultValues: {
            ...(data || {}),
        },
    });
    useEffect(() => {}, []);
    async function save(data) {
        modal?.startTransition(async () => {
            // console.log(data);
            await saveDykeProduct(data);
            modal.hide();
            toast.success("Saved");
        });
    }
    return (
        <RenderForm {...form}>
            <DialogHeader>
                <DialogTitle>
                    <span>Edit Product</span>
                </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
                <ControlledInput
                    control={form.control}
                    name="title"
                    label="Product Title"
                />
                <ControlledInput
                    control={form.control}
                    name="description"
                    type="textarea"
                    label="Product Description"
                />
                <div className="grid grid-cols-2 gap-4">
                    <ControlledInput
                        control={form.control}
                        name="qty"
                        type="number"
                        label="Qty"
                    />
                    <ControlledInput
                        control={form.control}
                        name="price"
                        type="number"
                        label="Price"
                    />

                    <ControlledSelect
                        control={form.control}
                        name="categoryId"
                        loader={getDykeCategoriesList}
                        label="Category"
                    />
                </div>
                <ControlledCheckbox
                    control={form.control}
                    name="noteRequired"
                    label="Custom Input Required"
                />
            </div>
            <DialogFooter>
                <div className="flex justify-end">
                    <Btn
                        onClick={() => form.handleSubmit(save)()}
                        isLoading={modal?.loading}
                    >
                        Save
                    </Btn>
                </div>
            </DialogFooter>
        </RenderForm>
    );
}
