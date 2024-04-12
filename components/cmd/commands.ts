import { Icons } from "../_v1/icons";

export default function useCommands() {
    const list = commands;

    return {
        commands,
    };
}

function _new(title, link, Icon, shortCut: any = null) {
    return {
        title,
        link,
        Icon,
        shortCut,
    };
}
const commands = [
    _new("Orders", "/sales/orders", Icons.orders, "O"),
    _new("New Order", "/sales/edit/order/new", Icons.orders),
    _new("Estimates", "/sales/estimates", Icons.estimates),
    _new("New Estimates", "/sales/edit/order/new", Icons.estimates),
];
