import FPage from "@/components/(clean-code)/fikr-ui/f-page";
import { createSalesBookFormUseCase } from "../../../_common/use-case/sales-book-form-use-case";
import { FormClient } from "../_components/form-client";

export default async function CreateOrderPage({}) {
    const data = await createSalesBookFormUseCase({
        type: "quote",
    });
    return (
        <FPage className="" title="Create Quote">
            <FormClient data={data} />
        </FPage>
    );
}
