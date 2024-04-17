import { Icons } from "@/components/_v1/icons";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DykeItemStepSection } from "./dyke-item-step-section";

import {
    DykeItemFormContext,
    useDykeCtx,
    useDykeForm,
} from "../../form-context";
import useDykeItem, { IDykeItemFormContext } from "../../use-dyke-item";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
    rowIndex;
}
export function DykeItemFormSection({ rowIndex }: Props) {
    const form = useDykeForm();
    // const configIndex = form.watch(`items.${rowIndex}.meta.configIndex`);

    const item = useDykeItem(rowIndex);
    const dykeCtx = useDykeCtx();
    // dykeCtx.
    const ctx = {
        ...item,
    } as IDykeItemFormContext;
    return (
        <DykeItemFormContext.Provider value={ctx}>
            <Collapsible
                open={item.opened}
                onOpenChange={item.openChange}
                className={cn(rowIndex > 0 && "mt-4")}
            >
                <div className="flex bg-accent p-2 px-4 justify-between">
                    <CollapsibleTrigger>
                        <Label className="text-base uppercase font-bold">
                            Item {Number(rowIndex) + 1}
                        </Label>
                    </CollapsibleTrigger>
                    <div className="flex items-center justify-between space-x-2">
                        <Button
                            onClick={() => {
                                dykeCtx.itemArray.remove(rowIndex);
                            }}
                            className="p-0 h-6 w-6"
                            variant={"destructive"}
                        >
                            <Icons.trash className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <CollapsibleContent className="">
                    <div className="grid sm:grid-cols-3">
                        <div className="sm:col-span-3">
                            {item.formStepArray.map((formStep, bIndex) => (
                                <DykeItemStepSection
                                    stepForm={formStep as any}
                                    stepIndex={bIndex}
                                    key={bIndex}
                                />
                            ))}
                        </div>
                        {/* <div></div> */}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </DykeItemFormContext.Provider>
    );
}
