import { useEffect, useState, useTransition } from "react";
import { useSalesOverview } from "../overview-provider";
import {
    cancelSalesPaymentCheckoutUseCase,
    checkTerminalPaymentStatusUseCase,
    createTerminalPaymentUseCase,
    GetPaymentTerminals,
    getPaymentTerminalsUseCase,
    GetSalesPayment,
    getSalesPaymentUseCase,
} from "../../../../use-case/sales-payment-use-case";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const usePayment = () => {
    return usePaymentContext();
};
const usePaymentContext = () => {
    const ctx = useSalesOverview();
    const orderId = ctx.item.id;
    const [data, setData] = useState<GetSalesPayment>(null as any);
    const [ready, setReady] = useState(false);
    const form = useForm({
        resolver: zodResolver(
            z.object({
                amount: z.number(),
            })
        ),
        defaultValues: {
            paymentMethod: null as "terminal" | "link",
            amount: null,
            deviceId: null,
            enableTip: false,
            terminal: null as GetPaymentTerminals,
        },
    });

    const [paymentMethod, terminals] = form.watch([
        "paymentMethod",
        "terminal.devices",
    ]);
    const isTerminal = () => paymentMethod == "terminal";
    useEffect(() => {
        getSalesPaymentUseCase(orderId)
            .then((result) => {
                setData(result);
                setReady(true);
                resp.orderId = orderId;
            })
            .catch((e) => {
                toast.error(e.message);
            });
    }, []);
    // const [inProgress, setInProgress] = useState(false);
    const [isLoading, startTransition] = useTransition();
    const [waitingForPayment, setWaitingForPayment] = useState(false);
    const resp = {
        orderId,
        terminals,
        ready,
        data,
        inProgress: isLoading,
        waitingForPayment,
        form,
        paymentMethod,
        async createPayment(pm) {
            form.setValue("amount", data.amountDue);
            if (pm == "terminal") {
                const terminal = await getPaymentTerminalsUseCase();
                form.setValue("terminal", terminal);
                form.setValue("deviceId", terminal?.lastUsed?.value);
            } else {
            }
            form.setValue("paymentMethod", pm);
            form.clearErrors();
        },
        cancelPayment() {
            form.setValue("paymentMethod", null);
        },
        cancelTerminalPayment() {
            setWaitingForPayment(false);
        },
        async terminalCheckout() {
            startTransition(async () => {
                const e = await form.trigger(); //.then((e) => {
                const formData = form.getValues();
                if (e) {
                    if (!formData.deviceId && isTerminal()) {
                        form.setError("deviceId", {});
                        return;
                    }
                    if (isTerminal()) {
                        const resp = await createTerminalPaymentUseCase({
                            salesPayment: {
                                amount: Number(formData.amount),
                                orderId,
                                paymentType: "square_terminal",
                            },
                            terminal: {
                                amount: Number(formData.amount),
                                deviceId: formData.deviceId,
                                allowTipping: formData.enableTip,
                            },
                        });

                        if (resp.error) toast.error(resp.error);
                        else {
                            setWaitingForPayment(true);
                            const timeout = setTimeout(async () => {
                                if (waitingForPayment) {
                                    await cancelSalesPaymentCheckoutUseCase(
                                        resp.resp.salesPayment.id
                                    );
                                    toast.error(
                                        "Payment status check timed out"
                                    );
                                    // setInProgress(false);
                                    setWaitingForPayment(false);
                                }
                            }, 10000);
                            await new Promise((r) => setTimeout(r, 2000));
                            while (
                                true &&
                                waitingForPayment &&
                                resp.resp.salesPayment.id
                            ) {
                                const status =
                                    await checkTerminalPaymentStatusUseCase(
                                        resp.resp.salesPayment.id
                                    );
                                if (status.success) {
                                    clearTimeout(timeout);
                                    form.setValue("paymentMethod", null);
                                    setWaitingForPayment(false);
                                    toast.success(status.success);
                                    break;
                                }
                                if (status.error) {
                                    clearTimeout(timeout);
                                    toast.error(status.error);
                                    setWaitingForPayment(false);
                                    break;
                                }
                                await new Promise((r) => setTimeout(r, 2000));
                            }
                        }
                    }
                }
            });
            // });
        },
    };

    return resp;
};
