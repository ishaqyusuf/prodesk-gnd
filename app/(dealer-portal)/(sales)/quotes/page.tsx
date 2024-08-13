import FPage from "@/app/_components/fikr-ui/f-page";
import ClientPage from "../_components/client-page";
import { getDealerSales } from "../_components/action";

export default async function DealersQuotePage({ searchParams }) {
    const resp = getDealerSales(searchParams, "quote");
    return (
        <FPage>
            <ClientPage quote promise={resp} />
        </FPage>
    );
}
