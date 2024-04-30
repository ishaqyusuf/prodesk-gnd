import {
    DykeSalesDoors,
    DykeSalesShelfItem,
    DykeShelfProducts,
    DykeStepForm,
} from "@prisma/client";
import { getStepForm } from "./form/_action/get-dyke-step";
import { getDykeFormAction } from "./form/_action/get-dyke-form";

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
export type DykeDoorType =
    | "Interior"
    | "Exterior"
    | "Shelf Items"
    | "Garage"
    | "Bifold"
    | "Moulding"
    | "Door Slabs Only"
    | "Services";
type DykeStep = Awaited<ReturnType<typeof getStepForm>>;
// type IDykeStepForm = {
//     data: DykeStepForm;
//     step: Awaited<ReturnType<typeof getStepForm>>;
// };
export interface DykeForm
    extends Awaited<ReturnType<typeof getDykeFormAction>> {}
export type FormStepArray = DykeForm["itemArray"][0]["item"]["formStepArray"];
// export interface DykeForm {
//     items: { [index in string]: DykeItemForm };
//     currentItemIndex: string | null;
//     itemsIndex: number[];
//     itemBlocks: {
//         [itemIndex in string]: {
//             blocks: ItemBlock[];
//             openedStepIndex: number;
//         };
//     };
// }
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
    productArray: { item: DykeShelfItemForm }[];
}
export interface ShelfItemMeta {
    categoryIds: number[];
}
export type IDykeShelfProducts = Omit<DykeShelfProducts, "meta"> & {
    meta: ShelfItemMeta;
};
export type IDykeShelfProductsForm = IDykeShelfProducts & {
    _meta: {
        categories: { id: number }[];
        parentCategoryId;
    };
};
export interface DykeFormStepMeta {
    hidden?: boolean;
}
export interface DykeProductMeta {
    svg;
    url;
    mouldingSpecies: { [id in string]: boolean };
}
export interface DykeShelfItemForm extends Omit<DykeSalesShelfItem, "meta"> {
    meta: {
        categoryIds: number[];
    };
}
export type MultiDyke = {
    components: {
        [doorTitle in string]: {
            checked?: boolean;
            heights: {
                [height in string]: {
                    checked?: boolean;
                    dim?: string;
                    width?: string;
                };
            };
            toolId?;
            itemId?;
            qty: number | null;
            doorQty: number | null;
            unitPrice: number | null;
            totalPrice: number | null;
            hptId: number | null;
            description?: string;
            doorTotalPrice: number | null;
            _doorForm: {
                [dim in string]: DykeSalesDoors;
            };
        };
    };
    uid?: string;
    multiDyke?: boolean;
    primary?: boolean;
    rowIndex?;
};
export interface IDykeFormContext {
    startLoadingStep;
    loadingStep: boolean;
    itemArray: UseFieldArrayReturn<DykeForm, "itemArray", "id">;
}
export interface DykeBlock {
    title;
    options: { title; img }[];
}
