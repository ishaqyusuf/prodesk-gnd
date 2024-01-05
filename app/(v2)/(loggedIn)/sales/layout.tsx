import OrderPrinter from "@/components/_v1/print/order/order-printer";

export default function SalesLayout({ children }) {
    return (
        <>
            {children}
            <OrderPrinter />
        </>
    );
}
