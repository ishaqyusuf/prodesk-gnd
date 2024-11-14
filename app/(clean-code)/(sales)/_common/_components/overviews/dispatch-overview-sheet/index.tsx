import TableItemOverviewSheet from "@/components/(clean-code)/data-table/item-overview-sheet";
import { useInifinityDataTable } from "@/components/(clean-code)/data-table/use-data-table";

export default function DispatchOverviewSheet({}) {
    const { table, selectedRow } = useInifinityDataTable();
    const item = selectedRow?.original;
    if (!item) return;
    return (
        <TableItemOverviewSheet>
            <div></div>
        </TableItemOverviewSheet>
    );
}
