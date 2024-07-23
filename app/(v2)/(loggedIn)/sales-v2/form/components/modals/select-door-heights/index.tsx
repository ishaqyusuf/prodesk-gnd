import Modal from "@/components/common/modal";

import { DykeForm } from "../../../../type";
import { UseFormReturn, useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import { getDimensionSizeList } from "../../../../dimension-variants/_actions/get-size-list";
import { Form } from "@/components/ui/form";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import { useModal } from "@/components/common/modal/provider";
import { cn, ftToIn, safeFormText } from "@/lib/utils";
import ControlledInput from "@/components/common/controls/controlled-input";
import { toast } from "sonner";
import { _addSize } from "../../../../dimension-variants/_actions/add-size";
import { IStepProducts } from "../../step-items-list/item-section/step-items";
import Money from "@/components/_v1/money";
import { HousePackageToolMeta } from "@/types/sales";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type SizeForm = {
    [id in string]: {
        checked?: boolean;
        dim?: string;
        width?: string;
        dimFt?: string;
        price?: number;
    };
};
interface Props {
    form: UseFormReturn<DykeForm>;
    // stepProd: IStepProducts[0];
    stepProd?: IStepProducts[0];
    productTitle: string;
    rowIndex;
    onSubmit?(heights: SizeForm);
}
type ComponentHeight =
    DykeForm["itemArray"][0]["multiComponent"]["components"]["heights"];

export default function SelectDoorHeightsModal({
    form,
    rowIndex,
    onSubmit,
    productTitle,
    stepProd,
}: Props) {
    const safeTitle = safeFormText(productTitle);
    const item = form.getValues(`itemArray.${rowIndex}`);
    const baseKey = `itemArray.${rowIndex}.multiComponent.components.${safeTitle}`;
    const heightsKey = `${baseKey}.heights`;

    const heights: ComponentHeight = form.getValues(heightsKey as any);
    const height = form.watch(
        `itemArray.${rowIndex}.item.housePackageTool.height`
    );
    let hIn = ftToIn(height);

    const doorType = item.item.meta.doorType;
    const isBifold = doorType == "Bifold";
    const [sizes, setSizes] = useState<
        { dim: string; width: string; dimFt: string; price? }[]
    >([]);
    const sizeForm = useForm<{
        sizes: SizeForm;
        size: "";
    }>({
        defaultValues: {
            sizes: {},
        },
    });
    if (!stepProd.product.meta.doorPrice) stepProd.product.meta.doorPrice = {};
    const [heightPrices, setHeightPrices] = useState(
        stepProd.product.meta.doorPrice
    );
    useEffect(() => {
        (async () => {
            const _sizes = await getDimensionSizeList(height, isBifold);
            let _defData: any = {};

            Object.entries(heights || {}).map(([k, v]) => {
                const s = _sizes.find((s) => s.dim == (k as any));
                _defData[k] = {
                    ...(v || {}),
                    dim: s?.dim,
                    width: s?.width,
                    title: s?.dimFt,
                    price: heightPrices[s?.dimFt],
                };
            });
            sizeForm.reset({
                sizes: _defData,
            });
            setSizes(
                _sizes.map((s) => {
                    return {
                        ...s,
                        price: heightPrices[s?.dimFt],
                    };
                })
            );
        })();
    }, []);
    const modal = useModal();
    function _onSubmit() {
        const sizesData = sizeForm.getValues("sizes");
        const priceTags: HousePackageToolMeta["priceTags"] = form.getValues(
            `${baseKey}.priceTags` as any
        ) || {
            doorSizePriceTag: {},
        };
        priceTags.doorSizePriceTag = {};
        delete priceTags.moulding;
        // console.log(sizesData);
        Object.entries(sizesData || {}).map(([dim, { checked }]) => {
            const size = sizes.find((_) => dim == _.dim);
            if (checked && size) {
                sizesData[dim] = {
                    checked: true,
                    ...size,
                };
                const price = (priceTags.doorSizePriceTag[size.dimFt] =
                    size.price || 0);
                const jamPath =
                    `${baseKey}._doorForm.${size.dim}.jambSizePrice` as any;
                form.setValue(jamPath, price);
                console.log({ jamPath, price: price });
            }
        });
        const checked = (Object.values(sizesData).filter((s) => s.checked)
            ?.length > 0) as any;
        form.setValue(heightsKey as any, sizesData);
        onSubmit && onSubmit(sizesData);
        form.setValue(`${baseKey}.checked` as any, checked);
        console.log(priceTags);

        form.setValue(`${baseKey}.priceTags` as any, priceTags);
        modal.close();
    }
    async function createNewSize() {
        const s = sizeForm.getValues("size")?.toLowerCase();
        try {
            if (!s) {
                throw new Error("input cannot be empty");
            }
            const [w, ...rest] = s.split(" ");

            if (rest.length || ![w].every((s) => s?.includes("in")))
                throw new Error("Invalid size");
            const e = sizeForm.getValues(`sizes.${s} x ${hIn}`);

            if (e) throw new Error("Size already exist");
            const r = await _addSize(w, isBifold);
            sizeForm.setValue("size", "");
            setSizes((os) => {
                return [
                    ...os,
                    {
                        dim: `${r.in} x ${hIn}`,
                        width: r.ft,
                    },
                ] as any;
            });
        } catch (error) {
            // console.log(error.message);
            toast.error((error as any).message);
        }
    }

    function CheckControl({ size }) {
        const [show, setShow] = useState(false);
        const [price, setPrice] = useState();
        const [newPrice, setNewPrice] = useState(size.price);
        async function updatePrice() {
            console.log(newPrice);
            setPrice(newPrice);
            setHeightPrices((pr) => {
                return {
                    ...pr,
                    [size.dimFt]: newPrice,
                };
            });
            setShow(false);
        }
        useEffect(() => {
            // if (show) setNewPrice(price);
        }, [show]);
        return (
            <div className="flex border justify-between p-3 py-2 group items-start">
                <ControlledCheckbox
                    control={sizeForm.control}
                    name={`sizes.${size.dim}.checked` as any}
                    label={
                        <div className="grid gap-1">
                            <p>{size.dimFt}</p>
                            <div className={cn("text-muted-foreground")}>
                                {<Money value={price} />}
                            </div>
                        </div>
                    }
                />
                <DropdownMenu open={show} onOpenChange={setShow}>
                    <DropdownMenuTrigger
                        className={cn(
                            !show && "opacity-0 group-hover:opacity-100"
                        )}
                    >
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-1"
                        >
                            <Icons.edit className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <CardHeader>
                            <CardTitle>Edit Price</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Input
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key == "Enter") {
                                        updatePrice();
                                    }
                                }}
                                type="number"
                            />
                        </CardContent>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }
    return (
        <Modal.Content size="lg">
            <Modal.Header title="Select Sizes" subtitle={productTitle || ""} />
            <Form {...sizeForm}>
                <div className="grid sgap-3  grid-cols-3">
                    {sizes.map((size, index) => {
                        return <CheckControl size={size} key={index} />;
                    })}
                </div>
                <form
                    className="grid gap-4"
                    onSubmit={(...args) =>
                        void form.handleSubmit(createNewSize)(...args)
                    }
                >
                    <div className="border-t pt-2">
                        <ControlledInput
                            control={sizeForm.control}
                            name="size"
                            label="Add Width (eg; 54in)"
                            placeholder="Missing width? type and click enter to submit."
                        />
                    </div>
                </form>
            </Form>
            <Modal.Footer
                submitText="Proceed"
                onSubmit={_onSubmit}
            ></Modal.Footer>
        </Modal.Content>
    );
}
