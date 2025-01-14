import { SalesDispatchStatus } from "../../../types";
import { generateDispatchId } from "../../utils/dispatch-utils";
import { LoadDispatchListAction } from "../dispatch-actions/dispatch-action";
type DispatchItem = LoadDispatchListAction[number]["items"][number];

export function transformDispatchList(dispatch: LoadDispatchListAction[0]) {
    return {
        uid: generateDispatchId(dispatch.id),
        items: dispatch.items.map(transformDispatchListItem),
        status: dispatch.status as SalesDispatchStatus,
        assignedTo: {
            id: dispatch.driver?.id,
            name: dispatch.driver?.name,
        },
        author: {
            id: dispatch.createdBy?.id,
            name: dispatch?.createdBy?.name,
        },
    };
}

export function transformDispatchListItem(item: DispatchItem) {
    let qty = {
        itemQty: {
            lh: 0,
            rh: 0,
            qty: 0,
            total: 0,
        },
        deliveryQty: {
            lh: 0,
            rh: 0,
            qty: 0,
            total: 0,
        },
    };
    const {
        salesItem: {
            description,
            housePackageTool: { stepProduct: { name: productName } = {} } = {},
        },
        submission: {
            assignment: { salesDoor: { dimension, swing } = {} },
        },
    } = item;
}
