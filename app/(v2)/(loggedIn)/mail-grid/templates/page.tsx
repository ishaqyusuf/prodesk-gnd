import FPage from "@/app/(clean-code)/_common/components/fikr-ui/f-page";
import ClientPage from "./client-page";
import { getMailGridAction } from "./actions";

export default async function MailGridPage() {
    const p = getMailGridAction();

    return (
        <FPage title="Mail Templates" roles={["Admin"]}>
            <ClientPage response={p} />
        </FPage>
    );
}
