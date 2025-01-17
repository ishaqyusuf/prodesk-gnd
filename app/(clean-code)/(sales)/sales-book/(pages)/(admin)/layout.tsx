import AuthGuard from "@/app/(v2)/(loggedIn)/_components/auth-guard";
import PagesTab from "../_components/pages-tab";

export default async function Layout({ children }) {
    return (
        <>
            <PagesTab />
            {children}
        </>
    );
}
