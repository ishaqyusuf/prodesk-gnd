import { useModal } from "@/components/common/modal/provider";
import AssignmentModal from "../_modals/assignment-modal";
import { getOrderAssignmentData } from "../_modals/assignment-modal/actions";

export function useAssignment() {
    const modal = useModal();
    async function open(id) {
        const data = await getOrderAssignmentData(id);
        modal.openSheet(<AssignmentModal order={data} />);
    }
    return {
        open,
    };
}
