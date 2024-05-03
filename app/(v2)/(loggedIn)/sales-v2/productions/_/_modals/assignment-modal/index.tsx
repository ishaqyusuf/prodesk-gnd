"use client";

import Modal from "@/components/common/modal";
import { ServerPromiseType } from "@/types";
import { getOrderAssignmentData } from "./actions";
import { DataPageShell } from "@/components/_v1/shells/data-page-shell";
import { useDataPage } from "@/lib/data-page-context";
import DoorGroupSection from "./door-group-section";

export type OrderAssignmentData = ServerPromiseType<
    typeof getOrderAssignmentData
>["Response"];
interface Props {
    order: OrderAssignmentData;
}

export const useAssignmentData = () => useDataPage<OrderAssignmentData>();
export default function AssignmentModal({ order }: Props) {
    return (
        <Modal.Content size={"lg"}>
            <Modal.Header
                title="Production Assignment"
                subtitle={`${order.orderId} | ${
                    order.customer?.businessName || order.customer?.name
                }`}
            />
            <div>
                <DataPageShell data={order}>
                    {order.doorGroups.map((group, index) => (
                        <DoorGroupSection index={index} key={index} />
                    ))}
                </DataPageShell>
            </div>
        </Modal.Content>
    );
}
