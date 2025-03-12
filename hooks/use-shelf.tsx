import { getShelfCateogriesAction } from "@/actions/cache/get-shelf-categories";
import { getShelfProductsAction } from "@/actions/cache/get-shelf-products";
import { useFormDataStore } from "@/app/(clean-code)/(sales)/sales-book/(form)/_common/_stores/form-data-store";
import { StepHelperClass } from "@/app/(clean-code)/(sales)/sales-book/(form)/_utils/helpers/zus/step-component-class";
import { ComboboxContent } from "@/components/ui/combobox";
import useEffectLoader from "@/lib/use-effect-loader";
import { generateRandomString } from "@/lib/utils";
import React, {
    createContext,
    useContext,
    useDeferredValue,
    useEffect,
    useMemo,
} from "react";
import { MdOutlineFormatUnderlined } from "react-icons/md";
import { useAsyncMemo } from "use-async-memo";

export const ShelfContext = createContext<
    ReturnType<typeof useCreateShelfContext>
>(null as any);
export const ShelfItemContext = createContext<
    ReturnType<typeof useCreateShelfItemContext>
>(null as any);
export const useShelf = () => useContext(ShelfContext);
export const useShelfItem = () => useContext(ShelfItemContext);
export function useCreateShelfContext(itemStepUid) {
    const { data: categories } = useEffectLoader(getShelfCateogriesAction);
    const zus = useFormDataStore();
    const [itemUid, stepUid] = itemStepUid?.split("-");
    const shelfItemUids =
        zus?.kvFormItem?.[itemUid]?.shelfItems?.lineUids || [];

    return {
        itemStepUid,
        itemUid,
        stepUid,
        categories,
        shelfItemUids,
        addSection() {
            const uid = generateRandomString();
            const puid = generateRandomString();
            zus.dotUpdate(`kvFormItem.${itemUid}.shelfItems.lines.${uid}`, {
                categoryIds: [],
                productUids: [puid],
                products: {
                    [puid]: {},
                },
            });
        },
    };
}

export function useCreateShelfItemContext({ shelfUid }) {
    const shelfCtx = useShelf();
    const zus = useFormDataStore();
    const { categories, itemStepUid } = shelfCtx;
    const { shelf, cls } = useMemo(() => {
        const cls = new StepHelperClass(itemStepUid);
        const shelfItems = cls.getItemForm().shelfItems;
        // if (!shelfItems)
        // cls.dotUpdateItemForm("shelfItems", {
        // [uid]:           { products: [], categoryIds: [] },
        // });

        return {
            cls,
            shelf: shelfItems.lines?.[shelfUid],
        };
    }, []);
    const options = useMemo(() => {
        if (shelf.categoryIds.length == 0)
            return categories?.filter((a) => a.type == "parent");
        const _catId = Number([...shelf.categoryIds].pop());
        const lastCat = categories.find((a) => a.id == _catId);
        console.log({
            _catId,
            lastCat,
        });
        const options = categories.filter((a) => a.categoryId == lastCat?.id);
        return options;
    }, [categories, shelf.categoryIds]);

    const [inputValue, setInputValue] = React.useState("");
    const deferredInputValue = useDeferredValue(inputValue);
    const filteredTricks = React.useMemo(() => {
        if (!deferredInputValue) return options;
        const normalized = deferredInputValue.toLowerCase();
        return options.filter((item) =>
            item.name.toLowerCase().includes(normalized)
        );
    }, [deferredInputValue, options]);

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
    const products = useAsyncMemo(async () => {
        const category = categories?.find(
            (c) => c.id == Number([...shelf.categoryIds].pop())
        );
        let subCats = categories?.filter((c) => c.categoryId == category?.id);
        let cid = !subCats?.length && category ? [category.id] : null;
        if (!cid && subCats?.length && category) {
            //
            cid = [];
            function scrapeFinalCats(id) {
                let _subCats = categories?.filter((c) => c.categoryId == id);

                if (!_subCats?.length) cid.push(id);
                _subCats?.map((subCat) => {
                    scrapeFinalCats(subCat.id);
                });
            }
            scrapeFinalCats(category?.id);
        }

        const products = await getShelfProductsAction(cid);
        console.log({ products });
        return products;
    }, [shelf.categoryIds, categories]);
    return {
        filteredTricks,
        setContent,
        // prodUids: shelf.productUids,
        deferredInputValue,
        inputValue,
        options,
        ...shelf,
        setCategoryIds(ids) {
            cls.dotUpdateItemForm(
                `shelfItems.lines.${shelfUid}.categoryIds`,
                ids
            );
        },
        products,
        onInputValueChange,
        addProduct() {
            const puid = generateRandomString();
            cls.dotUpdateItemForm(`shelfItems.lines.${shelfUid}.productUids`, [
                ...shelf.productUids,
                puid,
            ]);
            cls.dotUpdateItemForm(
                `shelfItems.lines.${shelfUid}.products.${puid}`,
                {} as any
            );
        },
        productChanged(prodUid, value) {
            console.log({ prodUid, value });
        },
        deleteProductLine(puid) {
            cls.dotUpdateItemForm(
                `shelfItems.lines.${shelfUid}.productUids`,
                [...shelf.productUids].filter((a) => a != puid)
            );
            const data = cls.dotGet(
                `kvFormItem.${shelfCtx.itemUid}.shelfItems.lines.${shelfUid}.products`
            );
            if (data) delete data[puid];
            console.log({ data });

            zus.dotUpdate(
                `kvFormItem.${shelfCtx.itemUid}.shelfItems.lines.${shelfUid}.products`,
                data
            );
        },
    };
}
