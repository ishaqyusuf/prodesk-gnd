import { getSalesBookFormUseCase } from "@/app/(clean-code)/(sales)/_common/use-case/sales-book-form-use-case";
import FPage from "@/components/(clean-code)/fikr-ui/f-page";
import { FormClient } from "../../_components/form-client";
import { prisma } from "@/db";

export default async function EditQuotePage({ params, searchParams }) {
    const s = await prisma.salesOrders.findFirst({
        where: {
            deletedAt: {},
            orderId: {
                contains: "quo-241226-008",
            },
        },
    });

    // console.log(s);
    const data = await getSalesBookFormUseCase({
        type: "quote",
        slug: params.slug,
        ...searchParams,
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
