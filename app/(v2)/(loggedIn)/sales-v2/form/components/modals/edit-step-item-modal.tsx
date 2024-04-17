"use client";

import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { IStepProducts } from "../dyke-item-step-section";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import RenderForm from "@/_v2/components/common/render-form";
import ControlledInput from "@/components/common/controls/controlled-input";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/common/file-uploader";
import { useTransition } from "react";
import { saveStepProduct } from "../../_action/save-step-product";
import { useModal } from "@/components/common/modal-old/provider";

interface Props {
    item: IStepProducts[0];
    onCreate(stepItem: IStepProducts[0]);
}
export default function EditStepItemModal({ item, onCreate }: Props) {
    const { ...defaultValues } = item;
    if (!item.id) defaultValues.product.title = "";
    const form = useForm<IStepProducts[0]>({
        defaultValues,
    });
    const src = form.watch("product.img");

    function onUpload(assetId) {
        console.log(assetId);

        form.setValue("product.img", assetId);
    }
    const [saving, startSaving] = useTransition();
    const modal = useModal();
    async function save() {
        startSaving(async () => {
            const reps = await saveStepProduct(form.getValues());
            onCreate(reps as any);
            modal?.close();
        });
    }
    return (
        <DialogContent>
            <RenderForm {...form}>
                <DialogHeader>
                    <DialogTitle>Copy Product</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <ControlledInput
                        control={form.control}
                        name="product.title"
                        label="Product Title"
                    />
                    <FileUploader
                        onUpload={onUpload}
                        label="Product Image"
                        folder="dyke"
                        src={src}
                    />
                </div>
                <DialogFooter>
                    <div className="flex justify-end">
                        <Button disabled={saving} onClick={save}>
                            Save
                        </Button>
                    </div>
                </DialogFooter>
            </RenderForm>
        </DialogContent>
    );
}
