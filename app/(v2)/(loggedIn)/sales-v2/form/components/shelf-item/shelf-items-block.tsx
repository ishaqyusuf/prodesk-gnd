"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getShelfProducts } from "../../_action/get-shelf-products.actions";
import { Form, FormField } from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { _getShelfCategories } from "../../_action/get-shelf-categories";
import { DykeShelfCategories } from "@prisma/client";
import useShelfItem, { IUseShelfItem } from "../../../use-shelf-item";
import { Input } from "@/components/ui/input";

interface Props {
    shelfIndex;
}

export default function ShelfItemsBlock({ shelfIndex }: Props) {
    const shelf = useShelfItem(shelfIndex);
    const {
        form,
        item,
        catArray: { fields: categories },
        categoryForm,
        shelfItemKey,
    } = shelf;

    async function getProducts(parentCategoryId, categoryId) {
        const { subCategoriesCount, products } = await getShelfProducts(
            parentCategoryId,
            categoryId
        );
        console.log(subCategoriesCount, products);
        if (subCategoriesCount) {
            // append({ cid: -1 });
        }
    }
    if (!shelf.categoryForm) return <></>;

    return (
        <Form {...categoryForm}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Line Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>
                            {/* {JSON.stringify(fields)} */}
                            {categories.map((field, index) => (
                                <ShelfCategory
                                    field={field as any}
                                    index={index}
                                    key={field.id}
                                    shelf={shelf}
                                />
                            ))}
                        </TableCell>
                        {shelf.products && (
                            <>
                                {shelf.prodArray.fields.map(
                                    (prodField, prodIndex) => (
                                        <ShellProductCells
                                            key={prodIndex}
                                            index={prodIndex}
                                            shelf={shelf}
                                        />
                                    )
                                )}
                            </>
                        )}
                    </TableRow>
                </TableBody>
            </Table>
        </Form>
    );
}
interface ShellProductCells {
    shelf: IUseShelfItem;
    index;
}
function ShellProductCells({ shelf, index }: ShellProductCells) {
    return (
        <>
            <TableCell>
                <ShelfSelect
                    control={shelf.categoryForm.control}
                    keyName={`${shelf.shelfItemKey}.products.${index}.data.productId`}
                    onValueChange={(field, v) => {
                        const productId = Number(v) || null;
                        field.onChange(productId);
                        shelf.productSelected(productId, index);
                    }}
                    placeholder={"Category"}
                    items={shelf.products?.map(
                        ({ title: label, id: value }) => ({
                            label,
                            value: value.toString(),
                        })
                    )}
                />
            </TableCell>
            <TableCell>
                <FormField
                    control={shelf.categoryForm.control}
                    name={`${shelf.getProdFormKey(index, "qty")}` as any}
                    render={({ field }) => (
                        <Input
                            type="number"
                            {...field}
                            value={field.value?.toString()}
                            onChange={(e) => {
                                field.onChange(+e);
                            }}
                        />
                    )}
                />
            </TableCell>
        </>
    );
}
interface ShelfCategoryProps {
    shelf: IUseShelfItem;
    index;
    field;
}
function ShelfCategory({ index, shelf, field }: ShelfCategoryProps) {
    const [categories, setCategories] = useState<DykeShelfCategories[]>([]);
    useEffect(() => {
        (async () => {
            const cids = shelf.shelfCategoryIds(index);
            console.log({ index, cids });
            const c = await _getShelfCategories(cids);
            setCategories(c);
        })();
    }, [index, shelf.catArray.fields]);
    if (!shelf.categoryForm) return <></>;

    return (
        <div>
            <ShelfSelect
                control={shelf.categoryForm.control}
                keyName={`ids.${index}.cid`}
                onValueChange={(field, v) => {
                    const value = Number(v) || null;
                    field.onChange(value);
                    shelf.categorySelected(index, value);
                }}
                placeholder={"Category"}
                items={categories.map(({ name: label, id: value }) => ({
                    label,
                    value: value.toString(),
                }))}
            />
            {/* <FormField
                control={shelf.categoryForm.control}
                name={`ids.${index}.cid`}
                render={({ field }) => (
                    <Select
                        value={`${field.value}`}
                        onValueChange={(v) => {
                            const value = Number(v) || null;
                            field.onChange(value);
                            shelf.categorySelected(index, value);
                        }}
                    >
                        <SelectTrigger className="h-6 w-auto min-w-[200px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.id?.toString()}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                )}
            /> */}
        </div>
    );
}
interface ShelfSelectProps {
    control;
    keyName;
    onValueChange;
    placeholder;
    items;
}
function ShelfSelect({
    control,
    keyName,
    onValueChange,
    placeholder,
    items,
}: ShelfSelectProps) {
    return (
        <FormField
            control={control}
            name={keyName}
            render={({ field }) => (
                <Select
                    value={`${field.value}`}
                    onValueChange={(value) => onValueChange(field, value)}
                >
                    <SelectTrigger className="h-6 w-auto min-w-[200px]">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {items.map((item, index) => (
                                <SelectItem key={index} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            )}
        />
    );
}
