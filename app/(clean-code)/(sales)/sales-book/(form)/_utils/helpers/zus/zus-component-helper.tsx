import { _modal } from "@/components/common/modal/provider";
import ComponentVisibilityModal from "../../../_components/modals/component-visibility-modal";

export function zhEditComponentVisibility(stepUid, componentUid) {
    _modal.openModal(
        <ComponentVisibilityModal
            stepUid={stepUid}
            componentUid={componentUid}
        />
    );
}
