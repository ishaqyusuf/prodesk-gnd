import { itemFormBlocks } from "./form/item-form-blocks";
import { DykeItemForm } from "./type";

export default {
    newItem(index): {
        item: { [id in string]: DykeItemForm };
        block: { [id in string]: any };
    } {
        return {
            item: {
                [index]: {
                    meta: {
                        configIndex: 0,
                        config: {},
                    },
                    shelfItems: [
                        {
                            categoryIds: [],
                            categoryId: undefined,
                            products: [
                                {
                                    data: {
                                        meta: {
                                            categoryIds: [],
                                        },
                                    } as any,
                                },
                            ],
                        },
                        // {
                        //     categoryIds: [],
                        //     products: [
                        //         {
                        //             data: {
                        //                 meta: {
                        //                     categoryIds: [],
                        //                 },
                        //             },
                        //         },
                        //     ],
                        // },
                    ],
                } as DykeItemForm as any,
            },
            block: {
                [index]: {
                    blocks: [itemFormBlocks[0]],
                    openedBlockIndex: 0,
                },
            },
        };
    },
};
