import { GetSalesCustomerTx } from "@/actions/get-sales-customers-tx";
import TextWithTooltip from "@/components/(clean-code)/custom/text-with-tooltip";
import { TCell } from "@/components/(clean-code)/data-table/table-cells";
import { Progress } from "@/components/(clean-code)/progress";
import { cn } from "@/lib/utils";

export interface ItemProps {
    item: GetSalesCustomerTx["data"][number];
}

export function DateCell({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Date>{item.createdAt}</TCell.Date>
        </TCell>
    );
}
export function AmountPaidCell({ item }: ItemProps) {
    return (
        <TCell align="right">
            <TCell.Money
                value={item.amount}
                className={cn(
                    "font-mono",
                    item.amount < 0 && "text-red-700/70"
                )}
            />
        </TCell>
    );
}
export function DescriptionCell({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Secondary className="whitespace-nowrap uppercase">
                <TextWithTooltip
                    className="max-w-[150px] xl:max-w-[250px]"
                    text={item.description}
                />
            </TCell.Secondary>
            {/* <TCell.Secondary>{item.description}</TCell.Secondary> */}
        </TCell>
    );
}
export function OrderIdCell({ item }: ItemProps) {
    return (
        <TCell>
            {item.salesPayments.map((p, pid) => (
                <TCell.Secondary key={pid}>{p.order?.orderId}</TCell.Secondary>
            ))}
        </TCell>
    );
}
export function SalesRepCell({ item }: ItemProps) {
    const salesReps = Array.from(
        new Set(item.salesPayments?.map((s) => s.order?.salesRep?.name))
    );
    return (
        <TCell>
            {salesReps.map((rep, repId) => (
                <TCell.Secondary key={repId}>{rep}</TCell.Secondary>
            ))}
        </TCell>
    );
}
export function PaymentAuthorCell({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Secondary>{item.author?.name}</TCell.Secondary>
        </TCell>
    );
}
export function StatusCell({ item }: ItemProps) {
    return (
        <TCell>
            <Progress>
                <Progress.Status>{item.status}</Progress.Status>
            </Progress>
        </TCell>
    );
}
export function ActionCell({ item }: ItemProps) {
    return <TCell></TCell>;
}
