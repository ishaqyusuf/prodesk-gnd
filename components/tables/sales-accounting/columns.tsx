import { GetSalesPayments } from "@/actions/get-sales-transactions";
import { TCell } from "@/components/(clean-code)/data-table/table-cells";

export interface ItemProps {
    item: GetSalesPayments["data"][number];
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
