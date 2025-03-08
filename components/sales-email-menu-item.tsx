import { __sendInvoiceEmailTrigger } from "@/actions/triggers/send-invoice-email";
import { Menu } from "./(clean-code)/menu";
import { toast } from "sonner";
import { SalesType } from "@/app/(clean-code)/(sales)/types";

export function SalesEmailMenuItem({
    salesId,
    orderNo,
    salesType,
    asChild = false,
}: {
    salesId?;
    salesType: SalesType;
    asChild?: boolean;
    orderNo?: string;
}) {
    const isQuote = salesType == "quote";
    async function sendInvoiceEmail() {
        toast.promise(
            async () =>
                await __sendInvoiceEmailTrigger({
                    ids: salesId,
                    orderIds: orderNo,
                }),
            {
                loading: "Sending email...",
                error(data) {
                    return data.message;
                },
            }
        );
    }
    if (asChild)
        return (
            <>
                <Menu.Item onClick={sendInvoiceEmail}>
                    {isQuote ? "Quote " : "Invoice "} Email
                </Menu.Item>
                <Menu.Item disabled>Reminder Email</Menu.Item>
            </>
        );
    return (
        <>
            <Menu.Item
                disabled={!salesId}
                icon="Email"
                SubMenu={
                    <>
                        <Menu.Item onClick={sendInvoiceEmail}>
                            {isQuote ? "Quote " : "Invoice "} Email
                        </Menu.Item>
                        <Menu.Item disabled>Reminder Email</Menu.Item>
                    </>
                }
            >
                Email
            </Menu.Item>
        </>
    );
}
