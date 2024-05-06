"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAssignmentData } from ".";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/use-day";
import {
    Menu,
    MenuItem,
} from "@/components/_v1/data-table/data-table-row-actions";
import ConfirmBtn from "@/components/_v1/confirm-btn";
import { _deleteAssignment } from "./_action/actions";
import { useAssignment } from "./use-assignment";

interface Props {
    groupIndex;
    doorIndex;
}
export default function DoorAssignments({ doorIndex, groupIndex }: Props) {
    const data = useAssignmentData();
    const group = data.data.doorGroups[groupIndex];
    const modal = useAssignment();
    if (!group) return null;
    const salesDoor = group.salesDoors[doorIndex];
    if (!salesDoor || !salesDoor.assignments.length) return null;
    async function deleteAssignment(assignment) {
        await _deleteAssignment(assignment.id);
        modal.open(data.data.id);
    }
    return (
        <div className="mx-4 ml-10">
            <Table className="">
                <TableHeader>
                    <TableHead>Date</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                </TableHeader>
                <TableBody>
                    {salesDoor?.assignments?.map((assignment) => (
                        <TableRow key={assignment.id} className="">
                            <TableCell>
                                {formatDate(assignment.createdAt)}
                            </TableCell>
                            <TableCell>{assignment.assignedTo?.name}</TableCell>
                            <TableCell>{assignment.qtyAssigned}</TableCell>
                            <TableCell>
                                <div>
                                    {!assignment.submissions?.length ? (
                                        <Badge>Pending</Badge>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="flex gap-2">
                                <ConfirmBtn
                                    trash
                                    size={"icon"}
                                    onClick={() => deleteAssignment(assignment)}
                                />
                                <Menu variant={"ghost"}>
                                    <MenuItem>Delete</MenuItem>
                                </Menu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
