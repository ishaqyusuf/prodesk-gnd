import { Button } from "@/components/ui/button";
import { useFormDataStore } from "../_common/_stores/form-data-store";
import { StepSection } from "./step-section";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import ConfirmBtn from "@/components/_v1/confirm-btn";
import { zhAddItem, zhDeleteItem } from "../_utils/helpers/zus/zus-form-helper";
import ItemSideView from "./item-side-view";
import { useEffect, useMemo, useState } from "react";
import { Icons } from "@/components/_v1/icons";

interface Props {
    uid?: string;
}
export default function ItemSection({ uid }: Props) {
    const zus = useFormDataStore();
    const zItem = zus?.kvFormItem?.[uid];

    const sequence = useMemo(() => {
        return zus.sequence?.stepComponent?.[uid];
    }, [zus.sequence?.stepComponent?.[uid]]);

    return (
        <div className="">
            <Collapsible
                open={!zItem.collapsed}
                onOpenChange={(e) => {
                    zus.toggleItem(uid);
                }}
            >
                <ItemSectionHeader uid={uid} />
                <CollapsibleContent className="flex border overflow-auto max-h-[120vh]">
                    <div className="flex-1 flex flex-col ">
                        {sequence?.map((stepUid) => (
                            <StepSection key={stepUid} stepUid={stepUid} />
                        ))}
                    </div>
                    <ItemSideView itemUid={uid} />
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
function ItemSectionHeader({ uid }) {
    const zus = useFormDataStore();
    const index = zus.sequence.formItem.indexOf(uid);
    const placeholder = `Item ${index + 1}`;
    const formItem = zus?.kvFormItem?.[uid];

    return (
        <div className="flex   border items-center gap-4 p-2 px-4">
            <CollapsibleTrigger asChild className="flex-1">
                <div
                    className="flex "
                    onClick={(e) => {
                        e.preventDefault();
                    }}
                >
                    <Input
                        value={formItem?.title}
                        onChange={(e) => {
                            zus.updateFormItem(uid, "title", e.target.value);
                        }}
                        className="h-8"
                        placeholder={placeholder}
                    />
                </div>
            </CollapsibleTrigger>
            <Button
                onClick={() => {
                    zus.updateFormItem(uid, "collapsed", !formItem.collapsed);
                }}
                className="h-8"
                size="sm"
                variant={formItem?.collapsed ? "default" : "secondary"}
            >
                {formItem.collapsed ? "Expand" : "Collapse"}
            </Button>
            <ConfirmBtn
                trash
                size="icon"
                onClick={async () => {
                    await zhDeleteItem(zus, uid, index);
                }}
            />
        </div>
    );
}
