import { useContext } from "react";
import {
    DykeItemFormContext,
    useDykeForm,
    useDykeItemCtx,
} from "./form-context";
import { cn } from "@/lib/utils";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import { useStepItemCtx } from "./use-step-items";
import ConfirmBtn from "@/components/_v1/confirm-btn";
import { Icons } from "@/components/_v1/icons";
import { Label } from "@/components/ui/label";

import { useModal } from "@/components/common/modal/provider";
import { useLegacyDykeForm } from "@/app/(clean-code)/(sales)/sales-book/(form)/_hooks/legacy-hooks";

export function useProdBatchAction() {
    const form = useDykeForm();
    const item = useContext(DykeItemFormContext);
    const stepCtx = useStepItemCtx();

    const ctx = {
        CheckBox,
        BatchSelectionAction,
    };
    return ctx;
}
function useCtx() {
    const form = useDykeForm();
    const stepCtx = useStepItemCtx();
    const itemCtx = useDykeItemCtx();
    const watchBatch = form.watch(`batchSetting.${stepCtx.__uid}`);
    const selectionCount = () =>
        Object.values(watchBatch?.selections || {}).filter(Boolean).length;
    const formCtx = useLegacyDykeForm();
    function isSelected(uid) {
        return watchBatch?.selections?.[uid];
    }
    return {
        isDealer: formCtx.dealerMode,
        selectionCount,
        uid: stepCtx.__uid,
        control: form.control,
        products: stepCtx.stepProducts,
        selectedProducts: () =>
            stepCtx.stepProducts.filter((p) => isSelected(p.uid)),
        rowIndex: itemCtx.rowIndex,
        stepIndex: stepCtx.stepIndex,
        form,
        step: stepCtx,
    };
}
export function BatchSelectionAction() {
    const _ctx = useCtx();
    const modal = useModal();
    function batchDelete() {
        let products = _ctx.selectedProducts();
        console.log({ products });
        _ctx.step.deleteStepItemModal(products);
    }
    if (_ctx.selectionCount() > 0)
        return (
            <div className="fixed bottom-0 left-0  right-0 md:grid smd:grid-cols-[220px_minmax(0,1fr)]  lg:grid-cols-[240px_minmax(0,1fr)] mb-24 z-10">
                <div className="hidden md:block"></div>
                <div className="flex justify-center">
                    <div className="flex items-center rounded-xl bg-white shadow-lg space-x-4 p-1 px-3 border shadow-muted-foreground justify-center">
                        <Label>
                            {_ctx.selectionCount()} {" Selected"}
                        </Label>
                        <ConfirmBtn
                            onClick={batchDelete}
                            size="sm"
                            variant="destructive"
                            Icon={Icons.trash}
                        >
                            Delete
                        </ConfirmBtn>
                    </div>
                </div>
            </div>
        );
    return <div className="fixed bottom-0 "></div>;
}
function CheckBox({ uid }) {
    const _ctx = useCtx();
    if (!_ctx.isDealer)
        return (
            <div
                className={cn(
                    !_ctx.selectionCount() && "hidden group-hover:block",
                    "absolute top-0 left-0 rounded-lg shadow-xl  -m-2 bg-white z-10"
                )}
            >
                <ControlledCheckbox
                    control={_ctx.control}
                    name={`batchSetting.${_ctx.uid}.selections.${uid}` as any}
                />
            </div>
        );
    return null;
}
