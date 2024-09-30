import { ContentLayout } from "@/app/(clean-code)/_common/components/content-layout";
import { getSalesOrderListUseCase } from "../../../_common/use-case/sales-list-use-case";
import PagesTab from "../../../_common/_components/pages-tab";

export default async function SalesBookPage({ searchParams }) {
    const promise = getSalesOrderListUseCase(searchParams);
    return <></>;
}
