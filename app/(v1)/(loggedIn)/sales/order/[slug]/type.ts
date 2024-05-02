import { getOrderAction } from "@/app/(v1)/_actions/sales/sales";
import { ServerPromiseType } from "@/types";

export type SalesOverview = ServerPromiseType<
    typeof getOrderAction
>["Response"];
