import { Menu } from "../../_common/components/menu";
import { salesStatisticsAction } from "./sales-stat.action";

export default function SalesStat({}) {
    async function _salesStatistics() {
        const resp = await salesStatisticsAction();
        console.log(resp);
    }
    return (
        <>
            <Menu.Item onClick={_salesStatistics}>Sales Statistics</Menu.Item>
        </>
    );
}
