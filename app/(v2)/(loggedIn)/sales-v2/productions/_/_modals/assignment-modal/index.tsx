"use client";

import Modal from "@/components/common/modal";
import { ServerPromiseType } from "@/types";
import { getOrderAssignmentData } from "./actions";
import { useForm } from "react-hook-form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
    order: ServerPromiseType<typeof getOrderAssignmentData>["Response"];
}
export default function AssignmentModal({ order }: Props) {
    return (
        <Modal.Content>
            <Modal.Header
                title="Production Assignment"
                subtitle={`${order.orderId} | ${
                    order.customer?.businessName || order.customer?.name
                }`}
            />
            <div>
                <Tabs>
                    <TabsList>
                        {order.items?.map((item) => (
                            <TabsTrigger key={item.id} value={`${item.id}`}>
                                {/* {item.} */}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>
        </Modal.Content>
    );
}
