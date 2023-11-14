import PageHeader from "@/components/page-header";
import { ISalesOrder } from "@/types/sales";

interface Props {
    form;
    order: ISalesOrder;
}
export default function OrderInspection({ form, order }: Props) {
    return (
        <div>
            <PageHeader
                title={order?.orderId}
                subtitle={
                    <div>
                        {order?.shippingAddress?.name}
                        {" | "}
                        {order?.shippingAddress?.address1}
                    </div>
                }
            />
        </div>
    );
}
