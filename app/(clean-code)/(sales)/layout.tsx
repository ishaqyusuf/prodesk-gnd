import { ContentLayout } from "../_common/components/content-layout";
import SidebarLayout from "../_common/components/side-bar-layout";
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
