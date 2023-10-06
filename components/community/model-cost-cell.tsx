"use client";

import { ModalName } from "@/store/slicers";
import { ICostChart } from "@/types/community";
import {
    Cell,
    PrimaryCellContent,
    SecondaryCellContent
} from "../columns/base-columns";
import Money from "../money";
import { openModal } from "@/lib/modal";
import { Badge } from "../ui/badge";

interface Props {
    costs: ICostChart[];
    title?;
    modal: ModalName;
    row;
}
export default function ModelCostCell({
    costs,
    title = "Model Cost",
    modal,
    row
}: Props) {
    const cost: ICostChart = costs?.find(c => c.current) as any;

    let money = cost?.meta?.totalCost;
    return (
        <Cell className="cursor-pointer" onClick={() => openModal(modal, row)}>
            {!cost ? (
                <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200">
                    Set Cost
                </Badge>
            ) : (
                <>
                    <PrimaryCellContent>
                        <Money value={money} />
                    </PrimaryCellContent>
                    <SecondaryCellContent>
                        {row?.original?.costs?.length} cost history
                    </SecondaryCellContent>
                </>
            )}
        </Cell>
    );
}
