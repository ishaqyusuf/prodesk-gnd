"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableRow } from "@/components/ui/table";

export default function ContractorOverviewDocs(props) {
    return (
        <Card {...props}>
            <CardHeader>
                <CardTitle>
                    <span>Documents</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        <TableRow></TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
