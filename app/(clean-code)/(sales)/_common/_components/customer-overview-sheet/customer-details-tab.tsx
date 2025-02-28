import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { customerStore } from "./store";
import { Icons } from "@/components/_v1/icons";
import { _modal } from "@/components/common/modal/provider";
import { openTxForm } from "../tx-form";
import { useEffect, useState } from "react";
import { getCustomerGeneralInfoAction } from "@/actions/get-customer-general-info";
import { AsyncFnType } from "@/types";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";

import Button from "@/components/common/button";
import InputControl from "@/_v2/components/common/input-control";
import { updateCustomerEmailAction } from "@/actions/update-customer-email-action";
import { toast } from "sonner";
import FormInput from "@/components/common/controls/form-input";

export default function CustomerDetailsTab() {
    const ctx = customerStore();
    const [data, setData] =
        useState<AsyncFnType<typeof getCustomerGeneralInfoAction>>();
    useEffect(() => {
        getCustomerGeneralInfoAction(ctx.profile?.phoneNo).then((e) => {
            setData(e);
        });
    }, [ctx.profile?.phoneNo]);
    const form = useForm({
        defaultValues: {
            email: "",
        },
    });
    async function updateEmail() {
        const email = form.getValues("email");
        await updateCustomerEmailAction(ctx.profile?.phoneNo, email)
            .then((e) => {
                toast.success("updated");
            })
            .catch((e) => {
                toast.error(e.message);
            });
    }
    if (!data) return null;
    return (
        <TabsContent value="general">
            <Form {...form}>
                <div className="grid gap-2">
                    <FormInput
                        label="Email"
                        control={form.control}
                        name="email"
                    />
                    <div className="flex justify-end">
                        <Button action={updateEmail}>Update</Button>
                    </div>
                </div>
            </Form>
            <div className="">
                <Label>Customer Address</Label>
                <Table>
                    <TableBody>
                        {data?.customers?.map((a) => (
                            <TableRow key={a.id}>
                                <TableCell>
                                    <div>{a.businessName || a.name}</div>
                                    <div>{a.email || "No email"}</div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TabsContent>
    );
}
