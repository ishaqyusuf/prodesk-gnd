import { getSalesBookFormUseCase } from "@/app/(clean-code)/(sales)/_common/use-case/sales-book-form-use-case";
import FPage from "@/components/(clean-code)/fikr-ui/f-page";
import { FormClient } from "../../_components/form-client";

export default async function EditQuotePage({ params }) {
    const data = await getSalesBookFormUseCase({
        type: "quote",
        slug: params.slug,
    });
    return (
        <FPage
            className=""
            title={`Edit Quote | ${data.order.orderId?.toUpperCase()}`}
        >
            <FormClient data={data} />
        </FPage>
    );
}
