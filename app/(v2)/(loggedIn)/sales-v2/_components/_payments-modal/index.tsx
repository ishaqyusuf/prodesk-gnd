"use client";

import Modal from "@/components/common/modal";
import { useModal } from "@/components/common/modal/provider";
import useStaticDataLoader from "@/lib/static-data-loader";
import useEffectLoader from "@/lib/use-effect-loader";

interface Props {
    id;
    orderId;
    edit?: boolean;
}
export default function PaymentModal({ id, orderId, edit }: Props) {
    const modal = useModal();
    // const ctx = useEffectLoader()
    return (
        <Modal.Content>
            <Modal.Header title="Payments" subtitle={orderId} />
        </Modal.Content>
    );
}
