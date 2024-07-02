"use client";

import Modal from "@/components/common/modal";
import { AssignmentModalProps } from "../assignment-modal";
import { useStaticProducers } from "@/_v2/hooks/use-static-data";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { markAsSubmittedAction } from "../../../_actions/production-batch-actions";
import { toast } from "sonner";
import { useModal } from "@/components/common/modal/provider";
import { useAssignment } from "../assignment-modal/use-assignment";

interface Props {
    orderId;
    itemsId?: Number[];
    order?: AssignmentModalProps["order"];
}
export default function SelectItemsCompletedBy({
    orderId,
    itemsId,
    order,
}: Props) {
    const prodUsers = useStaticProducers();
    const modal = useModal();
    const assignmentModal = useAssignment();
    async function submit(userId) {
        await markAsSubmittedAction(orderId, userId);
        toast.message("All marked as submitted");
        assignmentModal.open(orderId);
    }
    return (
        <Modal.Content size={"md"}>
            <Modal.Header title={"Production Completed By:"} />
            <Table>
                <TableBody>
                    {[
                        {
                            id: -1,
                            name: "Continue anyaway",
                        },
                        ...(prodUsers.data || []),
                    ]?.map((user) => (
                        <TableRow
                            onClick={() => {
                                submit(user.id);
                            }}
                            className="cursor-default"
                            key={user.id}
                        >
                            <TableCell>{user.name}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Modal.Content>
    );
}
