import { TableCell, TableRow } from "@/components/ui/table";
import ControlledInput from "@/components/common/controls/controlled-input";
import { cn } from "@/lib/utils";
import Money from "@/components/_v1/money";
import ControlledSelect from "@/components/common/controls/controlled-select";
import ItemPriceFinder from "../../item-price-finder";
import {
    useMultiComponentItem,
    useMultiComponentSizeRow,
} from "../../../../../_hooks/use-multi-component-item";

interface Props {
    size: { dim; width };
    componentItem: ReturnType<typeof useMultiComponentItem>;
}
export default function HousePackageSizeLineItem({
    size,
    componentItem,
}: Props) {
    const sizeRow = useMultiComponentSizeRow(componentItem, size);
    const { form, prices, doorConfig } = componentItem;
    const itemData = componentItem.item.get.data();

    const component =
        itemData.multiComponent.components[componentItem.componentTitle];
    // const doorForm = component?._doorForm?.[size.dim];
    const hpt = itemData.item?.housePackageTool;
    // console.log(component?._doorForm);
    // component.too
    return (
        <TableRow>
            <TableCell>{size.width}</TableCell>
            {componentItem.isComponent.garage && (
                <TableCell className="h-[180px]">
                    <ControlledSelect
                        options={["In Swing", "Out Swing"]}
                        control={form.control}
                        name={`${sizeRow.keys.swing}` as any}
                    />
                </TableCell>
            )}
            <TableCell>
                <ControlledInput
                    type="number"
                    list
                    control={form.control}
                    name={`${sizeRow.keys.lhQty}` as any}
                />
            </TableCell>
            {doorConfig.singleHandle ? (
                <></>
            ) : (
                <>
                    <TableCell>
                        <ControlledInput
                            type="number"
                            list
                            control={form.control}
                            name={`${sizeRow.keys.rhQty}` as any}
                        />
                    </TableCell>
                </>
            )}
            <TableCell>{size.dim?.replaceAll("in", '"')}</TableCell>
            <TableCell className="">
                <div className="flex max-w-[300px] flex-col justify-center items-stretch divide-y">
                    <div className="flex pt-1 justify-between">
                        {prices.map((p) => (
                            <div className="flex-1" key={p.title}>
                                <div className="mx-1">
                                    <ControlledInput
                                        type="number"
                                        className={cn(
                                            prices.length == 1 && "w-[80px]"
                                        )}
                                        control={form.control}
                                        name={
                                            `${
                                                sizeRow.keys[p.key as any]
                                            }` as any
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
                <Money value={sizeRow.unitPrice} />
            </TableCell>
            <TableCell className="hidden lg:table-cell">
                <Money value={sizeRow.lineTotal} />
            </TableCell>
            <TableCell>
                <ItemPriceFinder
                    dykeDoorId={component?.toolId}
                    casingId={hpt.casingId}
                    dimension={size.dim}
                    jambSizeId={hpt.jambSizeId}
                    componentItem={componentItem}
                    sizeRow={sizeRow}
                />
            </TableCell>
        </TableRow>
    );
}
