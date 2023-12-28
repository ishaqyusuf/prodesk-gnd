import { useContext } from "react";
import { SalesFormContext } from "../ctx";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useFormContext, useWatch } from "react-hook-form";
import { ISalesForm } from "../type";
import { DatePicker } from "@/components/date-range-picker";
import { Menu, MenuItem } from "@/components/data-table/data-table-row-actions";
import { Icons } from "@/components/icons";
import useSaveSalesHook from "../hooks/use-save-sales";

export default function SalesFormAction() {
    const ctx = useContext(SalesFormContext);
    const form = useFormContext<ISalesForm>();
    const watchForm = useWatch({
        control: form.control,
        defaultValue: defaultValues,
    });
    const date = form.watch("createdAt");
    const saveHook = useSaveSalesHook(watchForm);

    return (
        <div className="flex justify-between items-center">
            <div className="">
                <h2 className="text-2xl font-bold tracking-tight">
                    {ctx.data?.form?.orderId &&
                    ctx?.data?.form?.id &&
                    ctx?.data?.form?.type == "order"
                        ? "#ORD"
                        : "#EST"}{" "}
                    {ctx.data?.form?.orderId || "New Sales"}
                </h2>
            </div>
            <div className="flex space-x-2">
                {(ctx.mockupPercentage || 0) > 0 && (
                    <div className="inline-flex items-center space-x-2">
                        <Label>Mockup Mode</Label>
                        <Switch
                            checked={ctx.toggleMockup as any}
                            onCheckedChange={(e) => {
                                ctx.setToggleMockup(e);
                            }}
                        />
                    </div>
                )}
                <div className="inline-flex items-center space-x-2">
                    <Label>Date Created:</Label>
                    <DatePicker
                        setValue={(e) => form.setValue("createdAt", e)}
                        className="w-auto h-8"
                        value={date}
                    />
                </div>
                <Menu
                    variant={"secondary"}
                    disabled={ctx.toggleMockup}
                    label="Save"
                    Icon={null}
                >
                    <MenuItem Icon={Icons.save}>Save</MenuItem>
                    <MenuItem Icon={Icons.saveAndClose}>Save & Close</MenuItem>
                    <MenuItem Icon={Icons.add}>Save & New</MenuItem>
                </Menu>
            </div>
        </div>
    );
}
