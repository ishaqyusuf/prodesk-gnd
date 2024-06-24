"use client";

import { useDataPage } from "@/lib/data-page-context";
import { getDispatchPreviewAction } from "../action";
import { ServerPromiseType } from "@/types";
import Modal from "@/components/common/modal";

export type OrderAssignmentData = ServerPromiseType<
    typeof getDispatchPreviewAction
>["Response"];
export const useData = () => useDataPage<OrderAssignmentData>();

export default function DispatchPreviewModal() {
    return (
        <Modal.Content size="xl">
            <Modal.Header title="Dispatch Preview" />
        </Modal.Content>
    );
}
