import { IconKeys } from "@/components/_v1/icons";
import { AssignmentModalProps } from "./_components/_modals/assignment-modal";
import {
    Menu,
    MenuItem,
} from "@/components/_v1/data-table/data-table-row-actions";
import { useModal } from "@/components/common/modal/provider";
import SelectItemsCompletedBy from "./_components/_modals/select-completed-by";
import { markAsSubmittedAction } from "./_actions/production-batch-actions";

export default function useAssignmentActionsBuilder(
    order: AssignmentModalProps["order"]
) {
    const actions = {
        markAllAsSubmitted: false,
        assignAll: false,
        unassignAll: false,
        unsubmitAll: false,
    };
    const modal = useModal();
    const menuActions: ReturnType<typeof _createAction>[] = [
        {
            title: "Mark all as Submitted",
            fn: () => {
                modal.openModal(
                    <SelectItemsCompletedBy
                        action="submitted"
                        orderId={order.id}
                        order={order}
                    />
                );
            },
            icon: "check",
            active: false,
        },
        {
            title: "Submit All Assignments",
            fn: async () => {
                let resp_ = await markAsSubmittedAction({
                    orderId: order.id,
                    submitAction: "only-assigned",
                });
                // modal.openModal(
                //     <SelectItemsCompletedBy
                //         action={"assign"}
                //         orderId={order.id}
                //         order={order}
                //     />
                // );
            },
            icon: "user",
            active: false,
        },
        {
            title: "Assign All To",
            fn: () => {
                modal.openModal(
                    <SelectItemsCompletedBy
                        action={"assign"}
                        orderId={order.id}
                        order={order}
                    />
                );
            },
            icon: "user",
            active: false,
        },
    ];
    return {
        actions,
        GeneralAction: () => (
            <Menu noSize variant={"default"} label={"Action"}>
                {menuActions.map((action) => (
                    <MenuItem
                        className="whitespace-nowrap"
                        icon={action.icon}
                        key={action.icon}
                        onClick={action.fn}
                    >
                        {action.title}
                    </MenuItem>
                ))}
            </Menu>
        ),
    };
}
function _createAction(title, fn?, icon?: IconKeys) {
    return {
        title,
        fn,
        icon,
        active: false,
    };
}
