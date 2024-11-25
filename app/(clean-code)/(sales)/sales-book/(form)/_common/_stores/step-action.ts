import { zhItemUidFromStepUid } from "../../_utils/helpers/zus/zus-form-helper";
import { SalesFormSet } from "./form-data-store";

export function stepActions(set: SalesFormSet) {
    return {
        toggleStep: (stepUid) =>
            set((state) => {
                const newState = { ...state };
                const uid = zhItemUidFromStepUid(stepUid);
                const kvFormItem = newState.kvFormItem[uid];
                const currentStepUid = kvFormItem.currentStepUid;
                if (currentStepUid != stepUid)
                    kvFormItem.currentStepUid = stepUid;
                else kvFormItem.currentStepUid = null;
                return newState;
            }),
    };
}
