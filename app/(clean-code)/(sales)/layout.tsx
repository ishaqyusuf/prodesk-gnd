import { ContentLayout } from "../_common/components/content-layout";
import SidebarLayout from "../_common/components/side-bar-layout";

export default function Layout({ children }) {
    return (
        <SidebarLayout>
            <ContentLayout>{children}</ContentLayout>
        </SidebarLayout>
    );
}
