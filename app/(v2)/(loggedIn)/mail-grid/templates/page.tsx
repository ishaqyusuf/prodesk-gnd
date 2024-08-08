import FPage from "@/app/_components/fikr-ui/f-page";
import AuthGuard from "../../_components/auth-guard";

export default async function MailGridPage() {
    return <FPage title="Mail Templates" roles={["Admin"]}></FPage>;
}
