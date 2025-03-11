import { SalesFormItem } from "../../../types";
import { SaveSalesClass } from "./save-sales-class";

interface Props {
    ctx: SaveSalesClass;
    formItem: SalesFormItem;
}
export function saveShelfHelper({ ctx, formItem, ...props }: Props) {
    const shelf = formItem.shelf;
}
