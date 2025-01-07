import { useEffect } from "react";
import { Payables, txStore } from "./store";
import { PaymentMethods } from "../../../types";
import { _modal } from "@/components/common/modal/provider";
import Modal from "@/components/common/modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import PayForm from "./pay-form";
import CustomerSelector from "./customer-selector";

interface Props {}
export function openTxForm({
    phoneNo,
    paymentMethod,
    payables,
}: {
    phoneNo?;
    paymentMethod?: PaymentMethods;
    payables?: Payables[];
}) {
    txStore.getState().initialize({
        phoneNo,
        paymentMethod,
        payables,
    });
    _modal.openSheet(<TxForm />);
}
export function TxForm({}) {
    const tx = txStore();
    useEffect(() => {
        tx.reset();
    }, []);

    // if (!tx.phoneNo || !tx.payables?.length) return null;
    return (
        <Modal.Content className="h-[95vh] mt-[2.5vh] mx-4 rounded-xl flex flex-col">
            <Modal.Header onBack={(e) => {}} title="Pay Portal" />
            <CustomerSelector />
            <TxFormContent />
            {!tx.paymentMethod && <PayForm />}
            {/* {!tx.totalPay} */}
        </Modal.Content>
    );
}
function TxFormContent({}) {
    return (
        <ScrollArea className="flex-1 -mx-6 px-6 bg-red-50">
            <div className="h-screen"></div>
        </ScrollArea>
    );
}
