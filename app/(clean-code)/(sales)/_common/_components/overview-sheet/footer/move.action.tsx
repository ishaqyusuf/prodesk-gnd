import { SalesType } from "@/app/(clean-code)/(sales)/types";
import { useSalesOverview } from "../overview-provider";
import { Menu } from "@/components/(clean-code)/menu";
import { Move } from "lucide-react";
import { moveOrderUseCase } from "../../../use-case/sales-book-form-use-case";
import { toast } from "sonner";

export function MoveAction({}) {
    const ctx = useSalesOverview();
    const type = ctx.item.type;
    async function moveSales() {
        const to = type == "order" ? "quote" : "order";
        await moveOrderUseCase(ctx.item.orderId, to);
        toast.success("Success");
    }
    return (
        <Menu.Item onClick={moveSales} Icon={Move}>
            {type == "order" ? "Move to Quote" : "Move to Sales"}
        </Menu.Item>
    );
}
