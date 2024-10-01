import _dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import relativeTime from "dayjs/plugin/relativeTime";
export const dayjs = _dayjs; //.extend(updateLocale);
dayjs.extend(updateLocale);
dayjs.extend(relativeTime);
// dayjs.updateLocale("en", {
//     relativeTime: {
//         past: "%s ago",
//     },
// });

export type DateFormats =
    | "DD/MM/YY"
    | "MM/DD/YY"
    | "YYYY-MM-DD"
    | "MMM DD, YYYY"
    | "YYYY-MM-DD HH:mm:ss"
    | "YYYY-MM-DD HH:mm"
    | any;
export function formatDate(date, format: DateFormats = "MM/DD/YY") {
    if (!date) return date;
    return dayjs(date).format(format);
}
export function timeAgo(date, format: DateFormats = "MM/DD/YY") {
    const d = dayjs(date);
    const tAgo = d.fromNow();
    if (tAgo == "a day ago") return "yesterday";
    if (dayjs().diff(d, "days") > 1) return formatDate(date, format);
    return tAgo;
}
