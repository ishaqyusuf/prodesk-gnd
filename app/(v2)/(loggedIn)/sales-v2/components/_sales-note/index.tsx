"use client";

import useFn from "@/hooks/use-fn";
import { getSalesNote } from "./_actions/get-sales-notes";
import { Label } from "@/components/ui/label";
import { TableCol } from "@/components/common/data-table/table-cells";
import { formatDate } from "@/lib/use-day";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import ControlledSelect from "@/components/common/controls/controlled-select";
import { cn, labelValue, toLabelValue } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/_v1/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CornerDownLeft } from "lucide-react";
import ControlledInput from "@/components/common/controls/controlled-input";
import { Icons } from "@/components/_v1/icons";

export default function SalesNotes({ salesId }) {
    const { data } = useFn(() => getSalesNote(salesId));
    const form = useForm({
        defaultValues: {
            noteId: "-1",
            type: "all",
            note: "",
            headline: "",
            form: false,
        },
    });
    // const
    const [noteId, type, formMode] = form.watch(["noteId", "type", "form"]);
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
                <div className={cn(formMode ? "grid gap-4" : "hidden")}>
                    <ControlledInput
                        control={form.control}
                        name="headline"
                        placeholder="Headline"
                    />
                    <div
                        className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
                        x-chunk="dashboard-03-chunk-1"
                    >
                        <Label htmlFor="message" className="sr-only">
                            Message
                        </Label>
                        <Textarea
                            {...form.register("note")}
                            id="message"
                            placeholder="Type here..."
                            className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                        />
                        <div className="flex items-center p-3 pt-0">
                            {/* <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Paperclip className="size-4" />
                                        <span className="sr-only">
                                            Attach file
                                        </span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    Attach File
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Mic className="size-4" />
                                        <span className="sr-only">
                                            Use Microphone
                                        </span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    Use Microphone
                                </TooltipContent>
                            </Tooltip> */}
                            <div className="flex justify-end flex-1 space-x-2">
                                <Button
                                    type="submit"
                                    size="sm"
                                    onClick={() => {
                                        form.setValue("form", false);
                                    }}
                                    variant={"outline"}
                                    className="ml-auto gap-1.5"
                                >
                                    Cancel
                                    {/* <CornerDownLeft className="size-3.5" /> */}
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="ml-auto gap-1.5"
                                >
                                    Save
                                    {/* <CornerDownLeft className="size-3.5" /> */}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={cn(formMode ? "hidden" : "flex")}>
                    <div className="flex-1"></div>
                    <Button
                        onClick={() => {
                            form.setValue("form", true);
                        }}
                        size={"sm"}
                        className="h-8"
                    >
                        <span>New</span>
                        <Icons.add className="w-4 h-4 ml-4" />
                    </Button>
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
