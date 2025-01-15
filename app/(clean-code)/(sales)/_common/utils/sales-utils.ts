import { DykeSteps, SalesStat } from "@prisma/client";
import { DykeDoorType, SalesStatStatus, QtyControlType } from "../../types";
import { Colors } from "@/lib/status-badge";

export function inToFt(_in) {
    if (_in.includes("-")) return _in;
    let _ft = _in;
    const duo = _ft.split("x");
    if (duo.length == 2) {
        // console.log(_ft);

        return `${inToFt(duo[0]?.trim())} x ${inToFt(duo[1]?.trim())}`;
    }
    try {
        _ft = +_in.split('"')?.[0]?.split("'")[0]?.split("in")?.[0];
        if (_ft > 0) {
            _ft = +_ft;
            const ft = Math.floor(_ft / 12);
            const rem = _ft % 12;
            return `${ft}-${rem}`;
        }
    } catch (e) {}
    return _in;
}
export function ftToIn(h) {
    const [ft, _in] = h
        ?.split(" ")?.[0]
        ?.split("-")
        ?.map((s) => s?.trim())
        .filter(Boolean);
    return `${+_in + +ft * 12}in`;
}
export function createSaleStat(type: QtyControlType, score, total, salesId) {
    const percentage = (score / total) * 100 || 0;
    return {
        type,
        score,
        total,
        salesId,
        percentage,
    };
}
export function statStatus(stat: SalesStat): {
    color: Colors;
    status: SalesStatStatus;
    scoreStatus: string;
} {
    const { percentage, score, total } = stat || {};
    let scoreStatus = "";
    if (score > 0 && score != total) scoreStatus = `${score}/${total}`;

    if (percentage === 0 && total > 0)
        return {
            color: "warmGray",
            status: "pending",
            scoreStatus,
        };
    if (percentage == 0)
        return {
            color: "amber",
            status: "N/A" as any,
            scoreStatus,
        };
    if (percentage > 0 && percentage < 100)
        return {
            color: "rose",
            status: "in progress",
            scoreStatus,
        };
    if (percentage === 100)
        return {
            status: "completed",
            color: "green",
            scoreStatus,
        };
    return {
        color: "stone",
        status: "unknown",
        scoreStatus,
    };
}

const DontShowComponents = [
    "Door",
    "Item Type",
    "Moulding",
    "House Package Tool",
    "Height",
    "Hand",
    "Width",
];
export function validateShowComponentStyle(formStep) {
    const step: DykeSteps = formStep.step;
    const title = step?.title;
    return DontShowComponents.every((s) => s != title) && title != null;
}
export function itemLineIndex(line) {
    return Number(line?.meta?.line_index || line?.meta?.uid || 0);
}
export function sortSalesItems(a, b) {
    return itemLineIndex(a) - itemLineIndex(b);
}
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
        multiHandles: false,
    };
    resp.hasSwing = resp.garage;
    resp.multiHandles = resp.interior || resp.exterior || resp.garage;
    // resp.interior || resp.exterior || resp.garage || !type;
    return resp;
}
export function isNewSales(orderId) {
    return ["quo-", "ord-"].some((a) => orderId?.toLowerCase()?.startsWith(a));
}
