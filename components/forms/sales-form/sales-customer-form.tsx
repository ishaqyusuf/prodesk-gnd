import { useEffect, useState } from "react";
import { useAsyncMemo } from "use-async-memo";

interface CustomerDataProps {
    customerId?;
    billingId;
    shippingId;
}
interface CustomerFormData extends CustomerDataProps {}
interface Props extends CustomerDataProps {
    onChange(changeProps: CustomerDataProps);
}
export function SalesCustomerForm(props: Props) {
    const [data, setData] = useState<CustomerFormData>();
    useEffect(() => {}, [props.billingId, props.shippingId, props.customerId]);
    return (
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-16">
            <div className="col-span-2"></div>
        </div>
    );
}
function SelectBilling({ children, onSelect }) {}
function SelectCustomer({ children, onSelect }) {}
