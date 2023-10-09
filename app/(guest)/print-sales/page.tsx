import OrderPrinter from "@/components/print/order/order-printer";

export default async function PrintSalesPage({ searchParams }) {
    console.log(searchParams);
    return (
        <OrderPrinter
            {...searchParams}
            id={searchParams?.id?.split(",").map(n => Number(n))}
        />
    );
}
