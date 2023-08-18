import dayjs from "dayjs";
export function formatDate(
  date,
  format: "DD/MM/YY" | "MM/DD/YY" | "YYYY-MM-DD" | any = "MM/DD/YY"
) {
  if (!date) return date;
  return dayjs(date).format(format);
}
