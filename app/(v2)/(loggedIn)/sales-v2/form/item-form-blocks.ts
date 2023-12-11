function createBlock(title, options?) {
    return { title, options };
}
function createBlockItem(title, img?) {
    return { title, img };
}
export interface Block {
    title;
    options: { title; img }[];
}
export const itemFormBlocks: Block[] = [
    createBlock("Door Type", [
        createBlockItem("Interior"),
        createBlockItem("Exterior"),
        createBlockItem("Shelf Items"),
    ]),
];
