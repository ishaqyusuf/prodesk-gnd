import { Label } from "@/components/ui/label";
import { useInfiniteDataTable } from "../use-data-table";
import { Button } from "@/components/ui/button";

export function BatchAction({ children = null }) {
    const ctx = useInfiniteDataTable();
    const selectCount = ctx.selectedRows?.length;
    if (!ctx.checkMode) return null;

    return (
        <div className="fixed left-1/2 transform -translate-x-1/2 bg-white m-4 bottom-10 z-10">
            <div className="border flex gap-4 items-center p-2 rounded-xl shadow-xl  relative ">
                <Label className="font-mono uppercase">
                    {selectCount} {" Selected"}
                </Label>
                {children}
                <Button
                    onClick={() => {
                        ctx.table.toggleAllPageRowsSelected(false);
                    }}
                    variant="destructive"
                >
                    Clear Selection
                </Button>
            </div>
        </div>
    );
}
