import { IconKeys } from "@/components/_v1/icons";
import { AssignmentModalProps } from "./_components/_modals/assignment-modal";
import {
    Menu,
    MenuItem,
} from "@/components/_v1/data-table/data-table-row-actions";

export default function useAssignmentActionsBuilder(
    order: AssignmentModalProps["order"]
) {
    const actions = {
        markAllAsSubmitted: false,
        assignAll: false,
        unassignAll: false,
        unsubmitAll: false,
    };
    const menuActions = [
        _createAction(
            "Mark all as Submitted",
            //  "markAllAsSubmitted",
            null,
            "check"
        ),
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
    };
}
