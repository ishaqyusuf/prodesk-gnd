"use client";
import { useEffect } from "react";
import Head from "next/head";
import "./style.css";
import BasePrinter from "@/app/(v2)/printer/base-printer";

export default function PrintPage() {
    return (
        <BasePrinter {...({} as any)} slugs={[]}>
            <PrintComponent />
        </BasePrinter>
    );
}
export function PrintComponent() {
    useEffect(() => {
        function printPage() {
            // window.print();
        }

        // Function to add filler rows dynamically to fill the page if necessary
        function addFillerRows() {
            var tableBody = document.getElementById("table-body");
            var rowCount = tableBody.rows.length;
            let maxlength = 16;
            if (rowCount < maxlength) {
                maxlength = parseInt(maxlength) - parseInt(rowCount);
                // Add filler rows if there is only one record
                for (var i = 0; i < maxlength; i++) {
                    // Adjust the number as needed
                    var fillerRow = document.createElement("tr");
                    fillerRow.className = `filler`;
                    fillerRow.innerHTML = "<td colspan='6'>&nbsp;</td>";
                    tableBody.appendChild(fillerRow);
                }
            }
        }
        // return () => {
        // document
        //     .querySelector(".button")
        //     .addEventListener("click", printPage);
        // };
        // Call the function to add filler rows
        addFillerRows();
    }, []);

    return (
        <>
            <Head>
                <title>Statement</title>
            </Head>
            <div className={"print-container"}>
                <h2>Statement</h2>
                <p>5/13/2024</p>
                <table className={"print-table"}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount Due</th>
                            <th>Amount</th>
                            <th>Amount Enc.</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody id="table-body">
                        {Array(7)
                            .fill(null)
                            .map((_, i) => (
                                <tr key={i}>
                                    <td>01/25/2024</td>
                                    <td>
                                        INV #58372. Due 02/24/2024. Orig. Amount
                                        $90.95.
                                    </td>
                                    <td>$90.95</td>
                                    <td>90.95</td>
                                    <td>90.95</td>
                                    <td>90.95</td>
                                </tr>
                            ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>Current</th>
                            <th>1-30 Days Past Due</th>
                            <th>31-60 Days Past Due</th>
                            <th>61-90 Days Past Due</th>
                            <th>Over 90 Days Past Due</th>
                            <th>Amount Due</th>
                        </tr>
                        <tr>
                            <td>0.00</td>
                            <td>0.00</td>
                            <td>0.00</td>
                            <td>90.95</td>
                            <td>0.00</td>
                            <td>$90.95</td>
                        </tr>
                    </tfoot>
                </table>
                <br />
                <button
                    className={`print-btn no-print`}
                    // onClick={() => window.print()}
                >
                    Print
                </button>
            </div>
        </>
    );
}
