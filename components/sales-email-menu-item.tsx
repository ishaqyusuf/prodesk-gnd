import { __sendInvoiceEmailTrigger } from "@/actions/triggers/send-invoice-email";
import { Menu } from "./(clean-code)/menu";
import { toast } from "sonner";
import { SalesType } from "@/app/(clean-code)/(sales)/types";

export function SalesEmailMenuItem({
    salesId,
    salesType,
}: {
    salesId;
    salesType: SalesType;
}) {
    const isQuote = salesType == "quote";
    async function sendInvoiceEmail() {
        toast.promise(async () => await __sendInvoiceEmailTrigger(salesId), {
            loading: "Sending email...",
            error(data) {
                return data.message;
            },
        });
    }
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
