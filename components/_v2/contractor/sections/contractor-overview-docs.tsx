"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { openModal } from "@/lib/modal";
import { useAppSelector } from "@/store";
import { IUser } from "@/types/hrm";
import Image from "next/image";

export default function ContractorOverviewDocs(props) {
    const data: IUser = useAppSelector(s => s.slicers.dataPage)?.data;
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
                        {data.docs.map(doc => (
                            <TableRow key={doc.id}>
                                <TableCell>
                                    <Image
                                        src={doc.meta.url}
                                        alt={doc.description as any}
                                    />
                                </TableCell>
                                <TableCell>
                                    <p>{doc.description}</p>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
