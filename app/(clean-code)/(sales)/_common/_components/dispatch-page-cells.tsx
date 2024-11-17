import { TCell } from "@/components/(clean-code)/data-table/table-cells";
import { ItemProps } from "./orders-page-cells";

function Status({ item }: ItemProps) {
    return <TCell></TCell>;
}
function Progress({ item }: ItemProps) {
    return <TCell></TCell>;
}
export let DispatchCells = {
    Status,
    Progress,
};
