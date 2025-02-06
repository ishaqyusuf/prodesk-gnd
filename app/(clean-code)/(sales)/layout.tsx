import UserAccountUpdateRequiredModal from "@/components/modals/user-account-update-required-modal";
import { ContentLayout } from "../../../components/(clean-code)/content-layout";
import SidebarLayout from "../../../components/(clean-code)/side-bar-layout";
import BackwardCompat from "./_backward-compat";
import { CustomerOverviewSheet } from "@/components/sheets/customer-overview-sheet";

export default function Layout({ children }) {
    return (
        <SidebarLayout>
            <ContentLayout>
                <BackwardCompat />
                {children}
            </ContentLayout>
            <CustomerOverviewSheet />
        </SidebarLayout>
    );
}
