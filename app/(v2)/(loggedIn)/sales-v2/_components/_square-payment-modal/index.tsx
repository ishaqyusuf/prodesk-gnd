import { useEffect, useState } from "react";
import { getSalesPaymentData, GetSalesPaymentData } from "./action";
import { toast } from "sonner";
import { useModal } from "@/components/common/modal/provider";
import Modal from "@/components/common/modal";
import { Info } from "@/components/_v1/info";
import Money from "@/components/_v1/money";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { useForm } from "react-hook-form";
import { createSalesPayment, CreateSalesPaymentProps } from "@/_v2/lib/square";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/common/controls/controlled-input";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import Btn from "@/components/_v1/btn";
import { notify } from "../../../mail-grid/lib/use-mail-event";

export default function SquarePaymentModal({ id }: { id: number }) {
    const [order, setOrder] = useState<GetSalesPaymentData>(null as any);

    const modal = useModal();
    useEffect(() => {
        getSalesPaymentData(id)
            .then((data) => {
                console.log(data);
                setOrder(data);
            })
            .catch((e) => {
                if (e instanceof Error) toast.error(e.message);
                modal.close();
            });
    }, []);

    const [tab, setTab] = useState<"main" | "paymentLinkForm">("main");
    const form = useForm<CreateSalesPaymentProps>({
        defaultValues: {},
    });
    function _initPaymentForm() {
        form.reset({
            address: {
                addressLine1: order?.billingAddress?.address1,
            },
            email: order?.customer?.email,
            phone: order?.customer?.phoneNo,
            orderId: order.id,
            amount: order.amountDue,
            items: [],
        });
        setTab("paymentLinkForm");
    }

    async function createLink() {
        try {
            let paymentLink;
            await notify("PAYMENT_LINK_CREATED", {
                customerName:
                    order.customer.businessName || order.customer.name,
                paymentLink,
                orderId: order.orderId,
            });
            paymentLink = await createSalesPayment(form.getValues());
            toast.success("Created");
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        }
    }
    if (!order) return null;

    return (
        <Modal.Content>
            <Modal.Header
                title={order.orderId}
                subtitle={"Payment Information"}
            />
            <Tabs defaultValue={tab} value={tab} onValueChange={setTab as any}>
                <TabsList className="hidden">
                    <TabsTrigger value="main"></TabsTrigger>
                    <TabsTrigger value="paymentLinkForm"></TabsTrigger>
                </TabsList>
                <TabsContent value="main">
                    <div className="grid grid-cols-2 gap-4">
                        <Info
                            label="Total Payment"
                            value={<Money value={order.grandTotal}></Money>}
                        />
                        <Info
                            label="Pending Payment"
                            value={<Money value={order.amountDue}></Money>}
                        />
                    </div>
                    <div className="">
                        <Button
                            onClick={_initPaymentForm}
                            disabled={!order.canCreatePaymentLink}
                            className="w-full"
                        >
                            Create Payment Link
                        </Button>
                    </div>
                </TabsContent>
                <TabsContent value="paymentLinkForm">
                    <Form {...form}>
                        <div className="grid grid-cols-2 gap-2">
                            <ControlledInput
                                control={form.control}
                                name="email"
                                size="sm"
                                label="Email"
                            />
                            <ControlledInput
                                control={form.control}
                                size="sm"
                                name="phone"
                                label="Phone"
                            />
                            <ControlledInput
                                control={form.control}
                                size="sm"
                                className="col-span-2"
                                name="address.addressLine1"
                                label="Address"
                            />
                            <ControlledInput
                                control={form.control}
                                size="sm"
                                name="amount"
                                label="Amount"
                            />
                            <div className="flex items-end mb-2">
                                <ControlledCheckbox
                                    control={form.control}
                                    name="allowTip"
                                    switchInput
                                    label={"Enable Tip"}
                                />
                            </div>
                            <div className="col-span-2 flex justify-end">
                                <Btn onClick={createLink}>Create Link</Btn>
                            </div>
                        </div>
                    </Form>
                </TabsContent>
            </Tabs>
        </Modal.Content>
    );
}
