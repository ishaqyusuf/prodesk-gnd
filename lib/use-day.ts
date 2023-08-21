import dayjs from "dayjs";

export type DateFormats = "DD/MM/YY" | "MM/DD/YY" | "YYYY-MM-DD" | any;
export function formatDate(date, format: DateFormats = "MM/DD/YY") {
  if (!date) return date;
  return dayjs(date).format(format);
}
