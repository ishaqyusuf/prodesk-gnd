import { Metadata } from "next";
import { SalesQueryParams, getSalesAction } from "../_actions/get-sales-action";

export const metadata: Metadata = {
    title: "Sales",
};
interface Props {
    searchParams: SalesQueryParams;
    params: { type: "orders" | "productions" | "estimates" };
}
export default async function SalesPage({ searchParams, params }: Props) {
    let type = params.type;
    const promise = getSalesAction({
        ...searchParams,
        type: type as any,
    });
}
