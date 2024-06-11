import { TableCol } from "@/components/common/data-table/table-cells";
import { GetCustomers } from "../../type";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    EditRowAction,
    RowActionCell,
} from "@/components/_v1/data-table/data-table-row-actions";
import AuthGuard from "@/components/_v1/auth-guard";
import { openModal } from "@/lib/modal";

interface Props {
    item: GetCustomers["data"][0];
}
export let Cells = {
    PendingInvoice({ item }: Props) {
        return (
            <TableCol>
                <TableCol.Money value={item.amountDue} />
            </TableCol>
        );
    },
    Orders({ item }: Props) {
        return (
            <TableCol>
                <TableCol.Primary>{item._count.salesOrders}</TableCol.Primary>
            </TableCol>
        );
    },
    Customer({ item }: Props) {
        return (
            <TableCol>
                <TableCol.Primary>
                    {item.businessName || item.name}
                </TableCol.Primary>
                <TableCol.Secondary>{item.phoneNo}</TableCol.Secondary>
            </TableCol>
        );
    },
    Action({ item }: Props) {
        // const modal = useModal
        return (
            <RowActionCell>
                <AuthGuard can={["editOrders"]}>
                    <EditRowAction
                        onClick={(e) => {
                            openModal("customerForm", item);
                        }}
                    />
                </AuthGuard>
            </RowActionCell>
        );
    },
    Profile({
        item,
        profiles,
        defaultProfile,
        setCustomerProfile,
    }: Props & { profiles; defaultProfile; setCustomerProfile }) {
        return (
            <TableCol>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="secondary"
                            className="flex h-8  data-[state=open]:bg-muted"
                        >
                            <span className="whitespace-nowrap">
                                {item.profile?.title ||
                                    defaultProfile?.title ||
                                    "Select Profile"}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[185px]">
                        {profiles?.data?.map((profile) => (
                            <DropdownMenuItem
                                onClick={() =>
                                    setCustomerProfile(item.id, profile)
                                }
                                key={profile.id}
                            >
                                {profile.title}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCol>
        );
    },
};
