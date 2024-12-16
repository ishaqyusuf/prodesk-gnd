import { Menu } from "@/components/(clean-code)/menu";
import ConfirmBtn from "@/components/_v1/confirm-btn";
import { Icons } from "@/components/_v1/icons";
import { Button } from "@/components/ui/button";
import { useSalesOverview } from "./overview-provider";
import { toast } from "sonner";
import Money from "@/components/_v1/money";
import { useEffect, useState } from "react";
import { usePayment } from "./payments/payment-hooks";
import { TerminalPay } from "./payments/payment-tab";
import { openLink } from "@/lib/open-link";

export default function ActionFooter({}) {
    const ctx = useSalesOverview();
    const [pay, setPay] = useState(false);
    return (
        <div className="absolute flex gap-4 bottom-0 px-4 py-2 bg-white border-t sbg-muted w-full shadow-sm">
            {pay && (
                <QuickPay
                    onClose={() => {
                        setPay(false);
                    }}
                />
            )}
            <div className="flex-1"></div>
            <Button
                onClick={() => {
                    setPay(true);
                }}
                disabled={!ctx.item.due || pay}
                size="sm"
                className="bg-green-600"
            >
                <Icons.dollar className="w-4 h-4 mr-2" />
                Pay
                <span className="ml-1">
                    <Money value={ctx.item?.due} />
                </span>
            </Button>
            <ConfirmBtn
                size="sm"
                Icon={Icons.trash}
                trash
                variant="destructive"
            >
                Delete
            </ConfirmBtn>
            <Menu variant="outline">
                <Menu.Item
                    icon="print"
                    onClick={() => {
                        openLink(
                            `/printer/sales`,
                            {
                                slugs: ctx.item?.slug,
                                mode: "order",
                                preview: true,
                            },
                            true
                        );
                    }}
                >
                    Print
                </Menu.Item>
                <Menu.Item
                    icon="radix"
                    onClick={() => {
                        ctx.refresh().then((r) => {
                            toast.success("Refreshed");
                        });
                    }}
                >
                    Refresh
                </Menu.Item>
            </Menu>
        </div>
    );
}
function QuickPay({ onClose }) {
    const ctx = usePayment();
    const [ready, setIsReady] = useState(false);
    useEffect(() => {
        ctx.form.setValue("paymentMethod", "terminal");
        setIsReady(true);
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
