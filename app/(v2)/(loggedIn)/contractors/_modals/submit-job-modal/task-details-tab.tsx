import { useJobCostList } from "@/_v2/hooks/use-static-data";
import ProjectFormSection from "./project-form-section";
import useSubmitJob from "./use-submit-job";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function TaskDetailsTab() {
    const ctx = useSubmitJob();
    const [homeCosting, costList, type] = ctx.form.watch([
        "home.costing",
        "costList",
        "type",
    ]);
    const cost = useJobCostList(ctx.type);

    // useEffect(() => {},[])
    return (
        <ScrollArea className="h-[350px] pr-4 grid gap-2">
            <ProjectFormSection />
            <div className={cn(!costList?.length && "hidden")}>
                <Table className="">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-1">Task</TableHead>
                            <TableHead className="px-1">Qty</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody></TableBody>
                </Table>
            </div>
        </ScrollArea>
    );
}
