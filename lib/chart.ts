import dayjs from "dayjs";
import { toFixed } from "./use-number";

export interface BarChartProps {
    month;
    current;
    previous;
}
export function composeBar(_charts: { year; month; value }[]) {
    let total = 12;
    const charts = _charts; //.splice(-12);
    // const {year,month} = charts[0]
    console.log(charts);
    const date = dayjs();
    let _chart: BarChartProps[] = [];
    console.log(charts);
    // const lastYear =
    for (let i = 0; i < 12; i++) {
        let _d = date.subtract(i, "months");
        const month = _d?.format("M");
        const year = _d?.format("YYYY");
        // console.log([year, month]);
        const lastYear = String(Number(year) - 1);
        _chart.unshift({
            month: _d.format("MMM"),
            current: +toFixed(
                charts.find((v) => v.year == year && v.month == month)?.value ||
                    0
            ),
            previous: +toFixed(
                charts.find((v) => v.year == lastYear && v.month == month)
                    ?.value || 0
            ),
        });
    }
    return _chart;
}
