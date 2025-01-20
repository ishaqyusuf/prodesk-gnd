import { TCell } from "@/components/(clean-code)/data-table/table-cells";

import { Progress } from "@/components/(clean-code)/progress";

import { ShippingListItem } from "../../../_common/data-actions/shipping-actions/get-shipping-list-action";
type ItemProps = {
    item: ShippingListItem;
};
function Status({ item }: ItemProps) {
    return (
        <TCell>
            <Progress.Status>{item.status || "queue"}</Progress.Status>
        </TCell>
    );
}

function Date({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Date>{item.createdAt}</TCell.Date>
        </TCell>
    );
}
function Order({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Primary>{item.order.orderId}</TCell.Primary>
        </TCell>
    );
}
function Customer({ item }: ItemProps) {
    return <TCell></TCell>;
}
function CustomerPhone({ item }: ItemProps) {
    return <TCell></TCell>;
}
function Address({ item }: ItemProps) {
    return (
        <TCell>
            {/* <TCell.Secondary>{item.shipping.address}</TCell.Secondary> */}
        </TCell>
    );
}
function SalesRep({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Secondary>{item.createdBy?.name}</TCell.Secondary>
        </TCell>
    );
}
function DispatchId({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Secondary>{item.dispatchId}</TCell.Secondary>
        </TCell>
    );
}
function DispatchMode({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Status
                status={item.deliveryMode}
                color={item.deliveryMode == "pickup" ? "red" : "purple"}
            />
        </TCell>
    );
}
function Dispatcher({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Status
                status={item.driver?.name || "Not Assigned"}
                color={item.driver?.id ? "red" : null}
            />
        </TCell>
    );
}
function Action({ item }: ItemProps) {
    return <TCell></TCell>;
}
export let DispatchCells = {
    Status,
    Action,
    DispatchMode,
    Dispatcher,
    SalesRep,
    Address,
    CustomerPhone,
    Customer,
    Order,
    DispatchId,
    Date,
};
