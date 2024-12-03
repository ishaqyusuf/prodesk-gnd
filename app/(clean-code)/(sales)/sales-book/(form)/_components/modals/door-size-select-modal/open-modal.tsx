import { _modal } from "@/components/common/modal/provider";
import { ComponentHelperClass } from "../../../_utils/helpers/zus/zus-helper-class";
import DoorSizeSelectModal from ".";

export function openDoorSizeSelectModal(cls: ComponentHelperClass) {
    _modal.openModal(<DoorSizeSelectModal cls={cls} />);
}
