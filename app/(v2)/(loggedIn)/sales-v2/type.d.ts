import { DykeSalesShelfItem } from "@prisma/client";

export interface IDykeSalesItem {
    meta: {
        shelfItem: {
            categoryIds: number[];
            productId;
            price;
            title;
        };
    };
}
export interface DykeForm {
    items: { [index in string]: DykeItemForm };
    currentItemIndex: string | null;
    itemsIndex: number[];
    itemBlocks: {
        [itemIndex in string]: {
            blocks: any[];
            openedBlockIndex: number;
        };
    };
}
export interface DykeItemForm {
    meta: {
        configIndex;
        config: { [label in string]: string };
        // shelfItem: {};
    };
    shelfItems: CategorizedShelfItem[];
}
export interface CategorizedShelfItem {
    categoryId: number | undefined;
    categoryIds: number[];
    products: { data: DykeShelfItemForm }[];
}
export interface DykeShelfItemForm extends Omit<DykeSalesShelfItem, "meta"> {
    meta: {
        categoryIds: number[];
    };
}
export interface IDykeFormContext {
    currentItemIndex: string | null;
    setOpened(index);
}
export interface DykeBlock {
    title;
    options: { title; img }[];
}
