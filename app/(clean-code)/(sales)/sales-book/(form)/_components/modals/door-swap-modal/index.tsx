import Modal from "@/components/common/modal";
import { _modal } from "@/components/common/modal/provider";

export const openDoorSwapModal = () => {
    _modal.openModal(<DoorSwapModal />);
};
export function DoorSwapModal({}) {
    return <Modal.Content size="lg"></Modal.Content>;
}
