"use client";

import Modal from "@/components/common/modal";
import { ServerPromiseType } from "@/types";
import { getOrderAssignmentData } from "./_action/get-order-assignment-data";
import { DataPageShell } from "@/components/_v1/shells/data-page-shell";
import { useDataPage } from "@/lib/data-page-context";
import SectionedItems from "./sectioned-items";
import {
    Menu,
    MenuItem,
} from "@/components/_v1/data-table/data-table-row-actions";
import ModalHeader from "./modal-header";

export type OrderAssignmentData = ServerPromiseType<
    typeof getOrderAssignmentData
>["Response"];
export type OrderAssignmentDataGroup = OrderAssignmentData["doorGroups"][0];
export type OrderAssignmentSalesDoor =
    OrderAssignmentDataGroup["salesDoors"][0];
export interface AssignmentModalProps {
    order: OrderAssignmentData;
}

export const useAssignmentData = () => useDataPage<OrderAssignmentData>();
export default function AssignmentModal({ order }: AssignmentModalProps) {
    return (
        <Modal.Content size={"xl"}>
            <ModalHeader order={order} />
            <div
                id="assignmentModal"
                className="overflow-auto max-h-[80vh] -mr-6 spb-28"
            >
                <DataPageShell data={order}>
                    {order.doorGroups.map((group, index) => (
                        <SectionedItems index={index} key={index} />
                    ))}
                </DataPageShell>
            </div>
        </Modal.Content>
    );
}
