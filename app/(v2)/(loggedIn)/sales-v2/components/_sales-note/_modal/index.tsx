"use client";

import Modal from "@/components/common/modal";
import { useModal } from "@/components/common/modal/provider";
import SalesNotes from "..";

export default function SalesNoteModal({ id, orderId }) {
    const modal = useModal();

    return (
        <Modal.Content>
            <Modal.Header title="Notes" subtitle={orderId} />
            <SalesNotes salesId={id} />
        </Modal.Content>
    );
}
