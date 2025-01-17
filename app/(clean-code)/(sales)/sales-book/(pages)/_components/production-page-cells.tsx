import { TCell } from "@/components/(clean-code)/data-table/table-cells";
import ConfirmBtn from "@/components/_v1/confirm-btn";
import { GetProductionListPage } from "../../../_common/data-actions/productions-list-action";

export interface ItemProps {
    item: GetProductionListPage["data"][number];
    itemIndex?;
}
export type SalesItemProp = ItemProps["item"];
function Date({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Secondary className="font-mono">
                {item.alert.date ? (
                    <TCell.Date>{item.alert.date}</TCell.Date>
                ) : (
                    <>N/A</>
                )}
            </TCell.Secondary>
        </TCell>
    );
}
function Order({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Secondary className="font-mono">
                {item.orderId}
            </TCell.Secondary>
        </TCell>
    );
}
function Alert({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Secondary className="font-mono flex gap-4">
                <TCell.Status
                    color={item.alert.color}
                    status={item.alert.text}
                />
            </TCell.Secondary>
        </TCell>
    );
}

function Action({ item }: ItemProps) {
    return (
        <>
            <ConfirmBtn trash size="icon" variant="ghost" />
            {/* <div>a</div>
            <div>a</div> */}
        </>
    );
}
export let Cells = {
    Action,
    Date,
    Alert,
    Order,
};
