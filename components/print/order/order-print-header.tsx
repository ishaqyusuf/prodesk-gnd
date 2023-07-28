"use client";

import { useAppSelector } from "@/store";
import Image from "next/image";
import logo from "@/public/logo.png";
import { formatDate } from "@/lib/use-day";
import Link from "next/link";
import { IAddressBook, ISalesOrder } from "@/types/sales";

interface Props {
  order: ISalesOrder;
}
export function OrderPrintHeader({ order }: Props) {
  const po = useAppSelector((state) => state.slicers.printOrders);

  return (
    <thead id="topHeader">
      <tr>
        <td colSpan={15}>
          <table className="w-full  table-fixed text-xs">
            <tbody>
              <tr>
                <td colSpan={9}>
                  <Link href="/">
                    <Image alt="" width={178} height={80} src={logo} />
                  </Link>
                </td>
                <td colSpan={5}>
                  <div className="text-xs font-semibold text-black-900">
                    <p>13285 SW 131 ST</p>
                    <p>Miami, Fl 33186</p>
                    <p>Phone: 305-278-6555</p>
                    {po?.mode == "production" && <p>Fax: 305-278-2003</p>}
                  </div>
                </td>
                <td colSpan={1}></td>
                <td valign="top" rowSpan={2} colSpan={9}>
                  <div className="flex justify-end"></div>
                  <p className="text-black mb-2 text-end text-xl font-bold capitalize">
                    {po?.mode}
                  </p>
                  <table className="w-full table-fixed">
                    <tbody>
                      <Info1Line
                        label={`${po?.mode == "quote" ? "Quote #" : "Order #"}`}
                        value={
                          <span className="text-sm font-bold">
                            {order.orderId}
                          </span>
                        }
                      />
                      <Info1Line
                        label={`${
                          po?.mode == "quote" ? "Quote Date" : "Order Date"
                        }`}
                        value={formatDate(order.createdAt)}
                      />
                      {po?.mode == "production" && (
                        <Info1Line
                          label="Due Date"
                          value={formatDate(order.prodDueDate) || "-"}
                        />
                      )}
                    </tbody>
                  </table>
                  <table className="text-fixed w-full">
                    <tbody>
                      <InfoLine label="Rep." value={order?.meta?.rep} />
                      <InfoLine
                        label="Good Until."
                        value={order?.meta?.good_until}
                      />
                      {po?.mode == "production" ? (
                        <></>
                      ) : (
                        <>
                          <InfoLine label="P.O No." value={order?.meta?.po} />
                          <InfoLine
                            label="Amount Due"
                            value={
                              <span className="font-medium">
                                {(order?.amountDue || 0) > 0
                                  ? `$${order?.amountDue}`
                                  : "-"}
                              </span>
                            }
                          />
                          <InfoLine
                            label="Invoice Status"
                            value={order?.invoiceStatus}
                          />
                        </>
                      )}
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <Address address={order.billingAddress} title="Sold To" />
                <td colSpan={2} />
                <Address address={order.billingAddress} title="Ship To" />
                <td colSpan={3} />
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </thead>
  );
}
function InfoLine({ label, value }) {
  return (
    <tr className="">
      <td
        className="text-sm font-semibold leading-none  text-black-600"
        align="left"
      >
        {label}
      </td>
      <td
        className="font-black-900  whitespace-nowrap text-sm leading-none"
        align="right"
      >
        <div className="min-h-[16px]">{value}</div>
      </td>
    </tr>
  );
}
function Info1Line({ label, value }) {
  return (
    <tr>
      <td
        className="whitespace-nowrap text-sm font-semibold text-black-600"
        align="left"
      >
        {label}
      </td>
      <td className={`whitespace-nowrap leading-none`} align="right">
        <div className="min-h-[16px]">{value}</div>
      </td>
    </tr>
  );
}
function Address({
  address,
  title,
}: {
  address: IAddressBook | undefined;
  title;
}) {
  return (
    <td colSpan={6}>
      <div className="my-4 border border-gray-400">
        <p className="bg-slate-200 p-0.5 px-1 text-sm  font-bold">{title}</p>
        <div className="flex flex-col p-2">
          {[
            address?.name,
            address?.phoneNo,
            address?.email,
            address?.address1,
            [address?.city, address?.state, address?.meta?.zip_code]
              ?.filter(Boolean)
              ?.join(" "),
          ]
            ?.filter(Boolean)
            ?.map((f, _) => (
              <p
                key={_}
                className="line-clamp-1 text-sm font-medium text-muted-foreground"
              >
                {f}
              </p>
            ))}
        </div>
      </div>
      {/* lines: [name, phone_no, email, address_1, [city, state, zip_code].filter(Boolean).join(' ')].filter(Boolean), */}
    </td>
  );
}
