import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import AuthGuard from "../../_components/auth-guard";
import FPage from "@/app/_components/fikr-ui/f-page";
import PageClient from "./page-client";
import { getDealersAction } from "./action";
import PageTabsServer from "./page-tabs-server";

export default async function DealersPage({ searchParams }) {
    const resp = getDealersAction(searchParams);

    return (
        <FPage title="Dealers">
            <PageTabsServer />
            <PageClient response={resp} />
        </FPage>
    );
}
