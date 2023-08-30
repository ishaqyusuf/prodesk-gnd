"use client";

import Money from "@/components/money";
import { useAppSelector } from "@/store";
import { ISalesOrder } from "@/types/sales";
import { useEffect, useState } from "react";

interface Props {
  order: ISalesOrder;
}
export function OrderPrintFooter({ order }: Props) {
  const po = useAppSelector((state) => state.slicers.printOrders);
  const isClient = !["production", "packing list"].includes(po?.mode);

  const [footer, setFooter] = useState<
    {
      title;
      value?;
    }[]
  >([]);
  useEffect(() => {
    if (isClient) {
      const ccc = order?.meta?.ccc;
      const totalPaid = order?.payments
        ?.map((p) => p.amount)
        .reduce((sum, p) => sum + p, 0);
      const paymentMethod = order?.payments?.map((p) => p.meta?.paymentOption);
      setFooter(
        [
          { title: "Subtotal", value: order?.subTotal },
          { title: `Tax (${order?.taxPercentage})`, value: order?.tax },
          { title: "Labor", value: (order?.meta?.labor_cost || 0)?.toFixed(2) },
          ccc && { title: `C.C.C ${order?.meta?.ccc_percentage}%`, value: ccc },
          totalPaid && {
            title: "Payments/Credits",
            value: `-$${totalPaid}`,
          },
          { title: "Total", value: `$${order?.grandTotal}` },
        ].filter(Boolean)
      );
    }
  }, [isClient, order]);
  if (!isClient) return null;
  return (
    <tfoot id="footer" className="">
      <tr className={`text-right font-bold ${!isClient ? "hidden" : ""}`}>
        <td colSpan={9} valign="top" className={`border border-gray-400`}>
          <p className="mb-2 text-left text-xs font-normal italic text-red-600">
            Note: Payments made with Cards will have an additional 3% charge to
            cover credit cards merchants fees.
          </p>
          <div className="p-1">
            <div>
              {[
                "1) NO RETURN ON SPECIAL ORDER",
                "2) NO DAMAGED ORDER MAY BE EXCHANGE OR RETURN",
                "3) ONCE SIGN THERE IS NO RETURN OR EXCHANGE.",
              ].map((i, index) => (
                <p className="text-left text-xs text-red-600" key={index}>
                  {i}
                </p>
              ))}
            </div>
          </div>
        </td>
        <td className="relative" colSpan={6}>
          <div>
            <table className="h-full w-full">
              {footer.map((line, index) => (
                <tr className="border border-gray-400" key={index}>
                  <td className="bg-slate-200" align="left" colSpan={4}>
                    <p className="whitespace-nowrap px-1 py-1">{line.title}</p>
                  </td>
                  <td className="" colSpan={2}>
                    <Money
                      value={line.value}
                      className="whitespace-nowrap px-1"
                    />
                  </td>
                </tr>
              ))}
            </table>
          </div>
        </td>
      </tr>
    </tfoot>
  );
}
