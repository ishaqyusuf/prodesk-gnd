import { TableCol } from "@/components/common/data-table/table-cells";
import { DispatchPromiseResponse } from "./dispatch-table";

interface Props {
    item: DispatchPromiseResponse["Item"];
}

function Order({ item }: Props) {
    return (
        <TableCol>
            <TableCol.Primary>{item.orderId}</TableCol.Primary>
            <TableCol.Secondary>
                <TableCol.Date>{item.createdAt}</TableCol.Date>
            </TableCol.Secondary>
        </TableCol>
    );
}
function Customer({ item }: Props) {
    return (
        <TableCol>
            <TableCol.Primary>
                {item.shippingAddress.name || item.customer.name}
            </TableCol.Primary>
            <TableCol.Secondary>
                {item.shippingAddress.address1 || "-"}
            </TableCol.Secondary>
        </TableCol>
    );
}
// function
export let DispatchCells = {
    Order,
    Customer,
};
