import { DykeDoorType, DykeStepTitleKv, DykeStepTitles } from "../../types";
import { LoadSalesFormData } from "../data-access/sales-form-settings.dta";
import { GetStepsForRoutingProps } from "../data-access/sales-form-step-dta";

export function composeStepRouting(fdata: LoadSalesFormData) {
    const sectionKeys = Object.keys(fdata.setting?.data?.route || [])?.map(
        (uid) => ({ uid })
    );
    const stepsByKey: { [uid in string]: { id; title; uid } } = {};
    // fdata.rootStep
    const rootComponentsByKey: {
        [uid in string]: { id?; title; uid };
    } = {};
    fdata.rootStep.stepProducts.map((s) => {
        rootComponentsByKey[s.uid] = {
            uid: s.uid,
            title: s.product.title,
        };
    });
    fdata.steps.map((step) => {
        const { stepProducts, id, title, uid, ...rest } = step;
        stepsByKey[step.uid] = { id, title, uid };
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
    // // const flatStepProds = data.map((s) => s.stepProducts.flat()).flat();
    // routes = {};
    // // console.log(fdata.filter((s) => s.stepValueId).length);
    // // fdata
    // //     .filter((a, v) => v < 5)
    // //     .map((d) => {
    // //         console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>");
    // //         console.log(d);
    // //     });
    // // function registerNext
    // function getNext(step) {
    //     const nextSteps = fdata.filter((d) => {
    //         return [
    //             d.title != step.title,
    //             d.rootStepValueId == (d.rootStepValueId || 1),
    //             d.stepValueId == step.stepValueId || null,
    //         ].every(Boolean);
    //     });
    //     const [nt] = nextSteps;
    //     const { stepProducts, ...rest } = step;
    //     console.log(step.title, rest, {});
    //     return nt;
    // }
    // function getCustomRoute(doorType, stepTitle) {
    //     const customRouteTitle =
    //         customSteps[doorType]?.[stepTitle] ||
    //         customSteps.DEFAULT[stepTitle];
    //     if (customRouteTitle) {
    //         const customStep = fdata.find((d) => d.title == customRouteTitle);
    //         return customStep;
    //     }
    //     return null;
    // }
    // function registerNextSubStep(
    //     step: GetStepsForRoutingProps[number],
    //     rootUid,
    //     doorType
    // ) {
    //     // if (debug.c > 40) return null;
    //     const nt = getCustomRoute(doorType, step.title) || getNext(step);
    //     if (nt) {
    //         const hidden = isStepHidden(nt.title, doorType);
    //         console.log(
    //             `  ${doorType}: ${step.title}(${step.id}) ::::: ${nt.title}(${nt.id}) [${hidden}]`
    //         );
    //         routes[rootUid].routes[step.uid] = {
    //             stepId: nt.id,
    //             uid: nt.uid,
    //             title: nt.title,
    //             hidden,
    //         };
    //         step.stepProducts.map((sp) => {
    //             const nextStepId = sp.nextStepId;
    //             const customToStep = fdata.find((s) => s.id == nextStepId);
    //             if (nextStepId && customToStep) {
    //                 routes[rootUid].routes[`${step.uid}-${sp.uid}`] = {
    //                     stepId: customToStep.id,
    //                     uid: customToStep.uid,
    //                     title: customToStep.title,
    //                     hidden: isStepHidden(customToStep.title, doorType),
    //                 };
    //                 console.log(
    //                     "NEXT STEP ID>>>.",
    //                     sp.product?.title,
    //                     customToStep?.title
    //                 );
    //             }
    //         });
    //         if (!isEnd(nt.title)) registerNextSubStep(nt, rootUid, doorType);
    //     }
    //     return null;
    // }
    // fdata
    //     .filter((d) => d.id == 1)
    //     .map((root) => {
    //         const nt = getNext(root);
    //         root.stepProducts
    //             .filter((s) => s.product?.title == "Interior")
    //             .map((sp) => {
    //                 // sp.nextStepId
    //                 console.log(sp.product?.title);
    //                 const doorType = sp.product.title as any;
    //                 const spt = getCustomRoute(doorType, root.title) || nt;
    //                 routes[sp.uid] = {
    //                     title: doorType,
    //                     routes: {},
    //                 };
    //                 if (spt) {
    //                     const ntt = (routes[sp.uid].routes[sp.uid] = {
    //                         stepId: spt.id,
    //                         uid: spt.uid,
    //                         title: spt.title,
    //                         hidden: isStepHidden(spt.title, doorType),
    //                     });
    //                     if (!isEnd(spt.title)) {
    //                         registerNextSubStep(spt, sp.uid, doorType);
    //                     } else {
    //                         console.log(`end: ${spt.title}`);
    //                         console.log(ntt);
    //                     }
    //                 } else {
    //                 }
    //                 console.log("...................................");
    //             });
    //     });
    // // fdata.map((step) => {
    // //     const nextStep = data.find((p) => p.prevStepValueId == step.id);
    // //     if (nextStep) debug.nextStep++;
    // //     else debug.noNextStep++;
    // //     step.stepProducts.map((component) => {
    // //         // if (component.nextStepId) debug.nextStepId++;
    // //     });
    // // });
    // console.log({ routes });
    // return routes;
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
