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
import Money from "@/components/_v1/money";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
// import { ArrowDown } from "lucide-react";

interface Props {
    shelfIndex;
    deleteItem;
}

export default function ShelfItemsBlock({ shelfIndex, deleteItem }: Props) {
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
            <TableRow>
                <TableCell className="flex" valign="top">
                    {shelfIndex + 1}
                </TableCell>
                <TableCell className="" valign="top">
                    <div className="">
                        {categories.map((field, index) => (
                            <div className="" key={index}>
                                <ShelfCategory
                                    field={field as any}
                                    index={index}
                                    shelf={shelf}
                                />
                                {categories.length - 1 > index && (
                                    <div className="flex justify-center">
                                        {"|"}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </TableCell>
                <TableCell className="w-full space-y-2 items-start  flex flex-col">
                    {shelf.products && (
                        <>
                            {shelf.prodArray.fields.map(
                                (prodField, prodIndex) => (
                                    <ShellProductCells
                                        key={prodField.id}
                                        index={prodIndex}
                                        field={prodField}
                                        shelf={shelf}
                                    />
                                )
                            )}
                            <div>
                                <Button
                                    onClick={() => {
                                        shelf.prodArray.append({
                                            item: {
                                                totalPrice: 0,
                                            },
                                        });
                                    }}
                                    className="w-full mt-2"
                                    size="sm"
                                >
                                    <Icons.add className="w-4 h-4 mr-4" />
                                    Add Product
                                </Button>
                            </div>
                        </>
                    )}
                </TableCell>
                <TableCell className="">
                    <Button
                        onClick={deleteItem}
                        size="icon"
                        variant={"destructive"}
                    >
                        <Icons.trash className="w-4 h-4" />
                    </Button>
                </TableCell>
            </TableRow>
            {/* </TableBody>
            </Table> */}
        </Form>
    );
}
interface ShellProductCells {
    shelf: IUseShelfItem;
    index;
    field?;
}
function ShellProductCells({ shelf, field: f, index }: ShellProductCells) {
    const [unitPrice, totalPrice] = shelf.watchProductEstimate(index);
    // useEffect(() => {
    //     shelf.prodArray.update(index, {});
    // }, []);
    return (
        <div className="w-full flex items-center space-x-4">
            <div className="flex-1">
                <ShelfSelect
                    control={shelf.categoryForm.control}
                    keyName={`${shelf.shelfItemKey}.products.${index}.data.productId`}
                    onValueChange={(field, v) => {
                        const productId = Number(v) || null;
                        field.onChange(productId);
                        shelf.productSelected(productId, index);
                    }}
                    defaultValue={f.data?.productId}
                    placeholder={"Select Product"}
                    items={shelf.products?.map(
                        ({ title: label, id: value }) => ({
                            label,
                            value: value.toString(),
                        })
                    )}
                />
                {/* {index == shelf.prodArray.fields.length - 1 && (
                    <Button
                        onClick={() => {
                            shelf.prodArray.append({});
                        }}
                        className="w-full mt-2"
                        size="sm"
                    >
                        <Icons.add className="w-4 h-4 mr-4" />
                        Add Product
                    </Button>
                )} */}
            </div>
            <div className="w-20">
                <FormField
                    control={shelf.categoryForm.control}
                    name={
                        `${shelf.shelfItemKey}.products.${index}.data.qty` as any
                    }
                    // name={`${shelf.getProdFormKey(index, "qty")}` as any}
                    render={({ field }) => (
                        <Input
                            className="w-full"
                            type="number"
                            // {...field}
                            defaultValue={f.data?.qty?.toString()}
                            onChange={(e) => {
                                // console.log(e.target.value);
                                field.onChange(+e.target.value);
                                shelf.updateProductPrice(
                                    index,
                                    null,
                                    +e.target.value
                                );
                            }}
                        />
                    )}
                />
            </div>
            <div className="w-24 text-right">
                <Money value={unitPrice} />
            </div>
            <div className="w-24 text-right">
                <Money value={totalPrice} />
            </div>
            <div className="w-12">
                <Button
                    onClick={() => {
                        console.log(f);
                        shelf.prodArray.remove(index);
                        // shelf.prodArray.
                        // shelf.form.reset({});
                    }}
                    className="w-8 h-8"
                    size="icon"
                    variant="ghost"
                >
                    <Icons.trash className="w-4 h-4" />
                </Button>
            </div>
        </div>
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

            const c = await _getShelfCategories(cids);
            setCategories(c);
        })();
    }, [index, shelf.catArray.fields]);
    if (!shelf.categoryForm) return <></>;

    return (
        <div>
            <ShelfSelect
                control={shelf.categoryForm.control}
                keyName={`ids.${index}.id`}
                defaultValue={field.id}
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
        </div>
    );
}
interface ShelfSelectProps {
    control;
    keyName;
    onValueChange;
    placeholder;
    items;
    defaultValue?;
}
function ShelfSelect({
    control,
    keyName,
    onValueChange,
    placeholder,
    items,
    defaultValue,
}: ShelfSelectProps) {
    return (
        <FormField
            control={control}
            name={keyName}
            render={({ field }) => (
                <>
                    <Select
                        defaultValue={defaultValue?.toString()}
                        onValueChange={(value) => {
                            onValueChange(field, value);
                        }}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {items.map((item, index) => (
                                    <SelectItem
                                        key={index}
                                        value={item.value?.toString()}
                                    >
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </>
            )}
        />
    );
}
