import { dealerSession, serverSession } from "@/app/(v1)/_actions/utils";
import { SalesMeta, SalesType, StepComponentMeta } from "../../types";
import { getLoggedInDealerAccountDta } from "./sales-dealer-dta";
import { prisma } from "@/db";
import { SalesBookFormIncludes } from "../utils/db-utils";
import { typedSalesBookForm } from "./dto/sales-book-form-dto";

export interface GetSalesBookFormDataProps {
    type: SalesType;
    slug?: string;
    id?: number;
    restoreMode?: boolean;
}
export async function getSalesBookFormDataDta(data: GetSalesBookFormDataProps) {
    const dealer = await getLoggedInDealerAccountDta();
    // const where = {}
    const order = await prisma.salesOrders.findFirst({
        where: {
            isDyke: true,
            [data.id ? "id" : "slug"]: data.id || data.slug,
        },
        include: SalesBookFormIncludes({}),
    });
    const stepComponents = await getFormStepComponentsDta(
        order.items
            .map((item) => item.formSteps.map((fs) => fs.prodUid))
            .flat()
            .filter(Boolean)
    );
    return {
        order: {
            ...order,
            meta: order.meta as any as Partial<SalesMeta>,
        },
        stepComponents,
    };
    // return typedSalesBookForm(order)
}
export async function getTransformedSalesBookFormDataDta(
    data: GetSalesBookFormDataProps
) {
    return typedSalesBookForm(await getSalesBookFormDataDta(data));
}
export async function getFormStepComponentsDta(uids) {
    const c = await prisma.dykeStepProducts.findMany({
        where: {
            uid: { in: Array.from(new Set(uids)) },
        },
    });
    return c.map((component) => ({
        ...component,
        meta: component.meta as any as StepComponentMeta,
    }));
}
