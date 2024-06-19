import { TableCol } from "@/components/common/data-table/table-cells";
import { SalesTableItem } from "../orders-table-shell";
import SalesFlag from "./sales-flag";

interface Props {
    item: SalesTableItem;
}
function Order({ item }: Props) {
    return <TableCol></TableCol>;
}
export let SalesCells = {
    Order,
    Flag: SalesFlag,
};
