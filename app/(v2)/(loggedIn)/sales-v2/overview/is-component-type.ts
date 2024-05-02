import { DykeDoorType } from "../type";

export function isComponentType(type: DykeDoorType) {
    const resp = {
        slab: type == "Door Slabs Only",
        bifold: type == "Bifold",
        service: type == "Services",
        garage: type == "Garage",
        shelf: type == "Shelf Items",
        exterior: type == "Exterior",
        interior: type == "Interior",
        moulding: type == "Moulding",
        hasSwing: false,
    };
    resp.hasSwing = resp.interior || resp.exterior;
    return resp;
}