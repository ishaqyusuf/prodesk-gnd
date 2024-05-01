"use client";

import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import RenderForm from "@/_v2/components/common/render-form";
import ControlledInput from "@/components/common/controls/controlled-input";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/common/file-uploader";
import { useEffect, useState, useTransition } from "react";
import { saveStepProduct } from "../../_action/save-step-product";
import { useModal } from "@/components/common/modal-old/provider";
import { _getMouldingSpecies } from "./_action";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import { IStepProducts } from "../step-items-list/item-section/step-items";

interface Props {
    item: IStepProducts[0];
    onCreate(stepItem: IStepProducts[0]);
    moulding?: boolean;
    root?: boolean;
}
export default function EditStepItemModal({
    item,
    onCreate,
    moulding,
    root,
}: Props) {
    const { ...defaultValues } = item;
    if (!item.id) defaultValues.product.title = "";
    const form = useForm<IStepProducts[0]>({
        defaultValues,
    });
    const src = form.watch("product.img");
    const [species, setSpecies] = useState<string[]>([]);
    useEffect(() => {
        if (moulding) {
            (async () => {
                const _species = await _getMouldingSpecies();
                setSpecies(_species as any);
                const def: any = {};
                _species?.map((s) => (def[s as any] = true));
                if (!item.id) {
                    form.setValue(`product.meta.mouldingSpecies`, def);
                }
            })();
        }
    }, []);
    function onUpload(assetId) {
        // console.log(assetId);
        form.setValue("product.img", assetId);
    }
    const [saving, startSaving] = useTransition();
    const modal = useModal();
    async function save() {
        startSaving(async () => {
            const formData = form.getValues();
            const [pri, sec] = root ? ["value", "title"] : ["title", "value"];
            // if (root) {
            if (!formData.product[sec])
                formData.product[sec] = formData.product[pri];
            // }
            // if(!formData?.product?.title)
            // formData?.product
            // console.log(formData);
            // debugger;
            const reps = await saveStepProduct(formData);
            onCreate(reps as any);
            modal?.close();
        });
    }
    return (
        <DialogContent>
            <RenderForm {...form}>
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    {root ? (
                        <ControlledInput
                            control={form.control}
                            name="product.value"
                            label="Item Type"
                        />
                    ) : (
                        <ControlledInput
                            control={form.control}
                            name="product.title"
                            label="Product Title"
                        />
                    )}
                    {moulding && (
                        <div className="grid grid-cols-2 gap-4">
                            {species.map((s, i) => (
                                <ControlledCheckbox
                                    key={i}
                                    label={s}
                                    control={form.control}
                                    name={`product.meta.mouldingSpecies.${s}`}
                                />
                            ))}
                        </div>
                    )}
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
