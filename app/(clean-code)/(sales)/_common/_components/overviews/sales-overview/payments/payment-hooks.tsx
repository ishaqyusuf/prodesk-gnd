import { useEffect, useState } from "react";
import { useSalesOverview } from "../overview-provider";
import {
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
            form.trigger().then((e) => {
                const data = form.getValues();
                if (e) {
                    if (!data.deviceId && data.paymentMethod == "terminal") {
                        form.setError("deviceId", {});
                        return;
                    }
                    if (data.paymentMethod == "terminal") {
                    }
                }
            });
        },
    };

    return resp;
};
