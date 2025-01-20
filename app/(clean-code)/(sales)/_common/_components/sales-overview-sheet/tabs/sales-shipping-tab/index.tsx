import { salesOverviewStore } from "../../store";

export function SalesShippingTab({}) {
    const store = salesOverviewStore();
    const shipping = store.shipping;
    if (!shipping) return null;
    return <div></div>;
}
