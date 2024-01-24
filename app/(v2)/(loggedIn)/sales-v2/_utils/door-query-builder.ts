import { addSpacesToCamelCase, camel } from "@/lib/utils";
import { DykeForm, FormStepArray } from "../type";

export function doorQueryBuilder(steps: FormStepArray) {
    const obj = toKeyValue(steps);

    let q: any[] = [];
    let p1: any = `x${obj.height} `;
    let omit: any[] = ["primed", "pine", "prm"];
    switch (obj.doorType) {
        case "HC Molded":
            // q.push("hc"); //shaker door slab
            p1 += "hc ";
            omit.push("hc flush");
            break;
        case "SC Molded":
            // q.push("sc");
            omit.push("sc flush");
            p1 += "sc ";
            break;
        case "HC Flush":
        case "SC Flush":
            // q.push(obj.doorType);
            p1 += obj.doorType;
            break;
        case "Wood Stile & Rail":
            // omit = ["hc", "sc"];
            omit = [];

            q.push(p1);
            p1 = null;
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
    if (p1) q.push(p1);

    switch (obj.doorType0) {
        case "Garage":
            q.push("1-3/4");
            break;
        default:
            q.push("1-3/8");
            break;
    }
    return {
        q, //: q.join(" "),
        qty: obj.qty,
        omit,
    };
}
function toKeyValue(step: FormStepArray) {
    const obj: {
        doorConfiguration: string;
        doorType0: "Interior" | "Garage";
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
