import { useItemProdView } from "./use-hooks";
import { Icons } from "@/components/_v1/icons";
import { createContext, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import ControlledSelect from "@/components/common/controls/controlled-select";
import { getSalesProdWorkersAsSelectOption } from "../../../use-case/sales-prod-workers-use-case";
import useEffectLoader from "@/lib/use-effect-loader";
import Button from "@/components/common/button";
import { DatePicker } from "@/components/(clean-code)/custom/controlled/date-picker";

function useAssignmentCtx() {
    const ctx = useItemProdView();
    const { item } = ctx;
    const [assignMode, setAssignMode] = useState(false);
    const pendingAssignments = item?.analytics?.pending?.assignment;
    const form = useForm({
        defaultValues: {
            lhQty: null,
            rhQty: null,
            assignedToId: null,
            dueDate: null,
            note: null,
        },
    });
    useEffect(() => {
        if (assignMode) {
            form.reset({
                assignedToId: null,
            });
        }
    }, [assignMode]);
    async function save() {}
    return {
        save,
        setAssignMode,
        item,
        assignMode,
        form,
        pending: pendingAssignments,
    };
}
const Context = createContext<ReturnType<typeof useAssignmentCtx>>(null as any);
export function AssignForm({}) {
    const ctx = useAssignmentCtx();
    const { item, setAssignMode, assignMode, pending } = ctx;
    return (
        <Context.Provider value={ctx}>
            <Button
                onClick={() => {
                    setAssignMode(true);
                }}
                disabled={pending?.total == 0}
                variant="default"
                className={cn("w-full", assignMode && "hidden")}
            >
                <Icons.add className="w-5 h-5 mr-2" />
                <span>Assign</span>
                <span>({pending?.total})</span>
            </Button>
            {assignMode && <AssignmentForm />}
        </Context.Provider>
    );
}
function AssignmentForm({}) {
    const ctx = useContext(Context);
    const { form } = ctx;
    const workers = useEffectLoader(getSalesProdWorkersAsSelectOption);
    return (
        <Form {...ctx.form}>
            <div className="grid sm:grid-cols-2 gap-4 items-end">
                <ControlledSelect
                    size="sm"
                    options={workers?.data || []}
                    label={"Assign To"}
                    name="assignedToId"
                    control={form.control}
                />
                <DatePicker
                    control={form.control}
                    name="dueDate"
                    size="sm"
                    label="Due Date"
                />
            </div>
            <div className="justify-end mt-4 flex gap-4">
                <Button
                    onClick={() => {
                        ctx.setAssignMode(false);
                    }}
                    size="sm"
                    variant="destructive"
                >
                    Cancel
                </Button>
                <Button action={ctx.save} size="sm" variant="default">
                    Save
                </Button>
            </div>
        </Form>
    );
}
