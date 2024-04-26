import dayjs from "dayjs";
import { toFixed } from "./use-number";

export const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
export interface BarChartProps {
    name;
    total;
}
export function composeBar(_charts: { year; month; value }[]) {
    let total = 12;
    const charts = _charts; //.splice(-12);
    // const {year,month} = charts[0]
    console.log(charts);
    const date = dayjs();
    let _chart: BarChartProps[] = [];
    console.log(charts);

    for (let i = 0; i < 12; i++) {
        let _d = date.subtract(i, "months");
        const month = _d?.format("M");
        const year = _d?.format("YYYY");
        console.log([year, month]);

        _chart.unshift({
            name: _d.format("MMM"),
            total: +toFixed(
                charts.find((v) => v.year == year && v.month == month)?.value ||
                    0
            ),
        });
    }
    return _chart;
}
