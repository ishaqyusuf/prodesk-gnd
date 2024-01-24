export function getBadgeColor(status: string | null) {
    let color: Colors | undefined = status
        ? StatusColorMap[(status?.toLowerCase() || "").replace(" ", "_")]
        : "slate";
    if (!color) color = "slate";
    return `bg-${color}-500 hover:bg-${color}-600`;
}

let StatusColorMap: { [key: string]: Colors } = {
    queued: "orange",
    completed: "green",
    available: "green",
    started: "blue",
    scheduled: "blue",
    incomplete: "orange",
    pickup: "fuchsia",
    unknown: "orange",
    late: "red",
    in_transit: "fuchsia",
    assigned: "fuchsia",
    order_placed: "sky",
    delivery: "emerald",
    arrived_warehouse: "emerald",
    item_not_available: "orange",
    payment_cancelled: "orange",
    prod_queued: "orange",
    install: "purple",
    deco: "orange",
    punchout: "emerald",
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
