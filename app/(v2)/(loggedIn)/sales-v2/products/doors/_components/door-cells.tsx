"use client";

import { TableCol } from "@/components/common/data-table/table-cells";
import LinkableNode from "@/components/_v1/link-node";
import dayjs from "dayjs";
import {
    Menu,
    MenuItem,
} from "@/components/_v1/data-table/data-table-row-actions";
import { Icons } from "@/components/_v1/icons";
import { useModal } from "@/components/common/modal/provider";
import SendEmailSheet from "@/components/_v2/email/send-email";
import { DykeDoorTablePromiseProps } from "./dyke-doors-table";

interface Props {
    item: DykeDoorTablePromiseProps["Item"];
}

function Door({ item }: Props) {
    return (
        <TableCol>
            <LinkableNode href={""}>
                <TableCol.Primary>{item.title}</TableCol.Primary>
                <TableCol.Secondary>{item.doorType}</TableCol.Secondary>
            </LinkableNode>
        </TableCol>
    );
}

function Options({ item }: Props) {
    const modal = useModal();
    return (
        <Menu Icon={Icons.more}>
            <MenuItem
                Icon={Icons.calendar}
                onClick={() => {
                    // modal?.openModal(<DueDateModal item={item} />);
                }}
            >
                Due Date
            </MenuItem>
            <MenuItem
                onClick={() => {
                    // modal?.openSheet(
                    //     <SendEmailSheet
                    //         data={{
                    //             parentId: item.id,
                    //             to: item.customer?.email as any,
                    //             type: "sales",
                    //         }}
                    //         subtitle={`Payable | ${item.orderId}`}
                    //     />
                    // );
                }}
                Icon={Icons.Email}
            >
                Email
            </MenuItem>
        </Menu>
    );
}
export let DoorCells = Object.assign(() => <></>, {
    Door,

    Options,
});
