import { IPriority } from "@/types/sales";

export const orderPriorityColorMap: {
  [key in IPriority]: "red" | "yellow" | "orange" | "gray";
} = {
  Low: "yellow",
  High: "red",
  Medium: "orange",
  Non: "gray",
};
export const priorities = ["Non", "Low", "Medium", "High"].map((title) => ({
  title,
  color: orderPriorityColorMap[title],
}));
