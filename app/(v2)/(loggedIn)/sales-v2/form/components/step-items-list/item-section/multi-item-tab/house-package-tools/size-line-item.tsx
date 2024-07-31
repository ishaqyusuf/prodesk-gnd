import { TableCell, TableRow } from "@/components/ui/table";
import ControlledInput from "@/components/common/controls/controlled-input";
import { cn, inToFt, sum } from "@/lib/utils";
import Money from "@/components/_v1/money";
import ControlledSelect from "@/components/common/controls/controlled-select";
import ItemPriceFinder from "../../item-price-finder";
import {
    useMultiComponentItem,
    useMultiComponentSizeRow,
} from "../../../../../_hooks/use-multi-component-item";
import { SizeForm } from "../../../../modals/select-door-heights";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DevOnly from "@/_v2/components/common/dev-only";

interface Props {
    size: SizeForm[string];
    componentItem: ReturnType<typeof useMultiComponentItem>;
}
export default function HousePackageSizeLineItem({
    size,
    componentItem,
}: Props) {
    const sizeRow = useMultiComponentSizeRow(componentItem, size);
    const { form, prices, doorConfig } = componentItem;
    const itemData = componentItem.item.get.data();

    // const component =
    // itemData.multiComponent.components[componentItem.componentTitle];
    // const doorForm = component?._doorForm?.[size.dim];
    const hpt = itemData.item?.housePackageTool;
    // console.log(component?._doorForm);
    // component.too
    return (
        <TableRow>
            <TableCell>{size.dimFt}</TableCell>
            {componentItem.isComponent.hasSwing && (
                <TableCell className="h-[180px]">
                    <ControlledSelect
                        size="sm"
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
                    size="sm"
                    control={form.control}
                    name={`${sizeRow.keys.lhQty}` as any}
                />
            </TableCell>
            {!componentItem.isComponent.multiHandles ? (
                <></>
            ) : (
                <>
                    <TableCell>
                        <ControlledInput
                            size="sm"
                            type="number"
                            list
                            control={form.control}
                            name={`${sizeRow.keys.rhQty}` as any}
                        />
                    </TableCell>
                </>
            )}
            {/* <TableCell>{size.dimFt?.replaceAll("in", '"')}</TableCell> */}
            {componentItem.calculatedPriceMode ? (
                <>
                    <TableCell className="hidden lg:table-cell">
                        <DevOnly>{sizeRow.overridePrice || "-"}</DevOnly>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <Money
                                        value={
                                            sizeRow.overridePrice
                                                ? sizeRow.overridePrice
                                                : sum([
                                                      sizeRow.jambSizePrice,
                                                      sizeRow.componentsTotal,
                                                  ])
                                        }
                                    />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">
                                            Price Breakdown
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Price breakdown based on selected
                                            components
                                        </p>
                                    </div>
                                    <div className="grid gap-2">
                                        {itemData.item.formStepArray
                                            .filter((a) => a.item.price)
                                            .map((a) => (
                                                <div key={a.step.id}>
                                                    <div className="grid grid-cols-2 items-center gap-4">
                                                        <Label htmlFor="maxWidth">
                                                            {a.step.title}
                                                        </Label>
                                                        <div className="text-left">
                                                            <Money
                                                                value={
                                                                    a.item.price
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        {/* <ControlledInput
                                            control={form.control}
                                            label={"Edit Price"}
                                            type="number"
                                            name={
                                                sizeRow.keys
                                                    .overridePrice as any
                                            }
                                        /> */}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </TableCell>
                </>
            ) : (
                <></>
            )}
            <TableCell className="">
                <div className="flex max-w-[300px] flex-col justify-center items-stretch divide-y">
                    <div className="flex pt-1 justify-between">
                        {prices.map((p) => (
                            <div className="flex-1" key={p.title}>
                                <div className="mx-1">
                                    <ControlledInput
                                        size="sm"
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
                <Money value={sizeRow.lineTotal} />
            </TableCell>
            <TableCell></TableCell>
        </TableRow>
    );
}
