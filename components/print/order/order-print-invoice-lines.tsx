"use client";

import { _useId } from "@/hooks/use-id";
import { useAppSelector } from "@/store";
import { ISalesOrder, ISalesOrderItem } from "@/types/sales";

interface Props {
  order: ISalesOrder;
}
export function OrderPrintInvoiceLines({ order }: Props) {
  const po = useAppSelector((state) => state.slicers.printOrders);
  const isClient = !["production", "packing list"].includes(po?.mode);
  const packingList = po?.mode == "packing list";

  const lineIndex = Math.max(
    ...(order?.items
      ?.map((item) => item?.meta?.line_index || item?.meta?.uid)
      .filter((i) => i > -1) as any)
  );
  const totalLines = lineIndex ? lineIndex + 1 : order?.items?.length;
  let _index = 0;
  const invoiceLines: { sn?; id; line?: ISalesOrderItem | undefined }[] = Array(
    totalLines
  )
    .fill(null)
    .map((_, index) => {
      const item = order?.items?.find((i) => i.meta?.uid == index);
      // const { qty = 0, total = 0 } = item;
      let qty = item?.qty || 0;
      let total = item?.total || 0;
      let sn: number | null = null;
      if (qty > 0 || total > 0) {
        _index++;
        sn = _index;
      }
      return {
        sn,
        id: _useId("inv"),
        line: item,
      };
    });
  invoiceLines.push({
    id: "filler",
  });
  return (
    <>
      <thead id="header">
        <tr>
          <th colSpan={1}>#</th>
          <th className="" colSpan={8}>
            Description
          </th>
          <th className="" colSpan={2}>
            Swing
          </th>
          <th colSpan={1}>Qty</th>
          {packingList && <th colSpan={1}>Packed Qty</th>}
          {isClient && (
            <>
              <th colSpan={2} align="right">
                Rate
              </th>
              <th colSpan={2}>Total</th>
            </>
          )}{" "}
          {!isClient && !packingList && <th colSpan={4}>Supplier</th>}
        </tr>
      </thead>
      <tbody id="invoiceLines">
        {invoiceLines.map(({ id, sn, line }, index) => (
          <tr
            key={index}
            id={id}
            className={`
          ${invoiceLines.length == index + 1 && "border-b border-gray-500"}
          ${id == "fillter" && "hidden"}
          `}
          >
            <td colSpan={1} className="slim ">
              <p className=" text-primary">{sn}</p>
            </td>
            <td colSpan={8}>
              <LineDescription line={line} sn={sn} />
            </td>
            <td colSpan={2} valign="middle">
              <p className="text-center font-semibold">{line?.swing}</p>
            </td>
            <td colSpan={1} align="center" valign="middle">
              <p className="font-bold">{line?.qty}</p>
            </td>
            {isClient && (
              <>
                <td colSpan={2} valign="middle" align="right">
                  {line?.rate && (
                    <p className="pr-2 font-medium">${line?.rate}</p>
                  )}
                </td>
                <td colSpan={2} valign="middle" align="right">
                  {line?.total && (
                    <p className="pr-2 font-medium">${line?.total}</p>
                  )}
                </td>
              </>
            )}
            {!isClient && !packingList && (
              <>
                <td colSpan={4} valign="top" align="right">
                  <p className="pr-2">{line?.meta?.supplier}</p>
                </td>
              </>
            )}
            {packingList && (
              <td colSpan={1} align="center" valign="middle"></td>
            )}
          </tr>
        ))}
      </tbody>
    </>
  );
}
function LineDescription({
  line,
  sn,
}: {
  line: ISalesOrderItem | undefined;
  sn;
}) {
  if (sn == "filler") return <div id="filler" className="min-h-[20px]" />;
  if (!line?.description) return <div className="min-h-[20px]" />;

  return (
    <div className="flex text-sm">
      <div className="flex flex-1 flex-col">
        <div className="font-semibold">
          {!sn && line.description ? (
            <div
              className={`-m-1 min-h-[20px] bg-gray-300 text-center text-primary`}
            >
              {line?.description}
            </div>
          ) : (
            <div className="  min-h-[20px]">{line.description}</div>
          )}
        </div>
        {/* {line?.meta?.components && (
            <div className="ml-6 pl-1">
              {line?.meta?.components.map((c, ic) => (
                <div key={ic}>
                  <span className="font-medium uppercase text-slate-500">
                    {c.type}
                  </span>
                </div>
              ))}
            </div>
          )} */}
      </div>
    </div>
  );
}
