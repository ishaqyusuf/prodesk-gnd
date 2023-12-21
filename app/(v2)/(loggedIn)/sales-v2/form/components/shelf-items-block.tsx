"use client";

import { useContext, useEffect, useState } from "react";
import { UseFormReturn, useFieldArray, useForm } from "react-hook-form";
import { IDykeSalesItem } from "../../type";
import { SalesFormContext } from "../sales-form-context";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getShelfProducts } from "../_action/get-shelf-products.actions";
import { FormField } from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { _getShelfCategories } from "../_action/get-shelf-categories";
import { DykeShelfCategories } from "@prisma/client";

interface Props {}

export default function ShelfItemsBlock({}: Props) {
    const { form, rowIndex } = useContext(SalesFormContext);
    const configky = `items.${rowIndex}.meta.shelfItem`;

    const w = form.watch(configky as any);
    const categoryForm = useForm({
        defaultValues: {
            ids: [
                {
                    cid: -1,
                },
            ],
        },
    });
    const { fields, append } = useFieldArray({
        control: categoryForm.control,
        name: "ids",
    });
    useEffect(() => {
        const oldf = form.getValues(configky as any);
        categoryForm.setValue(
            "ids",
            (oldf?.categoryIds || [-1])?.map((cid) => ({ cid }))
        );
    }, []);
    const [products, setProducts] = useState([]);
    async function getProducts(parentCategoryId, categoryId) {
        const { subCategoriesCount, products } = await getShelfProducts(
            parentCategoryId,
            categoryId
        );
        console.log(subCategoriesCount, products);
        if (subCategoriesCount) {
            append({ cid: -1 });
        }
    }
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Category</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            {/* {JSON.stringify(fields)} */}
                            {fields.map((field, index) => (
                                <ShelfCategory
                                    form={categoryForm}
                                    index={index}
                                    parentCategoryId={
                                        index == 0 ? null : field[0]?.cid
                                    }
                                    categoryId={
                                        index > 0 ? field[index - 1]?.cid : null
                                    }
                                    key={field.id}
                                    field={field}
                                />
                            ))}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}
function ShelfCategory({ field, index, form, parentCategoryId, categoryId }) {
    const [categories, setCategories] = useState<DykeShelfCategories[]>([]);

    useEffect(() => {
        // console.log(field);
        (async () => {
            setCategories(await _getShelfCategories(categoryId, parent));
        })();
    }, [parentCategoryId, categoryId]);
    return (
        <div>
            <FormField
                control={form.control}
                name={`ids.${index}.cid`}
                render={({ field }) => (
                    <Select
                        value={`${field.value}`}
                        onValueChange={field.onChange}
                    >
                        <SelectTrigger className="h-6   w-auto min-w-[100px]">
                            <SelectValue placeholder="Delivery" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="pickup">Pickup</SelectItem>
                                <SelectItem value="delivery">
                                    Delivery
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                )}
            />
        </div>
    );
}
