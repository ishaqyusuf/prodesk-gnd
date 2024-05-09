"use client";

import Modal from "@/components/common/modal";
import { ServerPromiseType } from "@/types";
import { getOrderAssignmentData } from "./_action/get-order-assignment-data";
import { DataPageShell } from "@/components/_v1/shells/data-page-shell";
import { useDataPage } from "@/lib/data-page-context";
import DoorGroupSection from "./door-group-section";

export type OrderAssignmentData = ServerPromiseType<
    typeof getOrderAssignmentData
>["Response"];
export type OrderAssignmentDataGroup = OrderAssignmentData["doorGroups"][0];
export type OrderAssignmentSalesDoor =
    OrderAssignmentDataGroup["salesDoors"][0];
interface Props {
    order: OrderAssignmentData;
    isProd: boolean;
}

export const useAssignmentData = () => useDataPage<OrderAssignmentData>();
export default function AssignmentModal({ order, isProd }: Props) {
    return (
        <Modal.Content size={"lg"}>
            <Modal.Header
                title="Production Assignment"
                subtitle={`${order.orderId} | ${
                    order.customer?.businessName || order.customer?.name
                }`}
            />
            <div className="overflow-auto h-[80vh] -mr-6 pb-28">
                <DataPageShell data={order}>
                    {order.doorGroups.map((group, index) => (
                        <DoorGroupSection index={index} key={index} />
                    ))}
                </DataPageShell>
            </div>
        </Modal.Content>
    );
}
