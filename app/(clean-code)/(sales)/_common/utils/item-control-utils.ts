export type ItemControlTypes = "door" | "molding" | "item";

export type ItemControl = {
    type: ItemControlTypes;
    doorId?;
    dim?;
    itemId?;
    hptId?;
};
export function itemControlUid(props: ItemControl) {
    const stacks = [props.type];
    if (props.doorId) {
        stacks.push(props.doorId);
        stacks.push(props.dim);
    } else {
        stacks.push(props.itemId);
        if (props.hptId) stacks.push(props.hptId);
    }
    return stacks.join("-");
}
export function itemControlUidObject(str) {
    const [type, x, ...y]: [ItemControlTypes, string, string[]] =
        str.split("-");
    const obj: ItemControl = { type };
    if (type == "door") {
        obj.doorId = x;
        obj.dim = y.join("-");
    } else {
        obj.itemId = x;
        if (type == "molding") obj.hptId = y?.[0];
    }
    return obj;
}
export function itemItemControlUid(itemId) {
    return itemControlUid({
        type: "item",
        itemId,
    });
}
export function doorItemControlUid(doorId, dim) {
    return itemControlUid({
        type: "door",
        doorId,
        dim,
    });
}
export function mouldingItemControlUid(itemId, hptId) {
    return itemControlUid({
        type: "molding",
        itemId,
        hptId,
    });
}
