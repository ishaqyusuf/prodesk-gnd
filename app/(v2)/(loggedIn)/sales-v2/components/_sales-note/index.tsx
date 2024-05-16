"use client";

import useFn from "@/hooks/use-fn";
import { getSalesNote } from "./_actions/get-sales-notes";
import { Label } from "@/components/ui/label";
import { TableCol } from "@/components/common/data-table/table-cells";
import { formatDate } from "@/lib/use-day";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import ControlledSelect from "@/components/common/controls/controlled-select";
import { labelValue, toLabelValue } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/_v1/status-badge";

export default function SalesNotes({ salesId }) {
    const { data } = useFn(() => getSalesNote(salesId));
    const form = useForm({
        defaultValues: {
            noteId: "-1",
            type: "all",
        },
    });
    const [noteId, type] = form.watch(["noteId", "type"]);
    function searchProgress(progress: (typeof data)["progressList"][0]) {
        const nId = Number(noteId);
        return [
            nId > 0 ? progress.progressableId == nId : true,
            type == "all" ? true : progress.type?.toLowerCase() == type,
        ].every(Boolean);
    }
    if (!data) return null;
    return (
        <Form {...form}>
            <div className="grid gap-2 border-t my-4">
                <div className="grid grid-cols-2 gap-4">
                    <ControlledSelect
                        options={data.items}
                        name="noteId"
                        control={form.control}
                        label={"Showing"}
                    />
                    <ControlledSelect
                        options={toLabelValue(["all", ...data.progressTypes])}
                        name="type"
                        control={form.control}
                        label={"Type"}
                    />
                </div>
                {data?.progressList?.filter(searchProgress).map((progress) => {
                    return (
                        <div
                            className="text-sm border-b py-2"
                            key={progress.id}
                        >
                            <div className="flex justify-between">
                                <div className="">
                                    <Label>{progress.status}</Label>
                                    {"   "}
                                    <StatusBadge>{progress.type}</StatusBadge>
                                </div>
                                <p>{formatDate(progress.createdAt)}</p>
                            </div>
                            <TableCol.Secondary>
                                {progress.headline}
                            </TableCol.Secondary>
                        </div>
                    );
                })}
            </div>
        </Form>
    );
}
