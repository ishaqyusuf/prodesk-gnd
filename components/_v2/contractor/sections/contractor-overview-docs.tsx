"use client";

import { _deleteContractorDoc } from "@/app/(v1)/_actions/contractors/delete-contractor-doc";
import ConfirmBtn from "@/components/_v1/confirm-btn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { openModal } from "@/lib/modal";
import { useAppSelector } from "@/store";
import { IUser, IUserDoc } from "@/types/hrm";
import Image from "next/image";

export default function ContractorOverviewDocs(props) {
    const data: IUser = useAppSelector((s) => s.slicers.dataPage)?.data;
    async function deleteImg(img: IUserDoc) {
        await _deleteContractorDoc(img);
    }
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
                        {data.documents?.map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell>
                                    <Image
                                        className="border-2 rounded cursor-pointer"
                                        onClick={() =>
                                            openModal("img", {
                                                src: doc.meta.url,
                                            })
                                        }
                                        width={70}
                                        height={50}
                                        src={doc.meta.url}
                                        alt={doc.description as any}
                                    />
                                </TableCell>
                                <TableCell>
                                    <p>{doc.description}</p>
                                    <ConfirmBtn onClick={() => deleteImg(doc)}>
                                        Delete
                                    </ConfirmBtn>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
