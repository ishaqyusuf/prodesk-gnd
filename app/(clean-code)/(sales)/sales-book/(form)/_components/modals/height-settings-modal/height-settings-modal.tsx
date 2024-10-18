import Modal from "@/components/common/modal";
import { LegacyDykeFormStepType } from "../../../_hooks/legacy-hooks";

interface Props {
    ctx: LegacyDykeFormStepType;
}
export default function HeightSettingsModal({ ctx }: Props) {
    return (
        <Modal.Content>
            <Modal.Header title="Door Height Settings" />
        </Modal.Content>
    );
}
