import { salesOverviewStore } from "../../store";

export function SalesShippingForm({}) {
    const store = salesOverviewStore();
    const shipping = store.shipping;
    if (!shipping) return null;
    return <div></div>;
}
