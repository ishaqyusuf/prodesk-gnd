export function getBadgeColor(status: string | null) {
  let color: Colors | undefined = status
    ? StatusColorMap[status?.toLowerCase() || ""]
    : "slate";
  if (!color) color = "slate";
  return `bg-${color}-500 hover:bg-${color}-600`;
}

let StatusColorMap: { [key: string]: Colors } = {
  queued: "orange",
  completed: "green",
  started: "blue",
  scheduled: "blue",
  incomplete: "orange",
  late: "red",
};

export type Colors =
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose"
  | "lightBlue"
  | "warmGray"
  | "trueGray"
  | "coolGray"
  | "blueGray";
