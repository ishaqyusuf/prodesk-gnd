import {
    createContext,
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from "react";
import { getSalesPaymentData, GetSalesPaymentData } from "./action";
import { toast } from "sonner";
import {
    ModalContextProps,
    useModal,
} from "@/components/common/modal/provider";
import Modal from "@/components/common/modal";
import { Info } from "@/components/_v1/info";
import Money from "@/components/_v1/money";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { useForm, UseFormReturn } from "react-hook-form";
import {
    createSalesPayment,
    CreateSalesPaymentProps,
    getSquareDevices,
    getSquareTerminalPaymentStatus,
    squarePaymentSuccessful,
} from "@/_v2/lib/square";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/common/controls/controlled-input";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import Btn from "@/components/_v1/btn";
import { notify } from "../../../mail-grid/lib/use-mail-event";
import ControlledSelect from "@/components/common/controls/controlled-select";
import { SelectItem } from "@/components/ui/select";
import { CheckCircle2Icon, Dot, Loader2Icon, XCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FormProps = CreateSalesPaymentProps & {
    modalTitle;
    modalSubtitle;
};
type TabType =
    | "main"
    | "paymentLinkForm"
    | "processingPayment"
    | "paymentProcessFailed"
    | "paymentProcessSuccessful";
const Ctx = createContext<{
    order: GetSalesPaymentData;
    setOrder;
    modal: ModalContextProps;
    tab: TabType;
    setTab: Dispatch<SetStateAction<TabType>>;
    modalTitle;
    modalSubtitle;
    form: UseFormReturn<FormProps>;
}>({} as any);
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

    const [tab, setTab] = useState<TabType>("main");

    const form = useForm<FormProps>({
        defaultValues: {},
    });
    const [paymentType, modalTitle, modalSubtitle] = form.watch([
        "type",
        "modalTitle",
        "modalSubtitle",
    ]);
    function _initPaymentForm() {
        form.reset({
            address: {
                addressLine1: order?.billingAddress?.address1,
            },
            dueAmount: order.amountDue,
            grandTotal: order.grandTotal,
            email: order?.customer?.email,
            phone: order?.customer?.phoneNo,
            orderId: order.id,
            orderIdStr: order.orderId,
            amount: order.amountDue,
            type: "link",
            items: order.lineItems,
            modalTitle: order.orderId,
            modalSubtitle: `Payment Information`,
        });
        setTab("paymentLinkForm");
    }

    async function createPayment() {
        try {
            const data = form.getValues();
            if (data.type == "terminal") {
                if (!data.deviceId) throw new Error("Select a terminal");

                const devices = await getSquareDevices();
                const selectedDevice = devices.find(
                    (d) => d.value == data.deviceId
                );
                if (!selectedDevice || selectedDevice?.status != "AVAILABLE") {
                    console.log({ selectedDevice, devices });
                    throw new Error("Selected terminal is not online");
                }
            }
            let resp = await createSalesPayment(data);
            console.log(resp);

            if (resp?.errors) {
                resp.errors.map((e) => {
                    toast.error(e.detail, {
                        description: e.field,
                    });
                });
                return;
            }
            if (resp.id && data.type == "terminal") {
                form.setValue("salesCheckoutId", resp.salesCheckoutId);
                form.setValue("paymentId", resp.paymentId);
                form.setValue("terminalStatus", "processing");
                form.setValue("modalTitle", "Processing Payment");
                form.setValue(
                    "modalSubtitle",
                    "Swipe your card to finalize payment"
                );
                setTab("processingPayment");
            }
            // await notify("PAYMENT_LINK_CREATED", {
            //     customerName:
            //         order.customer.businessName || order.customer.name,
            //     paymentLink,
            //     orderId: order.orderId,
            // });
            toast.success("Created");
        } catch (error) {
            // console.log(error);
            if (error instanceof Error) toast.error(error.message);
        }
    }
    if (!order) return null;

    return (
        <Ctx.Provider
            value={{
                order,
                setOrder,
                modal,
                tab,
                setTab,
                modalSubtitle,
                modalTitle,
                form,
            }}
        >
            <Modal.Content>
                <Modal.Header title={modalTitle} subtitle={modalSubtitle} />
                <Tabs
                    defaultValue={tab}
                    value={tab}
                    onValueChange={setTab as any}
                >
                    <TabsList className="hidden">
                        <TabsTrigger value="main"></TabsTrigger>
                        <TabsTrigger value="paymentLinkForm"></TabsTrigger>
                        <TabsTrigger value="processingPayment"></TabsTrigger>
                        <TabsTrigger value="paymentProcessFailed"></TabsTrigger>
                        <TabsTrigger value="paymentProcessSuccessful"></TabsTrigger>
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
                                <ControlledSelect
                                    options={["terminal", "link"]}
                                    control={form.control}
                                    size="sm"
                                    name="type"
                                    label="Payment Method"
                                />
                                <ControlledSelect
                                    options={order.terminals || []}
                                    control={form.control}
                                    size="sm"
                                    disabled={paymentType != "terminal"}
                                    name="deviceId"
                                    SelectItem={({ option }) => (
                                        <SelectItem
                                            value={option.value}
                                            disabled={
                                                option.status != "AVAILABLE"
                                            }
                                            className=""
                                        >
                                            <div className="flex items-center gap-2">
                                                <Dot
                                                    className={cn(
                                                        option.status ==
                                                            "AVAILABLE"
                                                            ? "text-green-500"
                                                            : "text-red-600"
                                                    )}
                                                />
                                                <span>{option.label}</span>
                                            </div>
                                        </SelectItem>
                                    )}
                                    label="Terminal"
                                />
                            </div>
                        </Form>
                        <div className="mt-4">
                            <Modal.Footer
                                submitText="Proceed"
                                onSubmit={createPayment}
                            />
                        </div>
                        {/* <div className="col-span-2 flex justify-end">
                            <Btn onClick={createPayment}>Proceed</Btn>
                        </div> */}
                    </TabsContent>
                    <TerminalComponents />
                </Tabs>
            </Modal.Content>
        </Ctx.Provider>
    );
}

function TerminalComponents({}) {
    const ctx = useContext(Ctx);
    const form = ctx.form;
    const [paymentStatus, paymentId, salesCheckoutId] = ctx.form.watch([
        "terminalStatus",
        "paymentId",
        "salesCheckoutId",
    ]);
    useEffect(() => {
        let interval;

        if (paymentStatus == "processing") {
            interval = setInterval(async () => {
                //
                const status = await getSquareTerminalPaymentStatus(
                    paymentId,
                    salesCheckoutId
                );
                switch (status) {
                    case "COMPLETED":
                        ctx.setTab("paymentProcessSuccessful");
                        form.setValue("modalTitle", "Payment Successful");
                        form.setValue(
                            "modalSubtitle",
                            "Swipe your card to finalize payment"
                        );
                        await squarePaymentSuccessful(salesCheckoutId);
                        break;
                    case "IN_PROGRESS":
                    case "PENDING":
                        form.setValue("modalTitle", "Processing Payment");

                        break;
                    default:
                        form.setValue("modalTitle", "Payment Failed");
                        form.setValue(
                            "modalSubtitle",
                            "There was an error processing your payment."
                        );
                        ctx.setTab("paymentProcessFailed");
                }
            }, 1500); // Polling every 1 second
        }

        // Cleanup interval on component unmount or when polling stops
        return () => clearInterval(interval);
    }, [paymentStatus]);

    return (
        <>
            <TabsContent value="processingPayment">
                <div className="flex items-center justify-center py-10">
                    <Loader2Icon className="h-16 w-16 text-blue-500 animate-spin" />
                </div>
                <div className="flex gap-4">
                    <Button variant="destructive" className="flex-1">
                        Cancel Payment
                    </Button>
                </div>
            </TabsContent>
            <TabsContent value="processingFailed">
                <div className="flex items-center justify-center py-10">
                    <XCircleIcon className="h-16 w-16 text-red-500" />
                </div>
                <div className="flex gap-4">
                    <Button className="flex-1">Retry Payment</Button>
                    <Button className="flex-1">Cancel</Button>
                </div>
            </TabsContent>
            <TabsContent value="processingSuccessful">
                <div className="flex items-center justify-center py-10">
                    <CheckCircle2Icon className="h-16 w-16 text-green-500" />
                </div>
                <div className="flex gap-4">
                    <Button className="flex-1">Close</Button>
                </div>
            </TabsContent>
        </>
    );
}
