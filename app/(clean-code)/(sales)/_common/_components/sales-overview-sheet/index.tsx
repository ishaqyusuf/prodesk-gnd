import { _modal } from "@/components/common/modal/provider";
import { salesOverviewStore } from "./store";

interface OpenSalesOverviewProps {
    salesUID;
}
export function openSalesOverview(props: OpenSalesOverviewProps) {
    salesOverviewStore.getState().reset({
        salesUID: props.salesUID,
    });
    _modal.openSheet(<SalesOverviewForm />);
}

interface Props {}
export default function SalesOverviewForm({}: Props) {
    return <div></div>;
}
