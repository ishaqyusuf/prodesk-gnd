import { DataTableLoading } from "@/components/data-table/data-table-loading";

export default function EmployeesLoading() {
    return (
        <DataTableLoading
            columnCount={6}
            isNewRowCreatable={true}
            isRowsDeletable={true}
        />
    );
}
