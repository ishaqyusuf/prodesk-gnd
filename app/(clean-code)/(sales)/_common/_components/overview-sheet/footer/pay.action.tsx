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
    const [pay, setPay] = useState(null);
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
                disabled={!ctx.item.due || pay}
            >
                <Menu.Item
                    onClick={() => {
                        setPay(true);
                    }}
                >
                    Terminal
                </Menu.Item>
                <Menu.Item>Cash</Menu.Item>
                <Menu.Item>Check</Menu.Item>
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
function QuickPay({ onClose }) {
    const ctx = usePayment();
    const [ready, setIsReady] = useState(false);
    useEffect(() => {
        // console.log(ctx.data);
        if (!ctx.data) return;
        ctx.form.setValue("paymentMethod", "terminal");
        ctx.createPayment("terminal");
        setIsReady(true);
    }, [ctx.data]);
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
