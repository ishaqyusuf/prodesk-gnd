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
            checkoutId: null,
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
                _ctx.orderId = orderId;
            })
            .catch((e) => {
                toast.error(e.message);
            });
    }, []);
    // const [inProgress, setInProgress] = useState(false);
    const [isLoading, startTransition] = useTransition();
    const [waitingForPayment, setWaitingForPayment] = useState(false);
    const _ctx = {
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
        closePaymentForm() {
            // form.setValue("paymentMethod", null);
            form.reset({});
            setWaitingForPayment(false);
        },
        async cancelTerminalPayment() {
            await cancelSalesPaymentCheckoutUseCase(
                form.getValues("checkoutId")
            );
            form.reset({});
            setWaitingForPayment(false);
        },
        async terminalCheckout() {
            const e = await form.trigger(); //.then((e) => {
            const formData = form.getValues();
            startTransition(async () => {
                if (e) {
                    console.log(formData);

                    if (!formData.deviceId && isTerminal()) {
                        form.setError("deviceId", {});
                        return;
                    }
                    if (isTerminal()) {
                        const resp = await createTerminalPaymentUseCase({
                            salesPayment: {
                                amount: Number(formData.amount),
                                orderId,
                                terminalId: formData.deviceId,
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
                            form.setValue(
                                "checkoutId",
                                resp.resp.salesPayment.id
                            );
                            setWaitingForPayment(true);
                            const timeout = setTimeout(async () => {
                                if (waitingForPayment) {
                                    toast.error(
                                        "Payment status check timed out"
                                    );
                                    _ctx.cancelTerminalPayment();
                                }
                            }, 10000);
                            let checkWaiting = 0;
                            while (true) {
                                await new Promise((r) => setTimeout(r, 2000));
                                if (!waitingForPayment) {
                                    checkWaiting++;
                                    if (checkWaiting > 1) {
                                        _ctx.closePaymentForm();
                                        toast.error("Something went wrong");
                                        break;
                                    }
                                }
                                const status =
                                    await checkTerminalPaymentStatusUseCase(
                                        resp.resp.salesPayment.id
                                    );
                                console.log({ status });
                                if (status?.success) {
                                    clearTimeout(timeout);
                                    _ctx.closePaymentForm();
                                    toast.success(status.success);
                                    break;
                                }
                                if (status?.error) {
                                    clearTimeout(timeout);
                                    toast.error(status.error);
                                    _ctx.cancelTerminalPayment();
                                    break;
                                }
                            }
                        }
                    }
                }
            });
            // });
        },
    };

    return _ctx;
};
