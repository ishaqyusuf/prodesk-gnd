"use client";

import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
} from "@/components/ui/dialog";
import { ISalesOrder } from "@/types/sales";
import { DialogTitle } from "@radix-ui/react-dialog";

import React, { useEffect, useTransition } from "react";
import { useAppSelector } from "@/store";

import { dispatchSlice } from "@/store/slicers";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CheckCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

import { formatDate } from "@/lib/use-day";
import { ScrollArea } from "@/components/ui/scroll-area";
import { _useAsync } from "@/lib/use-async";
import { useStaticProducers } from "@/_v2/hooks/use-static-data";
import {
    UserProductionEventsProps,
    assignProductionAction,
    getUserProductionEventsAction,
} from "@/app/(v1)/_actions/sales/sales-production";
import { useModal } from "@/components/common/modal/provider";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/_v1/date-range-picker";
import Btn from "@/components/_v1/btn";
import dayjs from "dayjs";

interface Props {
    order: ISalesOrder;
}
export default function AssignProductionModal({ order }: Props) {
    const [isPending, startTransition] = useTransition();
    const [userId, setUserId] = React.useState<any>(order.prodId);
    const [prodDueDate, setDueDate] = React.useState<any>(order.prodDueDate);

    const [selectedMonth, setSelectedMonth] = React.useState<any>(new Date());
    const [productions, setProductionEvents] = React.useState<ISalesOrder[]>(
        []
    );
    const prodUsers = useStaticProducers();

    const modal = useModal();
    async function save() {
        startTransition(async () => {
            await assignProductionAction({
                id: order.id,
                userId: Number(userId),
                prodDueDate,
            });
            modal?.close();
            // router.refresh();
            toast.success("Production Assigned!");
        });
    }
    async function __loadProds(props: UserProductionEventsProps) {
        const __prods = await getUserProductionEventsAction(props);
        // console.log(__prods);
        setProductionEvents(__prods as any);
    }
    useEffect(() => {
        // console.log([])
        if (selectedMonth && userId) {
            __loadProds({
                userId: Number(userId),
                date: selectedMonth,
            });
        }
    }, [selectedMonth, userId]);
    const selectProducer = React.useCallback(
        (pid) => {
            // console.log(pid);
            setUserId(pid);
        },
        [setUserId]
    );
    const monthChange = React.useCallback((e) => {
        setSelectedMonth(e);
    }, []);
    return (
        <DialogContent className="sm:max-w-[850px]">
            <DialogHeader>
                <DialogTitle>Assign Production</DialogTitle>
                <DialogDescription>{order?.orderId}</DialogDescription>
            </DialogHeader>
            <div className="flex space-x-4 -mx-4 sm:mx-0">
                <ScrollArea
                    id="employees"
                    className="max-h-[350px] hidden sm:block sm:w-[200px]"
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="">Employees</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {prodUsers.data?.map((field, i) => (
                                <TableRow
                                    className={`${
                                        field.id == userId ? "bg-accent" : ""
                                    } cursor-pointer`}
                                    onClick={() => selectProducer(field.id)}
                                    key={field.id}
                                >
                                    <TableCell
                                        id="Name"
                                        className={`inline-flex cursor-pointer items-center space-x-2`}
                                    >
                                        <CheckCircle
                                            className={`h-3.5 w-3.5 ${
                                                field.id == userId
                                                    ? ""
                                                    : "opacity-20"
                                            }`}
                                        />
                                        <p className="text-primary">
                                            {field.name}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                <div id="calendar" className="min-h-[350px] hidden sm:block">
                    <Calendar
                        onMonthChange={monthChange}
                        month={selectedMonth}
                        mode="single"
                        //   selected={field.value}
                        //   onSelect={field.onChange}
                        selected={prodDueDate}
                        onSelect={setDueDate}
                        // disabled={(date) =>
                        //   date > new Date() || date < new Date("1900-01-01")
                        // }
                        initialFocus
                    />
                </div>
                <ScrollArea className="sm:max-h-[350px]   flex-1 sm:w-[200px]">
                    <div className="sm:hidden mb-2">
                        <div className="grid gap-2">
                            <Label>Assign To</Label>
                            <Select
                                onValueChange={(v) => selectProducer(v)}
                                defaultValue={userId}
                            >
                                <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Assign To" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {prodUsers?.data?.map((opt, _) => (
                                            <SelectItem
                                                key={_}
                                                value={opt.id?.toString()}
                                            >
                                                {opt.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2 mb-2">
                            <Label>Date</Label>
                            <DatePicker
                                className="w-auto h-7"
                                // onMonthChange={monthChange}
                                // month={selectedMonth}
                                value={prodDueDate}
                                setValue={(v) => {
                                    setDueDate(v);
                                    setSelectedMonth(v);
                                }}
                            />
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="">
                                    Production Queue
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {productions
                                ?.filter((p) =>
                                    dayjs(p.prodDueDate).isSame(
                                        prodDueDate,
                                        "day"
                                    )
                                )
                                ?.map((field, i) => (
                                    <TableRow key={field.id}>
                                        <TableCell
                                            onClick={() =>
                                                selectProducer(field)
                                            }
                                            id="Name"
                                            className={`flex p-2 pr-4`}
                                        >
                                            <div className="w-10">{i + 1}.</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <p className="font-semibold text-primary">
                                                        {field.orderId}
                                                    </p>
                                                    <p className="text-text-muted-foreground">
                                                        {field.prodStatus}
                                                    </p>
                                                </div>
                                                <p className="text-text-muted-foreground">
                                                    {formatDate(
                                                        field.prodDueDate
                                                    )}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {!productions?.length && userId && (
                                <TableRow>
                                    <TableCell>
                                        <p className="font-medium text-muted-foreground">
                                            No Production Event For this Month
                                        </p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
            <DialogFooter>
                <div className="flex justify-end">
                    <Btn
                        isLoading={isPending}
                        onClick={save}
                        size="sm"
                        type="submit"
                    >
                        Save
                    </Btn>
                </div>
            </DialogFooter>
        </DialogContent>
    );
}
