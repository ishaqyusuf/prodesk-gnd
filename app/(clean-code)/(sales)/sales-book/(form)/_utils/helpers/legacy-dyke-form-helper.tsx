import { DykeDoorType } from "../../../../types";
import { IDykeComponentStore } from "../../_hooks/data-store";
import {
    LegacyDykeFormItemType,
    LegacyDykeFormStepType,
} from "../../_hooks/legacy-hooks";

const helpers = {
    item: {
        getDoorType,
    },
    step: {
        loadComponents,
        getStepTitle,
    },
};
function getStepTitle(stepCtx: LegacyDykeFormStepType) {
    const formStep = stepCtx.step.step.title;
    return formStep;
}
function getDoorType(itemCtx: LegacyDykeFormItemType): DykeDoorType {
    const steps = itemCtx.mainCtx.form.getValues(
        `itemArray.${itemCtx.rowIndex}.item.formStepArray`
    );
    console.log({ steps });
    return steps?.find((s) => s.step.title == "Item Type")?.item?.value as any;
}
async function loadComponents(
    storeComponentsByTitle: IDykeComponentStore["loadedComponentsByStepTitle"],
    stepCtx: LegacyDykeFormStepType
) {
    const title = helpers.step.getStepTitle(stepCtx);
    const storedComponents = storeComponentsByTitle[title];
    // console.log({ storedComponents, title });
    return storedComponents || [];
}
const legacyDykeFormHelper = helpers;
export default legacyDykeFormHelper;
