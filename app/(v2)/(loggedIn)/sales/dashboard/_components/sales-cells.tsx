import { TableCell } from "@/app/_components/data-table/table-cells";
import { NewspaperIcon, SparklesIcon } from "lucide-react";
import StatusBadge from "@/components/_v1/status-badge";
import { updateDeliveryModeDac } from "@/app/(v2)/(loggedIn)/sales/_data-access/update-delivery-mode.dac";
import { toast } from "sonner";
import {
    DeleteRowAction,
    Menu,
    MenuItem,
} from "@/components/_v1/data-table/data-table-row-actions";
import salesData from "@/app/(v2)/(loggedIn)/sales/sales-data";
import { Badge } from "@/components/ui/badge";
import { getBadgeColor } from "@/lib/status-badge";

import {
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SalesTableItem } from "@/app/(v1)/(loggedIn)/sales/orders/components/orders-table-shell";
import { GetSalesAction } from "../_actions/get-sales-action";
import { MenuOption, useSalesMenu } from "../../utils/use-sales-menu";
import { deleteOrderAction } from "@/app/(v1)/(loggedIn)/sales/_actions/sales";
import { sum } from "@/lib/utils";
import { GetSales } from "@/data-acces/sales";
import { useAssignment } from "../../../sales-v2/productions/_components/_modals/assignment-modal/use-assignment";
import { Button } from "@/components/ui/button";

interface Props {
    item: GetSales["data"][number];
}
function OrderDispatch({ item, href }: Props & { href? }) {
    return (
        <TableCell href={href} className="">
            <TableCell.Medium className={item.isDyke ? "text-orange-500" : ""}>
                {item.orderId}
            </TableCell.Medium>
            <TableCell.Secondary className="inline-flex items-center space-x-2">
                <TableCell.Date>{item.createdAt}</TableCell.Date>
                {/* {item.isDyke && (
                    // <div className="rounded-full bg-pink-500 p-[.5px]   text-xs leading-none text-[#000000]s text-white no-underline group-hover:no-underline">
                    //     <SparklesIcon className="w-4 h-4" />
                    // </div>
                    // <SparklesIcon className="w-4 h-4 text-pink-700" />
                )} */}
            </TableCell.Secondary>
        </TableCell>
    );
}
function Order({ item }: Props) {
    const href = item.isDyke
        ? `/sales-v2/overview/${item.type}/${item.slug}`
        : `/sales/order/${item.slug}`;
    return <OrderDispatch item={item} href={href} />;
}
function Customer({ item }: Props) {
    let address = item?.shippingAddress || item?.billingAddress;
    if (!address && !item.customer) return <TableCell></TableCell>;
    const link = "/sales/customer/" + item.customer?.id;
    return (
        <TableCell href={link}>
            <TableCell.Medium className="uppercase">
                {item.customer?.businessName ||
                    item?.customer?.name ||
                    address?.name}
            </TableCell.Medium>
            <TableCell.Secondary>
                {address?.phoneNo || item?.customer?.phoneNo}
            </TableCell.Secondary>
        </TableCell>
    );
}
function Address({ item }: Props) {
    return (
        <TableCell>
            <TableCell.Secondary className="line-clamp-2">
                {item?.shippingAddress?.address1}
            </TableCell.Secondary>
        </TableCell>
    );
}
function SalesRep({ item }: Props) {
    return (
        <TableCell>
            <TableCell.Secondary
                className={!item?.salesRep?.name && "text-red-500"}
            >
                {item?.salesRep?.name || item?.customer?.businessName}
            </TableCell.Secondary>
        </TableCell>
    );
}
function Invoice({ item }: Props) {
    if (
        (!item.amountDue || item.amountDue == item.grandTotal) &&
        item.type != "quote"
    )
        return (
            <TableCell>
                <TableCell.Money
                    className={
                        !item.amountDue
                            ? "text-green-500 font-semibold"
                            : "text-red-500"
                    }
                >
                    {item.grandTotal}
                </TableCell.Money>
            </TableCell>
        );
    return (
        <TableCell>
            <TableCell.Primary>
                <TableCell.Money>{item.grandTotal}</TableCell.Money>
            </TableCell.Primary>
            {item.type != "quote" && (
                <TableCell.Secondary className="text-red-500">
                    ( <TableCell.Money>{item.amountDue}</TableCell.Money>)
                </TableCell.Secondary>
            )}
        </TableCell>
    );
}
function PaymentDueDate({ item }: Props) {
    return (
        <TableCell>
            <TableCell.Date>{item.paymentDueDate}</TableCell.Date>
        </TableCell>
    );
}
function Dispatch({ item }: Props) {
    const date =
        item.pickup?.pickupAt || item.pickup?.createdAt || item.deliveredAt;
    function Content() {
        return (
            <>
                <span className="capitalize">
                    <StatusBadge status={item.deliveryOption || "not set"} sm />
                    {date && <TableCell.Date>{date}</TableCell.Date>}
                </span>
            </>
        );
    }
    async function updateDeliveryMode(delivery) {
        if (delivery != item.deliveryOption) {
            await updateDeliveryModeDac(
                item.id,
                delivery,
                item.type == "order" ? "orders" : "quotes"
            );

            toast.success("Updated");
        }
    }
    if (date) return <Content />;

    return (
        <TableCell>
            <Menu
                Trigger={
                    <button>
                        <Content />
                    </button>
                }
            >
                {salesData.delivery.map((o) => (
                    <MenuItem
                        onClick={() => updateDeliveryMode(o.value)}
                        key={o}
                    >
                        {o.text}
                    </MenuItem>
                ))}
            </Menu>{" "}
        </TableCell>
    );
}
function Status({ item, delivery }: Props & { delivery? }) {
    let status: any = item?.prodStatus;
    if (["In Transit", "Return", "Delivered"].includes(item?.status as any))
        status = item?.status;
    if (!status) status = delivery ? "-" : item?.prodId ? "Prod Queued" : "";
    if (status == "Completed" && delivery) status = "Ready";
    const color = getBadgeColor(status || "");

    // return (
    //     <div className="min-w-16">
    //         <Badge
    //             variant={"secondary"}
    //             className={`h-5 px-1 whitespace-nowrap text-xs text-slate-100 ${color}`}
    //         >
    //             {/* {order?.prodStatus || "-"} */}
    //             {status || "no status"}
    //         </Badge>

    //         {delivery && order?.deliveredAt && (
    //             <DateCellContent>{order.deliveredAt}</DateCellContent>
    //         )}
    //     </div>
    // );
    return (
        <TableCell>
            <Badge
                variant={"secondary"}
                className={`h-5 px-1 whitespace-nowrap text-xs text-slate-100 ${color}`}
            >
                {/* {order?.prodStatus || "-"} */}
                {status || "no status"}
            </Badge>

            {delivery && item?.deliveredAt && (
                <TableCell.Date>{item.deliveredAt}</TableCell.Date>
            )}
        </TableCell>
    );
}
function SalesAction({ item }: Props) {
    const ctx = useSalesMenu(item as any);
    function Render({ option }: { option: MenuOption }) {
        if (option.groupTitle)
            return (
                <>
                    <DropdownMenuLabel>{option.groupTitle}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                </>
            );
        return (
            <MenuItem
                href={option.href}
                onClick={option.action}
                icon={option.icon}
                key={option.title}
                SubMenu={option?.subMenu?.map((s, si) => (
                    <Render key={si} option={s} />
                ))}
            >
                {option.title}
            </MenuItem>
        );
    }
    return (
        <>
            <Menu>
                {/* <MenuItem icon="menu"></MenuItem> */}
                {ctx.options?.map((option, oi) => (
                    <Render option={option} key={oi} />
                ))}
                <DeleteRowAction menu row={item} action={deleteOrderAction} />
            </Menu>
        </>
    );
}
function SalesStatus({ item }: Props) {
    let delivery = null;
    let status: any = item?.prodStatus;
    if (["In Transit", "Return", "Delivered"].includes(item?.status as any))
        status = item?.status;
    if (!status) status = delivery ? "-" : item?.prodId ? "Prod Queued" : "";
    if (status == "Completed" && delivery) status = "Ready";
    const color = getBadgeColor(status || "");
    return (
        <TableCell>
            <Badge
                variant={"secondary"}
                className={`h-5 px-1 whitespace-nowrap text-xs text-slate-100 ${color}`}
            >
                {/* {order?.prodStatus || "-"} */}
                {status || "no status"}
            </Badge>

            {delivery && item?.deliveredAt && (
                <TableCell.Date>{item.deliveredAt}</TableCell.Date>
            )}
        </TableCell>
        //   <div className="min-w-16">

        //   </div>
    );
}
function ProductionStatus({ item }: Props) {
    const submitted = sum(
        item.assignments.map((a) =>
            sum(a.submissions.map((s) => sum([s.lhQty, s.rhQty])))
        )
    );
    const totalDoors = item._meta.totalDoors;
    // console.log(item.productionStatus?.status);
    if (submitted == totalDoors)
        return (
            <TableCell>
                <TableCell.Status status="Completed" />
            </TableCell>
        );
    return (
        <TableCell>
            <TableCell.Status
                score={submitted}
                total={totalDoors}
                status={item.productionStatus?.status}
            />
        </TableCell>
    );
}
function DeliveryAction({ item }: Props) {
    const assignment = useAssignment({ type: "prod" });
    return (
        <>
            <Button
                onClick={() => assignment.open(item.id)}
                variant={"outline"}
            >
                View
            </Button>
        </>
    );
}
export let SalesCells = {
    SalesRep,
    SalesStatus,
    Status,
    Order,
    OrderDispatch,
    Customer,
    ProductionStatus,
    // Flag: SalesFlag,
    Address,
    PaymentDueDate,
    Invoice,
    Dispatch,
    SalesAction,
    DeliveryAction,
};
