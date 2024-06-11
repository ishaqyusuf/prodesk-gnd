"use client";

import { createContext, use, useContext, useEffect } from "react";
import { usePrintContext } from "../base-printer";
import { BasePrintProps } from "../sales/order-base-printer";
import { GeneratCustomerPrintReport } from "../type";
import Money from "@/components/_v1/money";
import { Icons } from "@/components/_v1/icons";
import "./style.css";
interface Props {
    action;
    slug;
    className?: string;
}
interface CustomerReportCtxProps
    extends BasePrintProps,
        GeneratCustomerPrintReport {
    // report: GeneratCustomerPrintReport;
}
export const CustomerReportCtx = createContext<CustomerReportCtxProps>(
    null as any
);
export const useCustomerReportCtx = () =>
    useContext<CustomerReportCtxProps>(CustomerReportCtx);
export default function ReportCtx({ action, slug, className }: Props) {
    const data = use<GeneratCustomerPrintReport>(action);
    const ctx = usePrintContext();
    useEffect(() => {
        if (data) ctx.pageReady(slug, data);
    }, [data]);

    return (
        <CustomerReportCtx.Provider
            value={
                {
                    ...data,
                } as any
            }
        >
            <div id={`customerReport-${slug}`} className="p-4 print:p-0">
                <table id="main" className="w-full">
                    <thead id="topHeader">
                        <tr className="">
                            <td colSpan={16}>
                                <table className="w-full  table-fixed text-xs">
                                    <tbody>
                                        <tr className="">
                                            <td colSpan={9} valign="top">
                                                <Icons.PrintLogo />
                                            </td>
                                            <td valign="top" colSpan={5}>
                                                <div className="text-xs font-semibold text-black-900">
                                                    <p>13285 SW 131 ST</p>
                                                    <p>Miami, Fl 33186</p>
                                                    <p>Phone: 305-278-6555</p>

                                                    <p>
                                                        support@gndmillwork.com
                                                    </p>
                                                </div>
                                            </td>
                                            <td colSpan={1}></td>
                                            <td
                                                valign="top"
                                                className="flex justify-center flex-col"
                                                colSpan={9}
                                            >
                                                <p className="text-black mb-1 text-end text-xl font-bold capitalize">
                                                    Statement
                                                </p>
                                                <table>
                                                    <thead>
                                                        <th>Date</th>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>{data.date}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr className="">
                                            <td colSpan={10}>
                                                <table id="customer">
                                                    <thead>
                                                        <th>To</th>
                                                    </thead>
                                                    <tbody>
                                                        {data.customer.map(
                                                            (c) => (
                                                                <tr key={c}>
                                                                    <td>{c}</td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </td>
                                            <td colSpan={6}>
                                                <table
                                                    id="subHeader"
                                                    className=""
                                                >
                                                    <thead>
                                                        <th>Amount Due</th>
                                                        <th>Amount Enc</th>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <Money
                                                                    value={
                                                                        data
                                                                            .reportFooter
                                                                            .current
                                                                    }
                                                                />
                                                            </td>
                                                            <td></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </thead>
                    <thead id="reportTableHeader">
                        <th colSpan={1}>U/M</th>
                        <th colSpan={1}>Date</th>
                        <th colSpan={10}>Transaction</th>
                        <th colSpan={2}>Amount</th>
                        <th colSpan={2}>Balance</th>
                    </thead>
                    <tbody id="reportBody">
                        {data.reportTable.map((report) => (
                            <tr key={report.id}>
                                <td colSpan={1}></td>
                                <td colSpan={1} align="center">
                                    {report.date}
                                </td>
                                <td colSpan={10}>
                                    {report.amount < -1 ? (
                                        <></>
                                    ) : (
                                        <>
                                            <span>
                                                INV #{report.inv}{" "}
                                                {report.dueDate &&
                                                    `Due: ${report.dueDate}`}
                                            </span>
                                        </>
                                    )}
                                </td>
                                <td colSpan={2} align="right">
                                    <Money noCurrency value={report.amount} />
                                </td>
                                <td colSpan={2} align="right">
                                    <Money noCurrency value={report.balance} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={16}>
                                <table className="w-full">
                                    <thead>
                                        <th>CURRENT</th>
                                        <th>
                                            1-30 DAYS PAST
                                            <br />
                                            DUE
                                        </th>
                                        <th>
                                            31-60 DAYS PAST
                                            <br />
                                            DUE
                                        </th>
                                        <th>
                                            61-90 DAYS PAST
                                            <br />
                                            DUE
                                        </th>
                                        <th>OVER 90 DAYS PAST DUE</th>
                                        <th>Credit on Account</th>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td align="center">
                                                <Money
                                                    noCurrency
                                                    value={
                                                        data.reportFooter
                                                            .current
                                                    }
                                                />
                                            </td>
                                            <td align="center">
                                                <Money
                                                    noCurrency
                                                    value={
                                                        data.reportFooter.past1
                                                    }
                                                />
                                            </td>
                                            <td align="center">
                                                <Money
                                                    noCurrency
                                                    value={
                                                        data.reportFooter.past2
                                                    }
                                                />
                                            </td>
                                            <td align="center">
                                                <Money
                                                    noCurrency
                                                    value={
                                                        data.reportFooter.past3
                                                    }
                                                />
                                            </td>
                                            <td align="center">
                                                <Money
                                                    noCurrency
                                                    value={
                                                        data.reportFooter.over3
                                                    }
                                                />
                                            </td>
                                            <td align="center">
                                                <Money
                                                    value={
                                                        data.reportFooter
                                                            .current
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </CustomerReportCtx.Provider>
    );
}
