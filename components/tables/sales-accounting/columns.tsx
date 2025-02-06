import { GetSalesCustomerTx } from "@/actions/get-sales-customers-tx";
import { TCell } from "@/components/(clean-code)/data-table/table-cells";

export interface ItemProps {
    item: GetSalesCustomerTx["data"][number];
}

export function DateCol({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Date>{item.createdAt}</TCell.Date>
        </TCell>
    );
}
export function ActionCell({ item }: ItemProps) {
    return <TCell></TCell>;
}
