import {
    AddressBooks,
    DykeDoors,
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
import salesFormUtils from "../../(loggedIn)/sales/edit/sales-form-utils";
import { DykeDoorType } from "../../(loggedIn)/sales-v2/type";

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
        isOrder: query.mode == "order",
        ...query,
        // address: address(data,this.isOrder),
        // heading: heading(data,),
        ...data,
    };
    const ret = {
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
    type RetType = NonNullable<typeof ret>;
    // console.log(ret.shelfItemsTable);
    type ShelfType = RetType["shelfItemsTable"];
    let orderedPrinting: {
        _index;
        shelf?: NonNullable<RetType["shelfItemsTable"]>[0];
        nonShelf?: NonNullable<RetType["doorsTable"]>["doors"][0];
    }[] = [];
    ret.doorsTable?.doors.map((d) => {
        orderedPrinting.push({
            _index: d._index,
            nonShelf: d,
        });
    });
    (ret.shelfItemsTable as any)?.map((d) => {
        orderedPrinting.push({
            _index: d._index,
            shelf: d,
        });
    });
    orderedPrinting = orderedPrinting.sort((a, b) => a._index - b._index);

    return {
        ...ret,
        orderedPrinting,
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
    const newResp = data.order.items
        .filter((item) => item.shelfItems.length)
        .map((item) => {
            return {
                item,
                cells: res.cells,
                _index: item.meta.lineIndex,
                _shelfItems: item.shelfItems.map((shelfItem, itemIndex) =>
                    composeShelfItem<typeof res.cells>(
                        res.cells,
                        shelfItem,
                        itemIndex
                    )
                ),
            };
        });
    return newResp;
    const dt = {
        ...res,
        items: data.shelfItems.map((item, itemIndex) => {
            return composeShelfItem<typeof res.cells>(
                res.cells,
                item,
                itemIndex
            );
        }),
    };
    // if (!dt.items.length) return null;
    // return dt;
}
function composeShelfItem<T>(
    cells: T,
    shelfItem,
    itemIndex
): { style; value; colSpan }[] {
    return (cells as any).map((cell, _i) => {
        const ret = {
            style: cell.cellStyle,
            value:
                _i == 0
                    ? itemIndex + 1
                    : cell.cell == "description"
                    ? shelfItem.description || shelfItem.shelfProduct?.title
                    : shelfItem?.[cell.cell as any],
            colSpan: cell.colSpan,
        };
        if (_i > 2 && ret.value) ret.value = formatCurrency.format(ret.value);
        return ret;
    });
}
type Cell =
    | "door"
    | "dimension"
    | "lhQty"
    | "rhQty"
    | "qty"
    | "unitPrice"
    | "lineTotal"
    | "description"
    | "totalPrice"
    | "moulding"
    | null;
function _cell<T>(
    title,
    cell: Cell,
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

    const dt = {
        // ...res,
        doors: data.order.items
            .filter(
                (item) =>
                    item.housePackageTool || item?.meta?.doorType == "Services"
            )
            .filter(
                (item) =>
                    !item.multiDykeUid || (item.multiDykeUid && item.multiDyke)
            )
            .map((item) => {
                const doorType = item.meta.doorType;
                // console.log(doorType);

                const isMoulding = doorType == "Moulding";
                const isBifold = doorType == "Bifold";
                const isSlabs = doorType == "Door Slabs Only";
                const isService = doorType == "Services";
                const res = {
                    cells: [
                        _cell(
                            "#",
                            null,
                            1,
                            { position: "center" },
                            { position: "center" }
                        ),

                        ...(isMoulding
                            ? [
                                  _cell(
                                      "Moulding",
                                      "moulding",
                                      price ? 4 : isPacking ? 7 : 10,
                                      { position: "left" },
                                      { position: "left" }
                                  ),
                                  _cell(
                                      "Qty",
                                      "qty",
                                      2,
                                      { position: "center" },
                                      { position: "center" }
                                  ),
                              ]
                            : [
                                  ...(isService
                                      ? [
                                            _cell(
                                                "Description",
                                                "description",
                                                price ? 4 : isPacking ? 7 : 10,
                                                { position: "left" },
                                                { position: "left" }
                                            ),
                                        ]
                                      : [
                                            _cell(
                                                "Door",
                                                "door",
                                                price ? 4 : isPacking ? 7 : 10,
                                                { position: "left" },
                                                { position: "left" }
                                            ),
                                            _cell(
                                                "Size",
                                                "dimension",
                                                2,
                                                { position: "left" },
                                                { position: "left" }
                                            ),
                                        ]),
                                  ...(isBifold || isSlabs || isService
                                      ? [
                                            _cell(
                                                "Qty",
                                                isSlabs || isBifold
                                                    ? "lhQty"
                                                    : "qty",
                                                2,
                                                { position: "center" },
                                                { position: "center" }
                                            ),
                                        ]
                                      : [
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
                                        ]),
                              ]),
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

                const details =
                    isMoulding || isBifold
                        ? []
                        : [
                              ...item.formSteps.filter(
                                  (t) =>
                                      !["Door", "Item Type", "Moulding"].some(
                                          (s) => s == t.step.title
                                      )
                              ),
                          ];
                const lines: any = [];
                const _multies = data.order.items.filter(
                    (i) =>
                        (!item.multiDyke && i.id == item.id) ||
                        (item.multiDyke && item.multiDykeUid == i.multiDykeUid)
                );
                // console.log(_multies.length);
                _multies.map((m, _) => {
                    const getVal = (
                        cell: Cell,
                        door?: DykeSalesDoors,
                        doorTitle?
                    ) => {
                        switch (cell) {
                            case "qty":
                                return m.qty;
                            case "description":
                                return m.description;
                            case "door":
                                return doorTitle;
                            // return item.formSteps.find(
                            //     (s) => s.step.title == "Door"
                            // )?.value;
                            case "dimension":
                                return door?.dimension?.replaceAll("in", '"');
                            case "moulding":
                                return m.housePackageTool?.molding?.title;
                            case "unitPrice":
                                return formatCurrency.format(
                                    door ? door.unitPrice : (m.rate as any)
                                );

                            case "lineTotal":
                            case "totalPrice":
                                return formatCurrency.format(
                                    door?.lineTotal || (m.total as any)
                                );
                            case "lhQty":
                            case "rhQty":
                                return door?.[cell as any];
                        }
                        return lines.length + 1;
                    };
                    if (isMoulding || isService) {
                        lines.push(
                            res.cells.map((cell, _i) => {
                                const ret = {
                                    style: cell.cellStyle,
                                    colSpan: cell.colSpan,
                                    value: getVal(cell.cell),
                                };
                                return ret;
                            })
                        );
                    } else {
                        m.housePackageTool?.doors?.map((door, _doorI) => {
                            lines.push(
                                res.cells.map((cell, _cellId) => {
                                    const ret = {
                                        style: cell.cellStyle,
                                        colSpan: cell.colSpan,
                                        value: getVal(
                                            cell.cell,
                                            door,
                                            _doorI > 0
                                                ? "as-above"
                                                : m.housePackageTool?.door
                                                      ?.title
                                        ),
                                    };
                                    return ret;
                                })
                            );
                        });
                    }
                });

                // console.log(lines.length);
                return {
                    _index: item?.meta?.lineIndex,
                    doorType: item.meta.doorType,
                    sectionTitle: item.meta.doorType,
                    details: details,
                    itemCells: res.cells,
                    lines: true
                        ? lines
                        : (isMoulding ? [] : item.housePackageTool?.doors)?.map(
                              (door, i) => {
                                  return res.cells.map((cell, _i) => {
                                      const ret = {
                                          style: cell.cellStyle,
                                          colSpan: cell.colSpan,
                                          value: door[cell.cell as any],
                                      };
                                      if (_i == 0) ret.value = i + 1;
                                      const currency = [
                                          "Rate",
                                          "Total",
                                      ].includes(cell.title);
                                      if (ret.value && currency) {
                                          ret.value = formatCurrency.format(
                                              ret.value
                                          );
                                      }
                                      return ret;
                                  });
                              }
                          ),
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
            if (isPacking) cells.push(styled("", "", {}));
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
            data.order.meta?.ccc
                ? styled(
                      "C.C.C",
                      formatCurrency.format(data.order.meta.ccc || 0),
                      {
                          font: "bold",
                      }
                  )
                : null,
            styled("Total", formatCurrency.format(data.order.grandTotal || 0), {
                font: "bold",
                size: "base",
            }),
        ].filter(Boolean),
    };
}

function heading({ mode, isOrder, order, isEstimate }) {
    let h = {
        title: mode,
        lines: [
            styled(isOrder ? "Order #" : "Quote #", order.orderId, {
                font: "bold",
                size: "lg",
            }),
            styled(
                isOrder ? "Order Date" : "Quote Date",
                formatDate(order.createdAt)
            ),
            styled("Rep", order.salesRep?.name),
        ],
    };
    if (isEstimate) {
        h.lines.push(
            styled(
                "Good Until",
                order.goodUntil ? formatDate(order.goodUntil) : "-"
            )
        );
    }
    if (isOrder) {
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
        if (order?.amountDue > 0) {
            let { goodUntil, paymentTerm, createdAt } = order;
            if (paymentTerm)
                goodUntil = salesFormUtils._calculatePaymentTerm(
                    paymentTerm,
                    createdAt
                );

            h.lines.push(
                styled("Good Until", goodUntil ? formatDate(goodUntil) : "-")
            );
        }
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
    const estimate = type == "quote";
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
