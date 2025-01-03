import { Icons } from "@/components/_v1/icons";
import Money from "@/components/_v1/money";
import Button from "@/components/common/button";
import { useEffect, useState } from "react";
import { useSalesOverview } from "../overview-provider";
import { usePayment } from "../payments/payment-hooks";
import { TerminalPay } from "../payments/payment-tab";
import { Menu } from "@/components/(clean-code)/menu";

export function PayAction({}) {
    const ctx = useSalesOverview();
    const [pay, setPay] = useState<{
        paymentMethod?;
    }>(null);
    if (ctx.item.type == "quote") return null;
    return (
        <>
            {pay && (
                <QuickPay
                    {...(pay || {})}
                    onClose={() => {
                        setPay(null);
                    }}
                />
            )}
            <Menu
                Icon={Icons.dollar}
                variant="default"
                label={`Pay $${ctx.item.due}`}
                disabled={!ctx.item.due || pay != null}
            >
                <Menu.Item
                    onClick={() => {
                        setPay({
                            paymentMethod: "cash",
                        });
                    }}
                >
                    Cash
                </Menu.Item>
                <Menu.Item
                    onClick={() => {
                        setPay({
                            paymentMethod: "check",
                        });
                    }}
                >
                    Check
                </Menu.Item>
                <Menu.Item
                    onClick={() => {
                        setPay({
                            paymentMethod: "link",
                        });
                    }}
                >
                    Payment Link
                </Menu.Item>
                <Menu.Item
                    onClick={() => {
                        setPay({
                            paymentMethod: "terminal",
                        });
                    }}
                >
                    Terminal
                </Menu.Item>
            </Menu>
            {/* <Button
                onClick={() => {
                    setPay(true);
                }}
                disabled={!ctx.item.due || pay}
                size="xs"
                className="bg-green-600"
            >
                <Icons.dollar className="w-4 h-4 mr-2" />
                Pay
                <span className="ml-1">
                    <Money value={ctx.item?.due} />
                </span>
            </Button> */}
        </>
    );
}
function QuickPay({ onClose, paymentMethod }: { onClose?; paymentMethod? }) {
    const ctx = usePayment();
    const [ready, setIsReady] = useState(false);
    useEffect(() => {
        if (!ctx.data) return;
        ctx.form.setValue("paymentMethod", paymentMethod);
        ctx.createPayment(paymentMethod);
        setIsReady(true);
    }, [ctx.data, paymentMethod]);
    useEffect(() => {
        ctx.load().then((res) => {
            // ctx.form.setValue("paymentMethod", "terminal");
            // ctx.createPayment("terminal");
        });
    }, []);
    useEffect(() => {
        setTimeout(() => {
            if (!ctx.paymentMethod && ready) {
                onClose?.();
            }
        }, 500);
    }, [ctx.paymentMethod, ready]);
    return <TerminalPay ctx={ctx} />;
}
