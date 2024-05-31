import { useModal } from "@/components/common/modal/provider";
import AssignmentModal from ".";
import { getOrderAssignmentData } from "./_action/get-order-assignment-data";

interface Props {
    prod?: boolean;
}
export function useAssignment({ prod }: Props = {}) {
    const modal = useModal();

    async function open(id) {
        const data = await getOrderAssignmentData(id, prod);
        // console.log(data);

        modal.openModal(
            <AssignmentModal isProd={prod || false} order={data} />
        );
    }
    return {
        open,
    };
}
