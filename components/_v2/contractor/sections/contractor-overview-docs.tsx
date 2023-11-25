"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { openModal } from "@/lib/modal";
import { useAppSelector } from "@/store";

export default function ContractorOverviewDocs(props) {
    const data = useAppSelector(s => s.slicers.dataPage)?.data;
    return (
        <Card {...props}>
            <CardHeader>
                <CardTitle>
                    <span>Documents</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Button onClick={() => openModal("uploadDoc", data)}>
                    Upload
                </Button>
                <Table>
                    <TableBody>
                        <TableRow></TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
