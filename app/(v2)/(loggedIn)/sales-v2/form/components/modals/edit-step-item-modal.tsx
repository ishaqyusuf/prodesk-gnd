"use client";

import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useForm, UseFormReturn } from "react-hook-form";
import RenderForm from "@/_v2/components/common/render-form";
import ControlledInput from "@/components/common/controls/controlled-input";
import { FileUploader } from "@/components/common/file-uploader";
import { useEffect, useState, useTransition } from "react";
import { saveStepProduct } from "../../_action/save-step-product";
import { useModal } from "@/components/common/modal-old/provider";
import { _getMouldingSpecies } from "./_action";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import { IStepProducts } from "../step-items-list/item-section/step-items";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Modal from "@/components/common/modal";
import { DykeForm } from "../../../type";
import { getDimensionSizeList } from "../../../dimension-variants/_actions/get-size-list";

interface Props {
    item: IStepProducts[0];
    onCreate(stepItem: IStepProducts[0]);
    moulding?: boolean;
    root?: boolean;
    rowIndex;
    mainForm: UseFormReturn<DykeForm>;
    stepTitle?: string;
}
export default function EditStepItemModal({
    item,
    onCreate,
    moulding,
    rowIndex,
    mainForm,
    stepTitle,
    root,
}: Props) {
    const { ...defaultValues } = item;
    if (!item.id) defaultValues.product.title = "";
    const form = useForm<IStepProducts[0]>({
        defaultValues,
    });
    const src = form.watch("product.img");
    const invoiceItem = mainForm.getValues(`itemArray.${rowIndex}`);
    const doorType = invoiceItem.item.meta.doorType;
    const isBifold = doorType == "Bifold";
    const height = mainForm.watch(
        `itemArray.${rowIndex}.item.housePackageTool.height`
    );
    const [species, setSpecies] = useState<string[]>([]);
    const [heights, setHeight] = useState({
        "6-8": [],
        "7-0": [],
        "8-0": [],
    });

    useEffect(() => {
        (async () => {
            if (moulding) {
                const _species = await _getMouldingSpecies();
                setSpecies(_species as any);
                const def: any = {};
                _species?.map((s) => (def[s as any] = true));
                if (!item.id) {
                    form.setValue(`product.meta.mouldingSpecies`, def);
                }
            }
            // if door section
            if (stepTitle == "Door") {
                let d: any = {};
                let _tab = null;
                await Promise.all(
                    Object.keys(heights).map(async (height) => {
                        if (!_tab) _tab = height;
                        const _sizes = await getDimensionSizeList(
                            height,
                            isBifold
                        );
                        // console.log(_sizes);
                        d[height] = _sizes.map((s) => s.dimFt);
                    })
                );
                // console.log(d);
                setHeight(d);
                setTab(_tab);
            }
        })();
    }, []);
    function onUpload(assetId) {
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
            formData.product.meta.priced = formData.product.price > 0;
            // if(!formData?.product?.title)
            // formData?.product
            // console.log(formData);
            // debugger;
            const reps = await saveStepProduct(formData);

            onCreate(reps as any);
            modal?.close();
        });
    }
    const heightList = () => Object.keys(heights);
    const sizeList = (h) => heights[h] || [];
    const [tab, setTab] = useState();
    return (
        <RenderForm {...form}>
            <Modal.Content>
                <Modal.Header
                    title="Edit Product"
                    subtitle={item.product?.title}
                />
                <div>
                    <Tabs defaultValue="general">
                        <TabsList className="">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="price">Price</TabsTrigger>
                        </TabsList>
                        <TabsContent value="general">
                            <div className="grid gap-4">
                                {root ? (
                                    <ControlledInput
                                        control={form.control}
                                        name="product.value"
                                        label="Item Type"
                                    />
                                ) : (
                                    <>
                                        <ControlledInput
                                            control={form.control}
                                            name="product.title"
                                            label="Product Title"
                                        />
                                    </>
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
                                    width={50}
                                    height={50}
                                    onUpload={onUpload}
                                    label="Product Image"
                                    folder="dyke"
                                    src={src}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="price">
                            <div className="grid grid-cols-2 gap-2">
                                {stepTitle == "Door" ? (
                                    <div className="col-span-2">
                                        <Tabs
                                            className="w-full "
                                            defaultValue={tab}
                                        >
                                            <TabsList>
                                                {heightList().map((h) => (
                                                    <TabsTrigger
                                                        key={h}
                                                        value={h}
                                                    >
                                                        {h}
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>
                                            {heightList().map((h) => (
                                                <TabsContent key={h} value={h}>
                                                    <div className="grid  grid-cols-4 gap-4">
                                                        {sizeList(h).map(
                                                            (size) => (
                                                                <ControlledInput
                                                                    key={size}
                                                                    control={
                                                                        form.control
                                                                    }
                                                                    name={`product.meta.doorPrice.${size}`}
                                                                    label={size}
                                                                    type="number"
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                </TabsContent>
                                            ))}
                                        </Tabs>
                                    </div>
                                ) : (
                                    <ControlledInput
                                        control={form.control}
                                        name="product.price"
                                        label="Base Price"
                                        type="number"
                                        className="col-span-2"
                                    />
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
                <Modal.Footer submitText="Save" onSubmit={save} />
            </Modal.Content>
        </RenderForm>
    );
}
