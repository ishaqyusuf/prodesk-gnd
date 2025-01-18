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
import {
    createTransactionUseCase,
    getPaymentTerminalsUseCase,
} from "../../use-case/sales-payment-use-case";
import { toast } from "sonner";
import { selectionToInsertionEnd } from "@tiptap/core";
import { _modal } from "@/components/common/modal/provider";

export default function PayForm({}) {
    const tx = txStore();
    const form = useForm({
        defaultValues: {
            terminal: null,
            paymentMethod: tx.paymentMethod,
            amount: tx.totalPay,
            checkNo: null,
            deviceId: null,
            enableTip: false,
        },
    });
    const profile = tx.customerProfiles[tx.phoneNo];
    useEffect(() => {
        form.setValue("amount", tx.totalPay);
    }, [tx.totalPay]);
    const [pm, totalPay] = form.watch(["paymentMethod", "amount"]);
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
    async function terminalPay() {
        //
        toast.error("Terminal pay not available");
    }
    async function pay() {
        const data = form.getValues();
        const selections = profile?.salesInfo?.orders?.filter(
            (o) => tx.selections?.[o.orderId]
        );
        const r = await createTransactionUseCase({
            accountNo: tx.phoneNo,
            amount: +tx.totalPay,
            paymentMode: data.paymentMethod,
            salesIds: selections?.map((a) => a.id),
            description: "",
        });
        _modal.close();
        toast.success("Payment Applied");
    }
    return (
        <Form {...form}>
            <div className="border-t p-4 -m-4 sm:-m-6 grid gap-2 rounded-b-lg shadow-lg bg-white">
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
                                disabled
                                // disabled={tx.inProgress}
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
                                                        ? option.status !=
                                                          "PAIRED"
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
                        onClick={async () => {
                            if (!pm) tx.dotUpdate("paymentMethod", "terminal");
                            else {
                                if (pm == "terminal") await terminalPay();
                                else await pay();
                            }
                        }}
                        disabled={!tx.totalPay}
                    >
                        Pay
                        <Money className="ml-2" value={tx.totalPay} />
                    </Button>
                </div>
            </div>
        </Form>
    );
}
