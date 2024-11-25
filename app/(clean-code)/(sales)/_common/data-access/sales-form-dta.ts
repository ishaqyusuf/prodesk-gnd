import {
    dealerSession,
    serverSession,
    user,
    userId,
} from "@/app/(v1)/_actions/utils";
import { SalesMeta, SalesType, StepComponentMeta } from "../../types";
import { getLoggedInDealerAccountDta } from "./sales-dealer-dta";
import { prisma } from "@/db";
import { SalesBookFormIncludes } from "../utils/db-utils";
import { transformSalesBookForm } from "./dto/sales-book-form-dto";
import { salesFormData } from "@/app/(v1)/(loggedIn)/sales/_actions/get-sales-form";
import { salesTaxForm } from "./sales-tax.persistent";
import { AsyncFnType } from "@/app/(clean-code)/type";
import dayjs from "dayjs";
import { ComponentPrice } from "@prisma/client";
import { getSalesFormStepByIdDta } from "./sales-form-step-dta";

export interface GetSalesBookFormDataProps {
    type: SalesType;
    slug?: string;
    id?: number;
    restoreMode?: boolean;
    customerId?: number;
}
type GetSalesBookFormDataDta = AsyncFnType<typeof getSalesBookFormDataDta>;
export async function getSalesBookFormDataDta(data: GetSalesBookFormDataProps) {
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
            ...(order as Partial<typeof order>),
            meta: order.meta as any as Partial<SalesMeta>,

            // items: order.items
        },
        stepComponents,
    };
    // return typedSalesBookForm(order)
}
export async function createSalesBookFormDataDta(
    props: GetSalesBookFormDataProps
) {
    const session = await user();
    const ctx = await salesFormData(true);
    const dealer = await getLoggedInDealerAccountDta();
    let goodUntil = ctx.defaultProfile?.goodUntil;
    if (goodUntil && typeof goodUntil != "string")
        goodUntil = dayjs(goodUntil).toISOString();
    const data: Partial<GetSalesBookFormDataDta> = {
        stepComponents: [],
        order: {
            isDyke: true,
            customerId: dealer?.dealerId,
            customerProfileId: ctx.defaultProfile?.id,
            // shippingAddress: {} as any,
            // billingAddress: {}
            status: dealer?.id ? "Evaluating" : "Active",
            taxPercentage: +ctx.settings?.tax_percentage,
            paymentTerm: ctx.defaultProfile?.meta?.net,
            goodUntil,
            meta: {
                sales_percentage: ctx.defaultProfile?.coefficient,
                ccc_percentage: +ctx?.settings?.ccc,
                tax: true,
                calculatedPriceMode: true,
            },
            taxes: [],
            items: [
                {
                    meta: {},
                    formSteps: [(await getSalesFormStepByIdDta(1)) as any],
                    shelfItems: [],
                } as any,
            ],
            salesRep: dealer?.id
                ? ({} as any)
                : {
                      name: session.name,
                      id: session.id,
                  },
            createdAt: dayjs().toISOString() as any,
        },
    };
    return await formatForm(data as any);
}
async function formatForm(data: GetSalesBookFormDataDta) {
    const result = transformSalesBookForm(data);
    const ctx = await salesFormData(true);
    const _taxForm = await salesTaxForm(
        data.order.taxes as any,
        data.order?.id,
        ctx?.defaultProfile?.meta?.taxCode
    );
    return {
        ...result,
        customer: data.order.customer,
        dealerMode: await dealerSession(),
        superAdmin: (await userId()) == 1,
        adminMode: true,
        shippingAddress: data.order.shippingAddress,
        billingAddress: data.order.billingAddress,
        salesProfile: data.order.salesProfile,
        data: ctx,
        _taxForm,
    };
}
export async function getTransformedSalesBookFormDataDta(
    data: GetSalesBookFormDataProps
) {
    const sbf = await getSalesBookFormDataDta(data);
    return await formatForm(sbf);
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
export async function saveSalesComponentPricingDta(
    prices: Partial<ComponentPrice>[],
    orderId
) {
    // console.log(prices);
    return;
    const ids = [];
    const filterPrices = prices.filter((p) => p.qty);
    await Promise.all(
        filterPrices
            .filter((p) => p.qty)
            .map(async (price) => {
                price.salesProfit = price.salesTotalCost - price.baseTotalCost;
                if (!price.type) price.type = "...";
                const s = await prisma.componentPrice.upsert({
                    create: {
                        ...(price as any),
                    },
                    update: {
                        ...price,
                    },
                    where: {
                        id: price.id,
                    },
                });
                ids.push(s.id);
            })
    );
    const res = await prisma.componentPrice.updateMany({
        where: {
            salesId: orderId,
            id: {
                notIn: ids.filter((id) => id > 0),
            },
        },
        data: {
            deletedAt: new Date(),
        },
    });
    console.log(res.count);

    console.log("DONE");
}
