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
} from "../../../_hooks/form-context";
import useDykeItem, {
    IDykeItemFormContext,
} from "../../../_hooks/use-dyke-item";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { _deleteDykeItem } from "../../../_action/delete-item";
import ItemHeader from "./item-header";

interface Props {
    rowIndex;
    itemArray;
}
export function DykeItemFormSection({ rowIndex, itemArray }: Props) {
    const form = useDykeForm();
    // const configIndex = form.watch(`items.${rowIndex}.meta.configIndex`);

    const item = useDykeItem(rowIndex, itemArray);
    // item.rowIndex
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
                <ItemHeader item={item} />
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
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </DykeItemFormContext.Provider>
    );
}
