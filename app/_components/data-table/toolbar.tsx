import { Icons } from "@/components/_v1/icons";
import { useDataTableContext } from "./data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
    children?;
}
function BaseTableToolbar({ children }: Props) {
    const { table, columns } = useDataTableContext();
    const isFiltered = table.getState().columnFilters.length > 0;
    return (
        <div className="flex w-full items-center space-x-2 overflow-auto p-1">
            {children}
            {isFiltered && (
                <Button
                    aria-label="Reset filters"
                    variant="ghost"
                    className="h-8 px-2 lg:px-3"
                    onClick={() => table.resetColumnFilters()}
                >
                    Reset
                    <Icons.X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
interface SearchProps {
    k?: string;
    placeholder?: string;
}
function Search({ k = "_q", placeholder }: SearchProps) {
    const { table, columns } = useDataTableContext();
    const col = table.getColumn(String(k));
    return (
        <Input
            placeholder={`Filter ${placeholder || ""}...`}
            value={(col?.getFilterValue() as string) ?? ""}
            onChange={(event) => col?.setFilterValue(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
        />
    );
}

export let TableToolbar = Object.assign(BaseTableToolbar, { Search });
