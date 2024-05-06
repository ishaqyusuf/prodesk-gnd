import { useModal } from "@/components/common/modal/provider";
import AssignmentModal from ".";
import { getOrderAssignmentData } from "./_action/get-order-assignment-data";

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
