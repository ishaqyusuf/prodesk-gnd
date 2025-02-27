import { __sendInvoiceEmailTrigger } from "@/actions/triggers/send-invoice-email";
import { Menu } from "./(clean-code)/menu";
import { toast } from "sonner";

export function SalesEmailMenuItem({ salesId }) {
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
                            Invoice Email
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
