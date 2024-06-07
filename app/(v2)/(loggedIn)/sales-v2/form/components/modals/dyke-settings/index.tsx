import Modal from "@/components/common/modal";
import { DykeForm } from "../../../../type";
interface Props {
    data?: DykeForm["data"]["settings"];
}
export default function DykeSettingsModal({ data }: Props) {
    return (
        <Modal.Content>
            <Modal.Header title="Settings" />
        </Modal.Content>
    );
}
