import { useContext, useEffect, useState } from "react";
import { DykeItemFormContext, useDykeForm } from "./form-context";
import {
    UseFieldArrayReturn,
    UseFormReturn,
    useFieldArray,
    useForm,
} from "react-hook-form";
import { CategorizedShelfItem, DykeForm, DykeShelfItemForm } from "./type";
import { IDykeItemFormContext } from "./use-dyke-item";
import { DykeShelfProducts } from "@prisma/client";
import { getShelfProducts } from "./form/_action/get-shelf-products.actions";

export default function useShelfItem(shelfIndex): IUseShelfItem {
    const form = useDykeForm();
    const item = useContext(DykeItemFormContext);
    const configky = `items.${item.rowIndex}.shelfItems.${shelfIndex}`;
    const categoryForm = useForm({
        defaultValues: {
            ids: [
                {
                    cid: -1,
                },
            ],
        },
    });
    const categoryProdsKey = `${configky}.products`;
    const prodArray = useFieldArray({
        control: form.control,
        name: categoryProdsKey as any,
    });
    useEffect(() => {
        const oldf: CategorizedShelfItem = form.getValues(configky as any);
        categoryForm.setValue(
            "ids",
            (oldf?.categoryIds || [-1])?.map((cid) => ({ cid }))
        );
    }, []);
    const catArray = useFieldArray({
        control: categoryForm.control,
        name: "ids",
    });
    const [products, setProducts] = useState<
        DykeShelfProducts[] | undefined | null
    >(null);

    return {
        categoryForm,
        catArray,
        prodArray: prodArray as any,
        form,
        item,
        shelfItemKey: configky,
        productSelected(productId, prodIndex) {
            let prod = products?.find((p) => p.id == productId);
            if (prod) {
                console.log(prod);
                const prodKey: any = `${configky}.products.${prodIndex}.data`;
                form.setValue(`${prodKey}.productId` as any, prod.id);
                form.setValue(`${prodKey}.unitPrice` as any, prod?.unitPrice);
                // form.setValue()
                this.updateProductPrice(prodIndex, prod?.unitPrice);
            }
        },
        getProdFormKey(prodIndex, ...path) {
            let paths = path.map(
                (p) => `${configky}.products.${prodIndex}.data.${p}` as any
            );
            if (path.length == 1) return paths[0];
            return paths;
        },
        updateProductPrice(prodIndex, unitPrice?) {
            const [qtyPath, unitPricePath, totalPath] = this.getProdFormKey(
                prodIndex,
                "qty",
                "unitPrice",
                "totalPrice"
            );
            let qty = +form.getValues(qtyPath);
            if (!unitPrice) unitPrice = form.getValues(unitPricePath);
            if (!qty) {
                qty = 1;
                form.setValue(qtyPath, 1);
            }
            let totalPrice = (qty || 0) * (unitPrice || 0);
            form.setValue(totalPath, totalPrice);
        },
        getParentCategoryId(index) {
            return index == 0 ? null : catArray.fields[0]?.cid;
        },
        getCategoryId(index) {
            return index > 0 ? catArray.fields[index - 1]?.cid : null;
        },
        shelfCategoryIds(index) {
            return {
                categoryId: this.getCategoryId(index),
                parentCategoryId: this.getParentCategoryId(index),
            };
        },
        products,
        async categorySelected(index, categoryId) {
            let removeIndices: number[] = [];
            for (let i = index + 1; i < catArray.fields.length; i++)
                removeIndices.push(i);
            if (removeIndices.length) catArray.remove(removeIndices);
            setProducts(null);
            const parentCategoryId = this.getParentCategoryId(index);
            console.log({ categoryId, parentCategoryId });
            const { subCategoriesCount, products } = await getShelfProducts(
                parentCategoryId,
                categoryId
            );
            if (subCategoriesCount) {
                catArray.append({ cid: -1 });
            } else {
                setProducts(products);
            }
        },
    };
}

interface CategoryForm {
    ids: { cid: number }[];
}
export interface IUseShelfItem {
    products: DykeShelfProducts[] | undefined | null;
    getProdFormKey(prodIndex, ...path: (keyof DykeShelfItemForm)[]): any;
    updateProductPrice(prodIndex, unitPrice);
    categorySelected(index, categoryId): Promise<any>;
    getParentCategoryId(index): number | null | undefined;
    getCategoryId(index): number | null | undefined;
    shelfCategoryIds(index): {
        categoryId: number | null | undefined;
        parentCategoryId: number | null | undefined;
    };
    categoryForm: UseFormReturn<CategoryForm>;
    catArray: UseFieldArrayReturn<CategoryForm>;
    prodArray: UseFieldArrayReturn<DykeShelfItemForm>;
    item: IDykeItemFormContext;
    form: UseFormReturn<DykeForm>;
    shelfItemKey: string;
    productSelected(productId: number | undefined | null, prodIndex);
}
