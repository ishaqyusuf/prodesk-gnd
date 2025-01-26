import { ContentLayout } from "../../../components/(clean-code)/content-layout";
import SidebarLayout from "../../../components/(clean-code)/side-bar-layout";
import BackwardCompat from "./_backward-compat";

export default function Layout({ children }) {
    return (
        <SidebarLayout>
            <ContentLayout>
                <BackwardCompat />
                {children}
            </ContentLayout>
        </SidebarLayout>
    );
}
