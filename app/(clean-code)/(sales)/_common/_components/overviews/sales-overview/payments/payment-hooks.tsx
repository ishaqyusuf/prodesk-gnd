import { useEffect, useState } from "react";
import { useSalesOverview } from "../overview-provider";
import {
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
import { cancelSalesPaymentCheckoutDta } from "../../../../data-access/sales-payment-dta";

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
    const [inProgress, setInProgress] = useState(false);
    const resp = {
        orderId,
        terminals,
        ready,
        data,
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
        async terminalCheckout() {
            const e = await form.trigger(); //.then((e) => {
            const formData = form.getValues();
            if (e) {
                if (!formData.deviceId && isTerminal()) {
                    form.setError("deviceId", {});
                    return;
                }
                if (isTerminal()) {
                    setInProgress(true);
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
                        async function terminalPaymentStatus() {
                            //
                            return new Promise(async (resolve, reject) => {
                                const timeout = setTimeout(async () => {
                                    if (inProgress) {
                                        await cancelSalesPaymentCheckoutDta(
                                            resp.resp.salesPayment.id
                                        );
                                        reject(
                                            "Payment status check timed out"
                                        );
                                        setInProgress(false);
                                    }
                                }, 10000);
                                while (true && inProgress) {
                                    if (inProgress) {
                                        const status =
                                            await checkTerminalPaymentStatusUseCase(
                                                resp.resp.salesPayment.id
                                            );

                                        if (status.success) {
                                            clearTimeout(timeout);
                                            resolve(status.success);
                                            form.setValue(
                                                "paymentMethod",
                                                null
                                            );
                                            break;
                                        }
                                        if (status.error) {
                                            clearTimeout(timeout);
                                            reject(status.error);
                                            break;
                                        }
                                        await new Promise((r) =>
                                            setTimeout(r, 2000)
                                        );
                                    }
                                }
                            });
                        }
                        toast.promise(terminalPaymentStatus, {
                            loading: "Waiting for payment...",
                            action: {
                                label: "Cancel",
                                onClick: () => {
                                    setInProgress(true);
                                },
                            },
                            success(data) {
                                return `${data}`;
                            },
                            error(data) {
                                return data;
                            },
                        });
                    }
                }
            }
            // });
        },
    };

    return resp;
};
