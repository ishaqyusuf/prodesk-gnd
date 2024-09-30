import { FPageTabs } from "@/app/(clean-code)/_common/components/fikr-ui/f-page-tabs";
import { getSalesTabActionUseCase } from "../use-case/sales-book-tabs";

export default async function PagesTab() {
    const tabs = getSalesTabActionUseCase();
    return <FPageTabs port promise={tabs} />;
}
