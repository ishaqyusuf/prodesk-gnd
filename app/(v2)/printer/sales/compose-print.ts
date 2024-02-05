import {
    AddressBooks,
    DykeSalesDoors,
    DykeSalesShelfItem,
} from "@prisma/client";
import { IAddressMeta } from "@/types/sales";
import { formatDate } from "@/lib/use-day";
import { formatMoney } from "@/lib/use-number";
import {
    ViewSaleType,
    composeSalesItems,
} from "../../(loggedIn)/sales-v2/_utils/compose-sales-items";
import { SalesPrintProps } from "./page";
import { formatCurrency } from "@/lib/utils";
import { PrintTextProps } from "../components/print-text";

type PrintData = { order: ViewSaleType } & ReturnType<typeof composeSalesItems>;

type PrintStyles = "base" | "lg-bold";
export function composePrint(
    data: PrintData,
    query: SalesPrintProps["searchParams"]
) {
    const printData = {
        isEstimate: query.mode == "estimate",
        isProd: query.mode == "production",
        isPacking: query.mode == "packing list",
        isOrder: query.mode != "estimate",
        ...query,
        // address: address(data,this.isOrder),
        // heading: heading(data,),
        ...data,
    };
    return {
        ...printData,
        lineItems: lineItems(data, {
            ...printData,
        }),
        footer: printFooter(data, printData.isProd || printData.isPacking),
        address: address({ ...printData.order }),
        heading: heading({ ...printData }),
        doorsTable: getDoorsTable({ ...printData }, data),
        shelfItemsTable: shelfItemsTable(printData, data),
    };
}
function shelfItemsTable(
    { isProd, isPacking, isOrder, isEstimate },
    data: PrintData
) {
    const price = !isProd && !isPacking;
    // keyof DykeSalesDoors
    type T = keyof DykeSalesShelfItem;
    const res = {
        cells: [
            _cell<T>(
                "#",
                null,
                1,
                { position: "center" },
                { position: "center" }
            ),
            _cell<T>(
                "Item",
                "description",
                price ? 7 : isPacking ? 11 : 14,
                { position: "left" },
                { position: "left" }
            ),
            _cell<T>(
                "Qty",
                "qty",
                2,
                { position: "center" },
                { position: "center" }
            ),
        ],
    };
    if (price)
        res.cells.push(
            ...[
                _cell<T>(
                    "Rate",
                    "unitPrice",
                    3,
                    { position: "right" },
                    { position: "right" }
                ),
                _cell<T>(
                    "Total",
                    "totalPrice",
                    3,
                    { position: "right" },
                    { position: "right", font: "bold" }
                ),
            ]
        );
    if (isPacking) res.cells.push(_cell<T>("Packed Qty", null, 3));
    const dt = {
        ...res,
        items: data.shelfItems.map((item, itemIndex) => {
            return res.cells.map((cell, _i) => {
                const ret = {
                    style: cell.cellStyle,
                    value:
                        _i == 0
                            ? itemIndex + 1
                            : cell.cell == "description"
                            ? item.description || item.shelfProduct?.title
                            : item?.[cell.cell as any],
                    colSpan: cell.colSpan,
                };
                if (_i > 2 && ret.value)
                    ret.value = formatCurrency.format(ret.value);
                return ret;
            });
        }),
    };
    if (!dt.items.length) return null;
    return dt;
}
function _cell<T>(
    title,
    cell: T | null,
    colSpan = 2,
    style?: PrintTextProps,
    cellStyle?: PrintTextProps
) {
    return { title, cell, colSpan, style, cellStyle };
}
function getDoorsTable(
    { isProd, isPacking, isOrder, isEstimate },
    data: PrintData
) {
    const price = !isProd && !isPacking;
    type T = keyof DykeSalesDoors;
    const res = {
        cells: [
            _cell("#", null, 1, { position: "center" }, { position: "center" }),
            _cell(
                "Dimension",
                "dimension",
                price ? 6 : isPacking ? 9 : 12,
                { position: "left" },
                { position: "left" }
            ),
            _cell(
                "Left Hand",
                "lhQty",
                2,
                { position: "center" },
                { position: "center" }
            ),
            _cell(
                "Right Hand",
                "rhQty",
                2,
                { position: "center" },
                { position: "center" }
            ),
        ],
    };
    if (price) {
        res.cells.push(
            ...[
                _cell(
                    "Rate",
                    "unitPrice",
                    3,
                    { position: "right" },
                    { position: "right" }
                ),
                _cell(
                    "Total",
                    "lineTotal",
                    3,
                    { position: "right" },
                    { position: "right", font: "bold" }
                ),
            ]
        );
    }
    if (isPacking) res.cells.push(_cell("Packed Qty", null, 3));
    const dt = {
        ...res,
        doors: data.order.items
            .filter((item) => item.housePackageTool)
            .map((item) => {
                return {
                    doorType: item.housePackageTool?.doorType,
                    details: item.formSteps,
                    lines: item.housePackageTool?.doors.map((door, i) => {
                        return res.cells.map((cell, _i) => {
                            const ret = {
                                style: cell.cellStyle,
                                colSpan: cell.colSpan,
                                value: door[cell.cell as any],
                            };
                            if (_i == 0) ret.value = i + 1;
                            if (_i > 3 && ret.value) {
                                ret.value = formatCurrency.format(ret.value);
                            }
                            return ret;
                        });
                    }),
                };
            }),
    };
    if (dt.doors.length) return dt;
    return null;
}

function lineItems(data: PrintData, { isProd, isPacking }) {
    const lineItems = data.order.items.filter(
        (item) => !item.housePackageTool || !item.shelfItems
    );
    const maxIndex = Math.max(
        ...lineItems.map((item) => item.meta.uid).filter((d) => d > -1)
    );
    const totalLines = maxIndex ? maxIndex + 1 : lineItems?.length;
    if (totalLines < 0) return null;
    const heading = [
        header("#", 1),
        header("Description", 8),
        header("Swing", 2),
        header("Qty", 1),
    ];
    const noInvoice = isProd || isPacking;
    if (isPacking) heading.push(header("Packed Qty", 1));
    if (!noInvoice) heading.push(...[header("Rate", 2), header("Total", 2)]);
    let sn = 0;
    const lines = Array(totalLines)
        .fill(null)
        .map((_, index) => {
            const item = lineItems.find((item) => item.meta.uid == index);
            if (!item) return { cells: [] };

            const cells = [
                styled(item.rate ? `${++sn}.` : "", null, {
                    font: "bold",
                    colSpan: "1",
                    position: "center",
                }),
                styled(item.description, null, {
                    font: "bold",
                    bg: !item.rate ? "shade" : "default",
                    position: !item.rate ? "center" : "default",
                    text: "uppercase",
                    colSpan: "8",
                }),
                styled(item.swing, null, {
                    font: "bold",
                    position: "center",
                    text: "uppercase",
                    colSpan: "2",
                }),
                styled(item.qty, null, {
                    font: "bold",
                    position: "center",
                    colSpan: "1",
                }),
            ];
            if (!noInvoice)
                cells.push(
                    ...[
                        styled(
                            item.total
                                ? formatCurrency.format(item.rate || 0)
                                : null,
                            null,
                            {
                                position: "right",
                                colSpan: "2",
                            }
                        ),
                        styled(
                            !item.total
                                ? null
                                : formatCurrency.format(item.total || 0),
                            null,
                            {
                                font: "bold",
                                position: "right",
                                colSpan: "2",
                            }
                        ),
                    ]
                );
            return {
                id: item.id,
                total: item.total,
                colSpan: heading
                    .map((h) => h.colSpan)
                    .reduce((a, b) => a + b, 0),
                cells,
            };
        });
    if (lines.length)
        return {
            lines,
            heading,
        };
    return null;
}
function header(title, colSpan = 1) {
    return { title, colSpan };
}
function printFooter(data: PrintData, notPrintable) {
    if (notPrintable) return null;
    return {
        lines: [
            styled(
                "Subtotal",
                formatCurrency.format(data.order.subTotal || 0),
                {
                    font: "bold",
                }
            ),
            styled(
                `Tax (${data.order.taxPercentage}%)`,
                formatCurrency.format(data.order.tax || 0),
                {
                    font: "bold",
                }
            ),
            styled(
                "Labor",
                formatCurrency.format(data.order.meta?.labor_cost || 0),
                {
                    font: "bold",
                }
            ),
            styled("Total", formatCurrency.format(data.order.grandTotal || 0), {
                font: "bold",
                size: "base",
            }),
        ],
    };
}

function heading({ mode, isOrder, order, isEstimate }) {
    let h = {
        title: mode,
        lines: [
            styled(isOrder ? "Order #" : "Estimate #", order.orderId, {
                font: "bold",
                size: "lg",
            }),
            styled(
                isOrder ? "Order Date" : "Estimate Date",
                formatDate(order.createdAt)
            ),
            styled("Rep", order.salesRep?.name),
        ],
    };
    if (isEstimate) {
        styled(
            "Good Until",
            order.goodUntil ? formatDate(order.goodUntil) : "-"
        );
    } else {
        h.lines.push(
            styled(
                "Invoice Status",
                (order.amountDue || 0) > 0 ? "Pending" : "Paid",
                {
                    size: "base",
                    font: "bold",
                    text: "uppercase",
                }
            )
        );
        h.lines.push(
            styled("Amount Due", formatCurrency.format(order?.amountDue), {
                size: "base",
                font: "bold",
            })
        );
    }
    return h;
}
function styled(title, value?, style?: PrintTextProps) {
    return {
        title,
        value,
        style: style || {},
    };
}
function address({ type, customer, billingAddress, shippingAddress }) {
    // const { estimate, order } = data;
    const estimate = type == "estimate";
    return [
        addressLine(
            estimate ? "Customer" : "Sold To",
            customer?.businessName,
            billingAddress as any
        ),
        !estimate
            ? addressLine(
                  "Ship To",
                  customer?.businessName,
                  shippingAddress as any
              )
            : null,
    ].filter(Boolean);
}
function addressLine(
    title,
    businessName,
    address: AddressBooks & { meta: IAddressMeta }
) {
    return {
        title,
        lines: [
            businessName || address?.name,
            `${address?.phoneNo} ${
                address?.phoneNo2 ? `(${address?.phoneNo2})` : ""
            }`,
            address?.email,
            address?.address1,
            [address?.city, address?.state, address?.meta?.zip_code]
                ?.filter(Boolean)
                ?.join(" "),
        ],
    };
}
