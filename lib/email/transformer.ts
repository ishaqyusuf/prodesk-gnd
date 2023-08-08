import { SalesOrderEmailData } from "@/types/email-data";
import { ISalesOrder } from "@/types/sales";

export function transformSalesData(data: ISalesOrder) {
  const {
    grandTotal,
    orderId,
    amountDue,
    builtQty,
    prodQty,
    prodStatus,
    meta: { qb },
  } = data;

  // const tData: SalesOrderEmailData  = {
  //     amountPaid
  // }
}
