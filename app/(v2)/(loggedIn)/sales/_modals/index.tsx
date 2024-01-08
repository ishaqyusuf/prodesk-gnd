import OrderPrinter from "@/components/_v1/print/order/order-printer";
import { DeliveryModeModal } from "./delivery-mode-modal";
import MergeCustomersModal from "@/app/(v2)/(loggedIn)/sales/_modals/merge-customer-modal";
import BackOrderModal from "@/components/_v1/modals/sales/back-order-modal";
import AssignProductionModal from "@/components/_v1/modals/assign-prod-modal";
import InspectBackOrderModal from "@/components/_v1/modals/sales/inspect-back-order-modal";

export default function SalesModals({ legacy }: { legacy?: boolean }) {
    return (
        <>
            {!legacy && (
                <>
                    <OrderPrinter />
                    <AssignProductionModal />
                    <BackOrderModal />
                    <InspectBackOrderModal />
                </>
            )}

            <DeliveryModeModal />
            <MergeCustomersModal />
        </>
    );
}
