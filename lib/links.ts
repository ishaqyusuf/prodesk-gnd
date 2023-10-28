type ILinkName =
    | "orders"
    | "estimates"
    | "order"
    | "estimate"
    | "order-form"
    | "estimate-form";
export function links(name: ILinkName, ...args) {
    let href = {
        orders: "/sales/orders",
        estimates: "/sales/estimates"
    }[name];
    if (!href)
        switch (name) {
            case "estimate":
                href = "/sales/estimate/" + args?.[0];
                break;
        }
    return href;
}
