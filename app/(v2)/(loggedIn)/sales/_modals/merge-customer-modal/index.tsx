"use client";
import {
    PrimaryCellContent,
    SecondaryCellContent,
} from "@/components/_v1/columns/base-columns";
import { Icons } from "@/components/_v1/icons";
import BaseModal from "@/components/_v1/modals/base-modal";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ICustomer } from "@/types/customers";
import { useEffect } from "react";
import { mergeCustomerModal } from "./open";
import { useFormContext } from "react-hook-form";
import MergeCustomerModalFooter from "./footer";

export const useMergeCustomerFormContext = () =>
    useFormContext<{
        primaryId: number;
    }>();
export default function MergeCustomersModal({}) {
    return (
        <BaseModal
            modalName={mergeCustomerModal}
            Title={({}) => <>Merge Customers</>}
            Subtitle={({}) => <>Select Primary Customer</>}
            Content={MergeCustomerModalContent}
            Footer={MergeCustomerModalFooter}
        />
    );
}

export interface MergeCustomerModalProps {
    data: {
        customers: ICustomer[];
    };
    // form: UseFormReturn<{ primaryId: number }>;
}
function MergeCustomerModalContent({ data }: MergeCustomerModalProps) {
    // const [primaryId, setPrimaryId] = useState(data.customers[0]?.id);
    const form = useMergeCustomerFormContext();
    const primaryId = form.watch("primaryId");
    useEffect(() => {
        form.reset({
            primaryId: null as any,
        });
    }, []);
    return (
        <Table>
            <TableBody>
                {data.customers.map((customer) => (
                    <TableRow
                        className="cursor-pointer"
                        key={customer.id}
                        onClick={() => form.setValue("primaryId", customer.id)}
                    >
                        <TableCell>
                            <Icons.check
                                className={cn(
                                    primaryId == customer.id
                                        ? "text-green-600"
                                        : "opacity-10"
                                )}
                            />
                        </TableCell>
                        <TableCell>
                            <PrimaryCellContent>
                                {customer.name}
                            </PrimaryCellContent>
                            <SecondaryCellContent>
                                {customer.phoneNo}
                            </SecondaryCellContent>
                        </TableCell>
                        <TableCell>
                            {customer.profile?.title || "No Profile"}
                        </TableCell>
                        <TableCell>
                            {customer._count?.salesOrders || "0"} {" orders"}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
