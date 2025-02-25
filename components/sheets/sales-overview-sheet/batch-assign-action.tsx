import { Menu } from "@/components/(clean-code)/menu";
import { useSalesOverviewItemsTab } from "./items-tab-context";
import { TabFloatingAction } from "./tab-floating-action";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import { AnimateReveal } from "@/components/animate-reveal";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import useEffectLoader from "@/lib/use-effect-loader";
import { getSalesProdWorkersAsSelectOption } from "@/app/(clean-code)/(sales)/_common/use-case/sales-prod-workers-use-case";
import { useForm, useFormContext } from "react-hook-form";
import { Form } from "@/components/ui/form";

export function BatchAssignActionMenu() {
    const ctx = useSalesOverviewItemsTab();

    return (
        <>
            <Menu.Item
                SubMenu={
                    <>
                        <Menu.Item>All</Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                ctx.form.setValue(
                                    "batchAction",
                                    "assign-production"
                                );
                                ctx.form.setValue("selectMode", true);
                            }}
                        >
                            Selection
                        </Menu.Item>
                    </>
                }
            >
                Assign Production
            </Menu.Item>
        </>
    );
}

export function BatchAssignAction() {
    const ctx = useSalesOverviewItemsTab();
    const opened = ctx.selectMode && ctx.batchAction == "assign-production";
    useEffect(() => {
        if (opened) {
            console.log("LOAD");
        }
    }, [opened]);
    const form = useForm({});
    if (!opened) return null;
    return (
        <TabFloatingAction>
            <Form {...form}>
                <AnimateReveal opened={opened}>
                    {/* <div className="border flex items-center space-x-2"> */}
                    <Label className="font-mono whitespace-nowrap px-2">
                        <span className="font-bold">{ctx.selectCount}</span>
                        {/* {" of "} */}
                        {/* <span className="font-bold">{total}</span> */}
                        {" selected"}
                    </Label>
                    <AssignTo />
                    <AssignBtn />
                    <Button
                        size="xs"
                        variant="ghost"
                        className="rounded-none hover:bg-red-500 hover:text-white"
                        onClick={(e) => {
                            // ctx.form.setValue("selectMode", false);
                            ctx.form.reset({
                                batchAction: null,
                                selectMode: false,
                            });
                            // ctx.form.setValue("batchAction", "");
                        }}
                    >
                        <Icons.X className="size-4" />
                    </Button>
                    {/* </div> */}
                </AnimateReveal>
            </Form>
        </TabFloatingAction>
    );
}
function AssignBtn() {
    return (
        <Button
            size="xs"
            className="rounded-none hover:bg-green-500 hover:text-white"
            variant="ghost"
        >
            Save
        </Button>
    );
}
function AssignTo() {
    const workers = useEffectLoader(getSalesProdWorkersAsSelectOption);
    const form = useFormContext();
    const assignedToId = form.watch("assignedToId");
    const assignedTo = workers.data?.find(
        (worker) => worker.value == assignedToId
    );
    return (
        <Menu
            Trigger={
                <Button
                    size="xs"
                    className="whitespace-nowrap p-0 rounded-none text-start"
                    variant="ghost"
                >
                    <Label className="font-mono px-2  w-24 line-clamp-1">
                        {AssignTo ? (
                            <span className="">{assignedTo?.label}</span>
                        ) : (
                            <span className="font-bold">Assign To</span>
                        )}
                        {/* {" of "} */}
                        {/* <span className="font-bold">{total}</span> */}
                    </Label>
                </Button>
            }
        >
            {workers?.data?.map((worker) => (
                <Menu.Item
                    key={worker.value}
                    onClick={() => {
                        form.setValue("assignedToId", worker.value);
                    }}
                >
                    {worker.label}
                </Menu.Item>
            ))}
        </Menu>
    );
}
