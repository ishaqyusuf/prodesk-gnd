"use client";

import { getShelfCateogriesAction } from "@/actions/cache/get-shelf-categories";
import { useAsyncMemo } from "use-async-memo";
import {
    Combobox,
    ComboboxAnchor,
    ComboboxBadgeItem,
    ComboboxBadgeList,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxGroupLabel,
    ComboboxInput,
    ComboboxItem,
    ComboboxLabel,
    ComboboxSeparator,
    ComboboxTrigger,
} from "@/components/ui/combobox";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { _useAsync } from "@/lib/use-async";
import useEffectLoader from "@/lib/use-effect-loader";
import { ChevronDown } from "lucide-react";
import React, {
    createContext,
    useContext,
    useDeferredValue,
    useMemo,
    useState,
} from "react";
import { getShelfProductsAction } from "@/actions/cache/get-shelf-products";
import { useFormDataStore } from "@/app/(clean-code)/(sales)/sales-book/(form)/_common/_stores/form-data-store";
import Button from "@/components/common/button";
import { Icons } from "@/components/_v1/icons";
import { StepHelperClass } from "@/app/(clean-code)/(sales)/sales-book/(form)/_utils/helpers/zus/step-component-class";
import { generateRandomString } from "@/lib/utils";
import {
    ShelfContext,
    ShelfItemContext,
    useCreateShelfContext,
    useCreateShelfItemContext,
    useShelf,
    useShelfItem,
} from "@/hooks/use-shelf";
import ConfirmBtn from "@/components/_v1/confirm-btn";

export function ShelfItems({ itemStepUid }) {
    const ctx = useCreateShelfContext(itemStepUid);
    return (
        <ShelfContext.Provider value={ctx}>
            <div className="">
                <Table className="size-sm">
                    <TableBody>
                        {ctx.shelfItemUids?.map((uid) => (
                            <ShelfItemLine key={uid} shelfUid={uid} />
                        ))}
                    </TableBody>
                </Table>
                <div className="border-t w-full">
                    <Button
                        onClick={() => {
                            ctx.addSection();
                        }}
                        className=""
                        size="xs"
                    >
                        <Icons.add className="size-4" />
                        Add Section
                    </Button>
                </div>
            </div>
        </ShelfContext.Provider>
    );
}
export function ShelfItemLine({ shelfUid }) {
    const zus = useFormDataStore();
    const { itemUid, categories } = useShelf();
    const ctx = useCreateShelfItemContext({ shelfUid });
    const { categoryIds, setCategoryIds, filteredTricks, inputValue } = ctx;
    // const [categoryIds, setCategoryIds] = React.useState<string[]>([]);
    const [open, onOpenChange] = useState(false);

    return (
        <ShelfItemContext.Provider value={ctx}>
            <TableRow>
                <TableCell className="flex flex-col">
                    <Combobox
                        open={open}
                        onOpenChange={onOpenChange}
                        value={categoryIds.map((id) => String(id))}
                        onValueChange={setCategoryIds}
                        multiple
                        inputValue={inputValue}
                        onInputValueChange={ctx.onInputValueChange}
                        manualFiltering
                        className="w-full"
                        autoHighlight
                    >
                        <ComboboxLabel>Select Categories</ComboboxLabel>
                        <ComboboxAnchor className="h-full min-h-10 flex-wrap px-3 py-2">
                            <ComboboxBadgeList>
                                {categoryIds.map((item, index) => {
                                    const option = categories.find(
                                        (trick) => trick.id === Number(item)
                                    );
                                    if (!option) return null;

                                    return (
                                        <ComboboxBadgeItem
                                            noDelete={
                                                !(
                                                    categoryIds?.length - 1 ==
                                                    index
                                                )
                                            }
                                            onDelete={(e) => {
                                                // e.preventDefault();
                                                // console.log(e);
                                            }}
                                            key={item}
                                            value={String(item)}
                                        >
                                            {option.name}
                                        </ComboboxBadgeItem>
                                    );
                                })}
                            </ComboboxBadgeList>
                            {!ctx?.options?.length || (
                                <>
                                    <ComboboxInput
                                        className="h-auto min-w-20 flex-1"
                                        onFocus={(e) => {
                                            onOpenChange(true);
                                        }}
                                        placeholder="Select category..."
                                    />
                                    <ComboboxTrigger className="absolute top-3 right-2">
                                        <ChevronDown className="h-4 w-4" />
                                    </ComboboxTrigger>
                                </>
                            )}
                        </ComboboxAnchor>

                        {!ctx.options?.length || (
                            <ComboboxContent
                                ref={(node) => ctx?.setContent(node)}
                                className="relative max-h-[300px] overflow-y-auto overflow-x-hidden"
                            >
                                <ComboboxEmpty>No category found</ComboboxEmpty>
                                {filteredTricks?.map((trick) => (
                                    <ComboboxItem
                                        key={String(trick.id)}
                                        value={String(trick.id)}
                                        outset
                                    >
                                        {trick.name}
                                    </ComboboxItem>
                                ))}
                            </ComboboxContent>
                        )}
                    </Combobox>
                </TableCell>
                <TableCell className="w-3/5 p-0">
                    <div className="flex flex-col">
                        <Table className="">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Total Price</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ctx.productUids?.map((puid) => (
                                    <ShelfItemProduct
                                        prodUid={puid}
                                        key={puid}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                        <div className="flex justify-end">
                            <Button
                                onClick={() => {
                                    ctx.addProduct();
                                }}
                            >
                                <Icons.add className="size-4" />
                                Add Product
                            </Button>
                        </div>
                    </div>
                </TableCell>
            </TableRow>
        </ShelfItemContext.Provider>
    );
}
function ShelfItemProduct({ prodUid }) {
    const itemCtx = useShelfItem();
    const { products } = itemCtx;
    const [productId, setProductId] = useState(
        itemCtx?.products?.[prodUid]?.productId
    );
    const [open, onOpenChange] = useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const deferredInputValue = useDeferredValue(inputValue);
    const filteredProducts = React.useMemo(() => {
        if (!deferredInputValue) return products?.products;
        const normalized = deferredInputValue.toLowerCase();
        const __products = products?.products?.filter((item) =>
            item.title.toLowerCase().includes(normalized)
        );
        return __products;
    }, [deferredInputValue, products]);
    const [content, setContent] = React.useState<React.ComponentRef<
        typeof ComboboxContent
    > | null>(null);
    const onInputValueChange = React.useCallback(
        (value: string) => {
            setInputValue(value);
            if (content) {
                content.scrollTop = 0; // Reset scroll position
                //  virtualizer.measure();
            }
        },
        [content]
    );

    return (
        <TableRow className="w-2/3">
            <TableCell>
                <Combobox
                    open={open}
                    onOpenChange={onOpenChange}
                    value={String(productId)}
                    onValueChange={(e) => itemCtx.productChanged(prodUid, e)}
                    inputValue={inputValue}
                    onInputValueChange={onInputValueChange}
                    manualFiltering
                    className="w-full"
                    autoHighlight
                >
                    <ComboboxAnchor className="h-full min-h-10 flex-wrap px-3 py-2">
                        <>
                            <ComboboxInput
                                className="h-auto min-w-20 flex-1 "
                                onFocus={(e) => {
                                    onOpenChange(true);
                                }}
                                placeholder="Select product..."
                            />
                            <ComboboxTrigger className="absolute top-3 right-2">
                                <ChevronDown className="h-4 w-4" />
                            </ComboboxTrigger>
                        </>
                    </ComboboxAnchor>

                    <ComboboxContent
                        ref={(node) => setContent(node)}
                        className="relative max-h-[300px] overflow-y-auto overflow-x-hidden"
                    >
                        <ComboboxEmpty>No product found</ComboboxEmpty>
                        {filteredProducts?.map((trick) => (
                            <ComboboxItem
                                key={String(trick.id)}
                                value={String(trick.id)}
                                outset
                            >
                                {trick.title}
                            </ComboboxItem>
                        ))}
                    </ComboboxContent>
                </Combobox>
            </TableCell>
            <TableCell className="w-24"></TableCell>
            <TableCell className="w-24"></TableCell>
            <TableCell className="w-24"></TableCell>
            <TableCell className="w-24">
                <ConfirmBtn
                    trash
                    onClick={() => {
                        itemCtx.deleteProductLine(prodUid);
                    }}
                />
            </TableCell>
        </TableRow>
    );
}
