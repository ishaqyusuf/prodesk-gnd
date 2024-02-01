import { camel } from "@/lib/utils";
import { FormStepArray } from "../type";
export type DoorTypes = "Interior" | "Garage" | "Bifold";

export function doorQueryBuilder(steps: FormStepArray, doorType: DoorTypes) {
    const obj = toKeyValue(steps);
    // console.log(obj);

    let q: any[] = [`x${obj.height} `];

    // let p1: any = `x${obj.height} `;
    let omit: any[] = []; //["primed", "pine", "prm"];
    // q.push(p1);
    // p1 = null;
    if (doorType != "Garage")
        switch (obj.doorType) {
            case "HC Molded":
                // q.push("hc"); //shaker door slab
                // p1 += "hc ";

                q.push("hc ");
                // omit.push("hc flush");
                break;
            case "SC Molded":
                // q.push("sc");
                // omit.push("sc flush");
                // p1 = null;
                // p1 += "sc ";
                q.push("sc ");
                break;
            case "HC Flush":
            case "SC Flush":
                // q.push(obj.doorType);
                // p1 += obj.doorType;
                // p1 = null;
                q.push(obj.doorType);
                break;
            case "Wood Stile & Rail":
                // omit = ["hc", "sc"];
                omit = [];

                // q.push(p1);
                // p1 = null;
                switch (obj.doorSpecies) {
                    case "Pine":
                        q.push("pine");
                        // omit.push("primed", "prm");
                        break;
                    case "Primed":
                        q.push("primed", "prm");
                        omit.push("pine");
                        break;
                }
                break;
        }
    // if (p1) q.push(p1);

    switch (doorType) {
        case "Garage":
            q.push("1-3/4");
            break;
        default:
            q.push("1-3/8");
            break;
    }
    // console.log(q, doorType);

    // q = ["x8-0", "1-3/8"];

    return {
        q, //: q.join(" "),
        qty: obj.qty,
        omit,
    };
}
function toKeyValue(step: FormStepArray) {
    const obj: {
        doorConfiguration: string;
        doorType0: DoorTypes;
        height: string;
        doorType:
            | "HC Molded"
            | "SC Molded"
            | "HC Flush"
            | "SC Flush"
            | "Wood Stile & Rail";
        doorSpecies: "Pine" | "Primed";
        qty: number;
    } = {} as any;
    step.map((s) => {
        let k: keyof typeof obj = camel(s.step.title as any) as any;
        if (k == "doorType" && !obj.doorType0) k = "doorType0";
        const v = (obj[k as any] = s.item.value as any);
        if (k == "doorConfiguration")
            obj.qty = v?.toLowerCase().includes("double");
    });
    return obj;
}
