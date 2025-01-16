import { Badge } from "@/components/ui/badge";
import { getOpenItem, loadPageData } from "../helper";
import { useForm, useFormContext } from "react-hook-form";
import ConfirmBtn from "@/components/_v1/confirm-btn";
import { Form, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import FormInput from "@/components/common/controls/form-input";
import { toast } from "sonner";
import Button from "@/components/common/button";
import {
    deleteItemAssignmentAction,
    deleteSubmissionAction,
    submitItemAssignmentAction,
} from "../../../data-actions/item-assign-action";
import { salesOverviewStore } from "../store";
import { formatDate } from "@/lib/use-day";

export function ItemAssignments({}) {
    const itemView = getOpenItem();
    const assignments = itemView.assignments;
    if (!itemView.produceable) return null;
    if (!assignments.length) return <div className="">No Assignment</div>;
    return (
        <div className="py-2 font-mono">
            <div className="border-b flex items-center">
                <span>Assignments</span>
                <div className=""></div>
            </div>
            {assignments.map((assignment, index) => (
                <AssignmentLine
                    index={index}
                    assignment={assignment}
                    key={assignment.id}
                />
            ))}
        </div>
    );
}
function AssignmentLine({ assignment, index }) {
    const itemView = getOpenItem();
    const ass: (typeof itemView)["assignments"][number] = assignment;
    const form = useForm({
        defaultValues: {
            lh: ass?.pendingSubmission?.lh,
            rh: ass?.pendingSubmission?.rh,
            qty: ass?.pendingSubmission?.qty,
            note: null,
            showForm: false,
        },
    });
    const show = form.watch("showForm");
    const store = salesOverviewStore();
    async function submit() {
        const data = form.getValues();
        await submitItemAssignmentAction({
            ...data,
            totalQty: itemView.status.qty.total,
            salesItemId: itemView.itemId,
            uid: itemView.itemControlUid,
            salesId: store.salesId,
            assignmentId: ass.id,
        });
        form.setValue("showForm", false);
        toast.success("Submitted");
        loadPageData({ dataKey: "itemOverview", reload: true });
    }
    return (
        <div key={ass.id} className="py-2  space-y-4 border-b">
            <div className="flex items-center gap-4">
                <span>{index + 1}.</span>
                <span>{ass?.assignedTo || "Not Assigned"}</span>

                {ass.pills.map((pill, pillId) => (
                    <Badge
                        variant="outline"
                        className="uppercase p-1 px-2 text-xs"
                        key={pillId}
                    >
                        {pill.label}
                    </Badge>
                ))}
                <div className="flex-1"></div>
                <div className="flex items-center">
                    <Button
                        onClick={() => {
                            form.setValue("showForm", true);
                        }}
                        disabled={show}
                        size="xs"
                    >
                        Submit
                    </Button>
                    <ConfirmBtn
                        trash
                        onClick={async () => {
                            await deleteItemAssignmentAction({
                                id: ass.id,
                            });
                            toast.success("Deleted");
                            loadPageData({
                                dataKey: "itemOverview",
                                reload: true,
                            });
                        }}
                    />
                </div>
            </div>
            {!show ? (
                <div className="flex justify-end">
                    <div className="w-4/5 sm:w-2/3s pl-4">
                        {ass.submissions?.map((s) => (
                            <div
                                className="text-muted-foreground border-t flex items-center hover:bg-muted-foreground/20"
                                key={s.id}
                            >
                                <div className="font-mono">
                                    {s.description} {"  submitted on "}
                                    {formatDate(s.date)}
                                </div>
                                <div className="flex-1"></div>
                                <ConfirmBtn
                                    onClick={async () => {
                                        await deleteSubmissionAction({
                                            id: s.id,
                                        });
                                        toast.success("Submitted");
                                        loadPageData({
                                            dataKey: "itemOverview",
                                            reload: true,
                                        });
                                    }}
                                    trash
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <Form {...form}>
                    <div className="space-y-2 border-t">
                        <div className="mb-2 space-y-2">
                            <QtyInput
                                submitable={ass.pendingSubmission?.lh}
                                label="lh Qty"
                            />
                            <QtyInput
                                submitable={ass.pendingSubmission?.rh}
                                label="rh Qty"
                            />
                            <QtyInput
                                submitable={ass.pendingSubmission?.qty}
                                label="qty"
                            />
                        </div>
                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="secondary"
                                    className="w-full flex"
                                >
                                    <span>Note</span>
                                    <div className="flex-1"></div>
                                    <span>
                                        <ChevronsUpDown className="size-4" />
                                    </span>
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="py-2">
                                <FormInput
                                    type="textarea"
                                    control={form.control}
                                    name="note"
                                />
                            </CollapsibleContent>
                        </Collapsible>
                        <div className="flex justify-end gap-2">
                            <Button
                                onClick={() => {
                                    form.setValue("showForm", false);
                                }}
                                size="xs"
                                variant="destructive"
                            >
                                Close
                            </Button>
                            <Button onClick={submit} size="xs">
                                Submit
                            </Button>
                        </div>
                    </div>
                </Form>
            )}
        </div>
    );
}
function QtyInput({ label, submitable }) {
    const qtyKey = label?.split(" ")?.[0];

    const form = useFormContext();

    if (!submitable) return null;
    return (
        <div className="flex justify-end items-center gap-4">
            <Label className="font-mono uppercase">
                {label} ({submitable})
            </Label>
            <div className="flex items-end w-auto">
                {/* <Button size="xs" variant="link">
                    -
                </Button> */}
                <FormField
                    control={form.control}
                    name={qtyKey}
                    render={(props) => (
                        <Input
                            placeholder="qty"
                            value={props.field.value}
                            onChange={(e) => {
                                // if(e.target.value)
                                const val = e.target.value
                                    ? +e.target.value
                                    : null;
                                // e.target.value;
                                if (val > submitable) {
                                    e.preventDefault();
                                    toast.error(
                                        "Submit cannot exceed assigned"
                                    );
                                    return;
                                }
                                form.setValue(qtyKey, val);
                            }}
                            className={cn(
                                "border-0 p-1 h-8 font-mono border-b w-20 text-center"
                            )}
                            inputMode="numeric"
                            type="number"
                        />
                    )}
                />
                {/* <Button size="xs" variant="link">
                    +
                </Button> */}
            </div>
        </div>
    );
}
