import {
    DykeDoorType,
    DykeStepTitleKv,
    DykeStepTitles,
    StepMeta,
} from "../../types";
import { transformSalesStepMeta } from "../data-access/dto/sales-step-dto";
import { LoadSalesFormData } from "../data-access/sales-form-settings.dta";
import { GetStepsForRoutingProps } from "../data-access/sales-form-step-dta";

export function composeStepRouting(fdata: LoadSalesFormData) {
    const sectionKeys = Object.keys(fdata.setting?.data?.route || [])?.map(
        (uid) => ({ uid })
    );
    const stepsByKey: {
        [uid in string]: {
            id;
            title;
            uid;

            meta: StepMeta;
            components: {
                uid: string;
                title: string;
                redirectUid: string;
            }[];
        };
    } = {};
    // fdata.rootStep
    const rootComponentsByKey: {
        [uid in string]: { id?; title; uid; stepUid? };
    } = {};
    fdata.rootStep.stepProducts.map((s) => {
        rootComponentsByKey[s.uid] = {
            uid: s.uid,
            title: s.product.title,
            stepUid: fdata.rootStep.uid,
        };
    });
    [...fdata.steps, fdata.rootStep].map((step) => {
        const { stepProducts, id, title, uid, ...rest } = step;
        stepsByKey[step.uid] = {
            meta: transformSalesStepMeta(rest)?.meta,
            id,
            title,
            uid,
            components: stepProducts?.map((p) => ({
                title: p.product?.title || p.door?.title,
                uid: p.uid,
                variations: p.meta?.variations || [],
                redirectUid: p.redirectUid,
            })),
        };
    });
    const composedRouter = { ...(fdata.setting?.data?.route || {}) };
    Object.keys(composedRouter).map((routeKey) => {
        composedRouter[routeKey].route = {};

        let crk = routeKey;
        composedRouter[routeKey].routeSequence?.map((s) => {
            composedRouter[routeKey].route[crk] = s.uid;
            crk = s.uid;
        });
    });
    return {
        ...fdata,
        composedRouter,
        sectionKeys,
        stepsByKey,
        rootComponentsByKey,
    };
}

const customSteps: Partial<{
    [section in DykeDoorType | "DEFAULT"]: DykeStepTitleKv;
}> = {
    DEFAULT: {
        "Shelf Items": "Shelf Items",
        "Cutdown Height": "House Package Tool",
        "Jamb Species": "Jamb Size",
        Door: "Jamb Species",
        "Jamb Size": "Jamb Type",
        "Door Type": "Door",
    },
    Bifold: {
        "Item Type": "Height",
        // "Door Configuration": "Height",
        Height: "Door Type",
        "Door Type": "Door",
        Door: "House Package Tool",
    },
    Exterior: {
        "Door Type": "Category",
        Category: "Door",
    },
    Moulding: {
        "Item Type": "Specie",
        Specie: "Moulding",
        Moulding: "Line Item",
    },
    Services: {
        "Item Type": "Line Item",
    },
    "Door Slabs Only": {
        Door: "House Package Tool",
        "Item Type": "Height",
        Height: "Door Type",
    },
};
function isEnd(stepTitle) {
    const end: DykeStepTitles[] = ["House Package Tool", "Line Item"];
    return end.includes(stepTitle);
}
function isStepHidden(stepTitle, doorType: DykeDoorType) {
    let title = stepTitle?.toLowerCase();

    let steps = [...hiddenSteps];

    switch (doorType) {
        case "Bifold":
            steps.push(...bifoldHiddenSteps);
            break;
        case "Door Slabs Only":
            steps.push(...doorSlabHiddenSteps);
            break;
    }
    return steps.includes(title?.toLowerCase());
}
const hiddenSteps = [
    "width",
    "hand",
    "casing 1x4 setup",
    "--jamb stop",
    "rip jamb",
    "jamb size",
    "jamb species",
];
const bifoldHiddenSteps = [
    // "door configuration",
    // "door type",
    "bore",
    "jamb size",
    "casing",
    "jamb species",
    "jamb type",
    "cutdown height",
    "casing y/n",
    "hinge finish",
    "casing side choice",
    "casing species",
    "cutdown height",
];
const doorSlabHiddenSteps = [
    "door configuration",
    "bore",
    "jamb size",
    "casing",
    "jamb species",
    "jamb type",
    "cutdown height",
    "casing y/n",
    "hinge finish",
    "door type",
    "casing side choice",
    "casing species",
    "cutdown height",
];
