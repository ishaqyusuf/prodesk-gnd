"use client";

import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import RenderForm from "@/_v2/components/common/render-form";
import ControlledInput from "@/components/common/controls/controlled-input";
import { FileUploader } from "@/components/common/file-uploader";
import { useEffect, useState, useTransition } from "react";
import { saveStepProduct } from "../../_action/save-step-product";
import { _getMouldingSpecies } from "./_action";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import { IStepProducts } from "../step-items-list/item-section/component-products";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DykeForm } from "../../../type";
import { getDimensionSizeList } from "../../../dimension-variants/_actions/get-size-list";
import useFn from "@/hooks/use-fn";
import { getDykeSections } from "../../../_actions/dyke-settings/get-dyke-sections";

import ControlledSelect from "@/components/common/controls/controlled-select";
import { Icons } from "@/components/_v1/icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductImage } from "../step-items-list/item-section/component-products/product";
import Modal from "@/components/common/modal";
import { useModal } from "@/components/common/modal/provider";
import SaveProductForModal from "./save-product-for-modal";
import { generateRandomString } from "@/lib/utils";

interface Props {
    item: IStepProducts[0];
    onCreate(stepItem: IStepProducts[0]);
    moulding?: boolean;
    root?: boolean;
    rowIndex;
    mainForm: UseFormReturn<DykeForm>;
    stepTitle?: string;
    products?: IStepProducts;
    stepIndex;
    stepForm;
}
export default function EditStepItemModal({
    item,
    onCreate,
    moulding,
    rowIndex,
    mainForm,
    stepTitle,
    products,
    stepIndex,
    stepForm,
    root,
}: Props) {
    const { ...defaultValues } = item;
    if (!item.id) defaultValues.product.title = "";
    if (!defaultValues.meta.stepSequence?.length)
        defaultValues.meta.stepSequence = [{}] as any;
    const form = useForm({
        defaultValues,
    });
    const stepS = useFieldArray({
        control: form.control,
        keyName: "_id",
        name: "meta.stepSequence",
    });
    const src = form.watch("product.img");
    const invoiceItem = mainForm.getValues(`itemArray.${rowIndex}`);
    const doorType = invoiceItem.item.meta.doorType;
    const isBifold = doorType == "Bifold";

    const [species, setSpecies] = useState<string[]>([]);
    const [heights, setHeight] = useState({
        "6-8": [],
        "7-0": [],
        "8-0": [],
    });
    const [deletedProds, setDeletedProds] = useState<IStepProducts>([]);

    useEffect(() => {
        setDeletedProds(
            products.filter(
                (p) =>
                    (p._metaData.hidden && p.product.img) || p.product.meta?.svg
            )
        );
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
    const sections = useFn(getDykeSections);
    function onUpload(
        assetId,
        path: "product.img" | "product.meta.svg" = "product.img"
    ) {
        form.setValue(path, assetId);
    }
    const [saving, startSaving] = useTransition();
    const modal = useModal();
    function copyProduct(product: IStepProducts[number]) {
        if (product.product?.img) onUpload(product.product?.img);
        else if (product.product?.meta?.svg)
            onUpload(product.product?.meta?.svg, "product.meta.svg");
        form.setValue(
            root ? "product.value" : "product.title",
            root ? product?.product?.value : product?.product?.title
        );
        setTab("general");
    }
    async function onComplete(formData) {
        const stepSequence = formData.meta.stepSequence.filter((s) => s.id);
        // console.log(stepSequence);
        // return;
        try {
            stepSequence.map((s, i) => {
                if (stepSequence.filter((f) => f.id == s.id).length > 1)
                    throw Error("Step cannot be repeated");
            });
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
            return;
        }
        formData.meta.stepSequence = stepSequence;
        // return;
        const [pri, sec] = root ? ["value", "title"] : ["title", "value"];

        if (!formData.product[sec])
            formData.product[sec] = formData.product[pri];

        formData.product.meta.priced = formData.product.price > 0;

        const reps = await saveStepProduct(formData);
        onCreate(reps as any);
    }
    async function save() {
        startSaving(async () => {
            const formData = form.getValues();

            if (!formData.id) {
                formData.uid = generateRandomString(5);

                modal.openModal(
                    <SaveProductForModal
                        invoiceForm={mainForm}
                        lineItemIndex={rowIndex}
                        stepForm={stepForm}
                        stepIndex={stepIndex}
                        onComplete={(resp) => {
                            // formData._metaData
                            formData.meta.show = resp || {};
                            onComplete(formData);
                        }}
                    />
                );
                return;
            }
            await onComplete(formData);
            modal?.close();
        });
    }
    const heightList = () => Object.keys(heights);
    const sizeList = (h) => heights[h] || [];
    const [tab, setTab] = useState<string>();
    return (
        <RenderForm {...form}>
            <Modal.Content>
                <Modal.Header
                    title="Edit Product"
                    subtitle={item.product?.title}
                />
                <div>
                    <Tabs value={tab} onValueChange={setTab}>
                        <TabsList className="">
                            <TabsTrigger value="general">General</TabsTrigger>
                            {stepTitle == "Door" && (
                                <TabsTrigger value="price">Price</TabsTrigger>
                            )}
                            <TabsTrigger value="step">
                                Component Step
                            </TabsTrigger>
                            {!item.id ? (
                                <>
                                    <TabsTrigger value="deleted">
                                        Copy
                                    </TabsTrigger>
                                </>
                            ) : (
                                <></>
                            )}
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
                        <TabsContent value="step">
                            <div className="flex gap-2 flex-col">
                                {stepS.fields.map((f, fieldIndex) => (
                                    <div
                                        className="flex flex-col relative items-center group"
                                        key={f._id}
                                    >
                                        {fieldIndex != 0 && (
                                            <>
                                                <Icons.chevronDown className="w-4 h-4" />
                                            </>
                                        )}
                                        <ControlledSelect
                                            control={form.control}
                                            listMode
                                            type="combo"
                                            name={`meta.stepSequence.${fieldIndex}.id`}
                                            className="w-full"
                                            size="sm"
                                            onSelect={(e) => {
                                                const empties =
                                                    stepS.fields.filter(
                                                        (f, fi) =>
                                                            !f.id &&
                                                            fi != fieldIndex
                                                    );
                                                const emptyLength =
                                                    empties.length <= 0;
                                                if (emptyLength)
                                                    stepS.append({});
                                            }}
                                            options={
                                                sections?.data?.map((d) => ({
                                                    label: d.title,
                                                    value: d.id,
                                                })) || []
                                            }
                                        />
                                        <div className="absolute right-0  -mt-4 -mr-2 hidden group-hover:block">
                                            <Button
                                                onClick={() => {
                                                    stepS.remove(fieldIndex);
                                                }}
                                                className="p-1 w-6 h-6"
                                                size="sm"
                                                variant="destructive"
                                            >
                                                <Icons.trash className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="w-28"></div>
                        </TabsContent>
                        <TabsContent value="deleted">
                            <ScrollArea className="h-[450px]">
                                <div className="grid grid-cols-3">
                                    {deletedProds.map((product) => (
                                        <button
                                            onClick={() => copyProduct(product)}
                                            key={product.id}
                                            className="flex flex-col items-center hover:shadow-sm hover:border "
                                        >
                                            <div className="w-2/3 h-16s overflow-hidden">
                                                <ProductImage
                                                    aspectRatio={1 / 1}
                                                    item={product}
                                                />
                                            </div>
                                            <div className="">
                                                <span className=" text-sm">
                                                    {product.product.title}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>
                <Modal.Footer submitText="Save" onSubmit={save} />
            </Modal.Content>
        </RenderForm>
    );
}
