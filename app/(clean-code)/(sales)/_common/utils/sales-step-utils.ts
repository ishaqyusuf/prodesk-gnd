import { DykeDoorType } from "../../types";
import { GetStepsForRoutingProps } from "../data-access/sales-form-step-dta";

export function composeStepRouting(data: GetStepsForRoutingProps) {
    const routes: {
        [itemTypeUid in string]: {
            title: DykeDoorType;
            routes: { [routeUid in string]: number };
        };
    } = {};
    // const flatStepProds = data.map((s) => s.stepProducts.flat()).flat();
    const debug = {
        noNextStep: 0,
        nextStep: 0,
        nextStepId: 0,
    };
    const fdata = data.filter((d, i) => {
        const f1 = data.findIndex((a) => a.title == d.title) == i;
        if (d.title == "Door Type") return d.id == 41;
        return f1;
    });
    // console.log(fdata.filter((s) => s.stepValueId).length);
    // fdata
    //     .filter((a, v) => v < 5)
    //     .map((d) => {
    //         console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>");
    //         console.log(d);
    //     });
    fdata
        .filter((d) => d.id == 1)
        .map((root) => {
            // console.log(root.value);
            // routes[root.title] = {};
            const nextSteps = fdata.filter((d) => {
                return [
                    d.title != root.title,
                    d.rootStepValueId == (d.rootStepValueId || 1),
                    d.stepValueId == root.stepValueId,
                ].every(Boolean);
            });
            const [nt] = nextSteps;
            root.stepProducts.map((sp) => {
                routes[sp.uid] = {
                    title: sp.product.title as any,
                    routes: {},
                };

                console.log("NT", nextSteps?.[0], nextSteps.length);
                // const nextStep = fdata.find(
                //     (s) =>

                // );
                // console.log({ ns: nextStep.title, r: root.stepValueId });

                // while (findNext) {
                //     findNext = false;
                // }
                // console.log(sp.uid);
            });
        });
    fdata.map((step) => {
        const nextStep = data.find((p) => p.prevStepValueId == step.id);
        if (nextStep) debug.nextStep++;
        else debug.noNextStep++;
        step.stepProducts.map((component) => {
            // if (component.nextStepId) debug.nextStepId++;
        });
    });
    console.log(debug);
    return routes;
}
