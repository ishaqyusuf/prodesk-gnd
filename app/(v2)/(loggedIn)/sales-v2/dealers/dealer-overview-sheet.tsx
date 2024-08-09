"use client";

import Modal from "@/components/common/modal";
import { useModal } from "@/components/common/modal/provider";
import {
    dealershipApprovalAction,
    DealerStatus,
    GetDealersAction,
    resendApprovalTokenAction,
} from "./action";
import { Info } from "@/components/_v1/info";
import StatusBadge from "@/components/_v1/status-badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TableCol } from "@/components/common/data-table/table-cells";

export function useDealerSheet() {
    const modal = useModal();

    return {
        open(dealer) {
            modal.openSheet(<DealerOverviewSheet dealer={dealer} />);
        },
    };
}
interface Props {
    dealer: GetDealersAction["data"][number];
}
export default function DealerOverviewSheet({ dealer }: Props) {
    const [reject, setReject] = useState(false);
    const [reason, setReason] = useState("");
    const modal = useModal();
    async function _action(status: DealerStatus) {
        await dealershipApprovalAction(dealer.id, status);
        modal.close();
        toast.success(`Dealership ${status}!`);
    }
    async function _resendToken() {
        await resendApprovalTokenAction(dealer.id);
        modal.close();
        toast.success("New Token Sent.");
    }
    function cancelReason() {
        setReason("");
        setReject(false);
    }
    return (
        <Modal.Content>
            <Modal.Header title={"Dealer Overview"} />
            <div className="grid grid-cols-1 gap-4 mt-4">
                <Info label="Name" value={dealer.dealer.name} />
                <Info label="Company Name" value={dealer.dealer.businessName} />
                <Info label="Email" value={dealer.dealer.email} />
                <Info label="Phone" value={dealer.dealer.phoneNo} />
                <Info label="Address" value={dealer.dealer.address} />
                <div className="grid grid-cols-2 gap-4">
                    <Info
                        label="Status"
                        value={<StatusBadge status={dealer.status} />}
                    />
                    <Info
                        label="Application Date"
                        value={
                            <TableCol.Date>{dealer.createdAt}</TableCol.Date>
                        }
                    />
                </div>
            </div>
            <div className={cn(dealer.tokenExpired ? "" : "hidden")}>
                <Modal.Footer
                    submitText="Reject"
                    onSubmit={() => _action("Rejected")}
                    cancelText="Cancel"
                    cancelBtn
                    submitVariant="destructive"
                    onCancel={cancelReason}
                />
            </div>
            <div
                className={cn(
                    "grid gap-4 mt-4",
                    dealer.status == "Approved" && "hidden"
                )}
            >
                {reject ? (
                    <>
                        <div className="grid gap-2">
                            <Label>Reason</Label>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                        <Modal.Footer
                            submitText="Reject"
                            onSubmit={() => _action("Rejected")}
                            cancelText="Cancel"
                            cancelBtn
                            submitVariant="destructive"
                            onCancel={cancelReason}
                        />
                    </>
                ) : (
                    <Modal.Footer
                        submitText="Approve"
                        onSubmit={() => _action("Approved")}
                        cancelText="Reject"
                        cancelBtn
                        cancelVariant="destructive"
                        onCancel={() => {
                            setReject(true);
                        }}
                    />
                )}
                {/* <div className="flex justify-end space-x-4">
                    <Button variant="destructive">Reject</Button>
                    <Button>Approve</Button>
                </div> */}
            </div>
        </Modal.Content>
    );
}
