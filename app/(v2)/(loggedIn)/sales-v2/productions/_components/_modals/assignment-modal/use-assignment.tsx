import { useModal } from "@/components/common/modal/provider";
import AssignmentModal, { useAssignmentData } from ".";
import { getOrderAssignmentData } from "./_action/get-order-assignment-data";
import { _revalidate } from "@/app/(v1)/_actions/_revalidate";

interface Props {
    // prod?: boolean;
    type?: "prod" | "dispatch" | undefined;
    // dispatch?: boolean
}
export function useAssignment({ type }: Props = {}) {
    const modal = useModal();
    const data = useAssignmentData();
    async function open(id) {
        const mode = {
            prod: type == "prod",
            dispatch: type == "dispatch",
        };
        const data = await getOrderAssignmentData(id, mode);
        // console.log(data);

        modal.openModal(<AssignmentModal order={data} />);
    }

    return {
        async revalidate() {},
        open,
        refresh() {
            open(data.data.id);
            // console.log(data);
        },
    };
}
