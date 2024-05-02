"use client";

import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { _deleteDykeItem } from "../../../_action/delete-item";
import { useDykeCtx } from "../../../_hooks/form-context";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import {
    Menu,
    MenuItem,
} from "@/components/_v1/data-table/data-table-row-actions";
import { IDykeItemFormContext } from "../../../_hooks/use-dyke-item";

interface Props {
    item: IDykeItemFormContext;
}
export default function ItemHeader({ item }: Props) {
    const dykeCtx = useDykeCtx();
    const rowIndex = item.rowIndex;
    async function deleteSection() {
        const itemData = item.get.data();
        // console.log(itemData);
        await _deleteDykeItem(itemData?.item?.id);
        dykeCtx.itemArray.remove(item.rowIndex);
    }
    function move(to) {
        dykeCtx.itemArray.move(rowIndex, to);
    }
    return (
        <div className="flex bg-accent p-2 px-4 justify-between">
            <CollapsibleTrigger>
                <Label className="text-base uppercase font-bold">
                    Item {Number(item.rowIndex) + 1}
                </Label>
            </CollapsibleTrigger>
            <div className="flex items-center justify-between space-x-2">
                <Button
                    onClick={deleteSection}
                    className="p-0 h-6 w-6"
                    variant={"destructive"}
                >
                    <Icons.trash className="w-4 h-4" />
                </Button>
                <Menu variant={"ghost"}>
                    <MenuItem
                        disabled
                        SubMenu={
                            <div className="grid grid-cols-5 gap-1">
                                {Array(dykeCtx.itemArray.fields.length)
                                    .fill(null)
                                    .map((_, pos) => (
                                        <MenuItem
                                            key={pos}
                                            className="w-10 inline-flex justify-center"
                                            disabled={pos == rowIndex}
                                            onClick={() => move(pos)}
                                        >
                                            <span className="">{pos + 1}</span>
                                        </MenuItem>
                                    ))}
                            </div>
                        }
                        Icon={Icons.move2}
                    >
                        Move To
                    </MenuItem>
                </Menu>
            </div>
        </div>
    );
}