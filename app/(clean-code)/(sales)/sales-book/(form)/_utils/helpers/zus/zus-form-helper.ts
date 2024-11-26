import { GetSalesBookForm } from "@/app/(clean-code)/(sales)/_common/use-case/sales-book-form-use-case";
import { SalesFormZusData } from "@/app/(clean-code)/(sales)/types";
import {
    useFormDataStore,
    ZusSales,
} from "../../../_common/_stores/form-data-store";
export function zhInitializeState(data: GetSalesBookForm) {
    const resp: SalesFormZusData = {
        data,
        sequence: {
            formItem: [],
            stepComponent: {},
            multiComponent: {},
        },
        kvFormItem: {},
        kvMultiComponent: {},
        kvStepForm: {},
        kvFilteredStepComponentList: {},
        kvStepComponentList: {},
    };
    data.itemArray.map((item) => {
        const uid = item.uid;
        resp.sequence.formItem.push(uid);
        resp.kvFormItem[uid] = {
            collapsed: !item.expanded,
            uid,
            id: item.item.id,
            title: "",
        };
        resp.sequence.stepComponent[uid] = [];
        item.formStepArray.map((fs) => {
            // fs.
            const suid = `${uid}-${fs.step.uid}`;
            resp.kvStepForm[suid] = {
                title: fs.step.title,
                value: fs.item?.value,
                price: fs.item?.price,
                stepFormId: fs.item.id,
                stepId: fs.step.id,
                _stepAction: {
                    selection: {},
                    selectionCount: 0,
                },
                // componentUid: fs.item.prodUid,
                // nextStepId: fs.step.stepValueId
            };
            resp.sequence.stepComponent[uid].push(suid);
            resp.kvFormItem[uid].currentStepUid = suid;
        });
    });
    return resp;
}
export async function zhDeleteItem(zus: ZusSales, uid, index) {
    zus.removeItem(uid, index);
}
export function zhItemUidFromStepUid(stepUid) {
    const [uid] = stepUid?.split("-");
    return uid;
}
