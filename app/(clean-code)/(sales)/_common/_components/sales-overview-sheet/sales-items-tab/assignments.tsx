import { getOpenItem } from "../helper";

export function ItemAssignments({}) {
    const itemView = getOpenItem();
    if (!itemView.produceable) return null;
    return <div></div>;
}
