import { Icons } from "@/components/_v1/icons";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
    DykeItemFormContext,
    useDykeCtx,
    useDykeForm,
} from "../../../_hooks/form-context";
import useDykeItem, {
    IDykeItemFormContext,
} from "../../../_hooks/use-dyke-item";
import { cn } from "@/lib/utils";
import { _deleteDykeItem } from "../../../_action/delete-item";
import ItemHeader from "./item-header";
import { DykeInvoiceItemStepSection } from "./invoice-item-step-section";

interface Props {
    rowIndex;
    itemArray;
}
export function DykeInvoiceItemSection({ rowIndex, itemArray }: Props) {
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
                    <div className="grid sm:grid-cols-3 overflow-auto max-h-[110vh]">
                        <div className="sm:col-span-3">
                            {item.formStepArray.map((formStep, bIndex) => (
                                <DykeInvoiceItemStepSection
                                    stepForm={formStep as any}
                                    stepIndex={bIndex}
                                    key={bIndex}
                                />
                            ))}
                        </div>
                        {/* <div className="hidden sm:col-span-1"></div> */}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </DykeItemFormContext.Provider>
    );
}
