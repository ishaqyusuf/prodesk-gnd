import { GetSalesBookForm } from "@/app/(clean-code)/(sales)/_common/use-case/sales-book-form-use-case";
import { SalesFormZusData } from "@/app/(clean-code)/(sales)/types";

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
        kvStepComponent: {},
    };
    data.itemArray.map((item) => {
        const uid = item.uid;
        resp.sequence.formItem.push(uid);
        resp.kvFormItem[uid] = {
            collapsed: !item.expanded,
            uid,
            id: item.item.id,
        };
        resp.sequence.stepComponent[uid] = [];
        item.formStepArray.map((fs) => {
            // fs.
            const suid = `${uid}-${fs.step.uid}`;
            resp.kvStepComponent[suid] = {
                title: fs.step.title,
                value: fs.item?.value,
                price: fs.item?.price,
                stepFormId: fs.item.id,
            };
            resp.sequence.stepComponent[uid].push(suid);
        });
    });
    return resp;
}
