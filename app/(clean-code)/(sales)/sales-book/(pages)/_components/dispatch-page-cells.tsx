import { TCell } from "@/components/(clean-code)/data-table/table-cells";
import { GetSalesDispatchList } from "../../../_common/use-case/sales-dispatch-use-case";
import { Progress } from "@/components/(clean-code)/progress";
import { SalesDispatchListDto } from "../../../_common/data-access/dto/sales-shipping-dto";
type ItemProps = {
    item: SalesDispatchListDto;
};
function Status({ item }: ItemProps) {
    return (
        <TCell>
            <Progress.Status>{item.status || "queue"}</Progress.Status>
        </TCell>
    );
}

function Date({ item }: ItemProps) {
    return <TCell></TCell>;
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
            <TCell.Secondary>{item.shipping.address}</TCell.Secondary>
        </TCell>
    );
}
function SalesRep({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Secondary>{item.salesRep}</TCell.Secondary>
        </TCell>
    );
}
function DispatchId({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Secondary>#000-{item.dispatchId}</TCell.Secondary>
        </TCell>
    );
}
export let DispatchCells = {
    Status,

    SalesRep,
    Address,
    CustomerPhone,
    Customer,
    Order,
    DispatchId,
    Date,
};
