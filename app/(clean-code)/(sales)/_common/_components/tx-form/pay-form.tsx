import Button from "@/components/common/button";
import { txStore } from "./store";
import Money from "@/components/_v1/money";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import FormSelect from "@/components/common/controls/form-select";
import { paymentMethods } from "../../utils/contants";
import { useEffect } from "react";
import FormInput from "@/components/common/controls/form-input";
import { SelectItem } from "@/components/ui/select";
import { env } from "@/env.mjs";
import { Dot } from "lucide-react";
import { cn } from "@/lib/utils";
import FormCheckbox from "@/components/common/controls/form-checkbox";
import { getPaymentTerminalsUseCase } from "../../use-case/sales-payment-use-case";
import { toast } from "sonner";

export default function PayForm({}) {
    const tx = txStore();
    const form = useForm({
        defaultValues: {
            terminal: null,
            paymentMethod: tx.paymentMethod,
            amount: null,
            checkNo: null,
            deviceId: null,
            enableTip: false,
        },
    });
    const pm = form.watch("paymentMethod");
    useEffect(() => {
        if (!tx.terminals?.length && pm == "terminal") {
            getPaymentTerminalsUseCase()
                .then((terminals) => {
                    tx.dotUpdate("terminals", terminals.devices);
                    form.setValue("deviceId", terminals.lastUsed);
                })
                .catch((e) => {
                    toast.error(e.message);

                    form.setError("paymentMethod", {
                        message: e.message,
                    });
                });
        }
    }, [pm, tx.terminals]);
    if (!tx.phoneNo) return null;
    return (
        <div className="border-t pt-2 -mb-2 bg-white">
            {!tx.paymentMethod || (
                <Form {...form}>
                    <div className="grid gap-4">
                        <FormSelect
                            size="sm"
                            control={form.control}
                            name="paymentMethod"
                            options={paymentMethods}
                            titleKey="label"
                            valueKey="value"
                            label="Payment Method"
                        />
                        <FormInput
                            control={form.control}
                            name="amount"
                            type="number"
                            size="sm"
                            label={"Amount"}
                            prefix="$"
                            disabled={tx.inProgress}
                        />
                        {pm == "check" ? (
                            <FormInput
                                control={form.control}
                                name="checkNo"
                                size="sm"
                                label={"Check No."}
                                disabled={tx.inProgress}
                            />
                        ) : pm == "terminal" ? (
                            <>
                                <FormSelect
                                    options={tx.terminals || []}
                                    control={form.control}
                                    size="sm"
                                    disabled={tx.inProgress}
                                    name="deviceId"
                                    SelectItem={({ option }) => (
                                        <SelectItem
                                            value={option.value}
                                            disabled={
                                                env.NEXT_PUBLIC_NODE_ENV ==
                                                "production"
                                                    ? option.status != "PAIRED"
                                                    : false
                                            }
                                            className=""
                                        >
                                            <div className="flex items-center gap-2">
                                                <Dot
                                                    className={cn(
                                                        option.status ==
                                                            "PAIRED"
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
                            </>
                        ) : (
                            <></>
                        )}
                    </div>
                </Form>
            )}
            <div className="flex justify-end gap-4 items-center">
                {pm != "terminal" || (
                    <>
                        <FormCheckbox
                            disabled={tx.inProgress}
                            switchInput
                            control={form.control}
                            name="enableTip"
                            label={"Enable Tip"}
                        />
                    </>
                )}
                <Button
                    onClick={() => {
                        tx.dotUpdate("paymentMethod", "terminal");
                    }}
                    disabled={!tx.totalPay}
                >
                    Pay
                    <Money className="ml-2" value={tx.totalPay} />
                </Button>
            </div>
        </div>
    );
}
