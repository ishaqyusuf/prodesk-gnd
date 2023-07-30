"use client";

import React, { useEffect, useTransition } from "react";
import { store, useAppSelector } from "@/store";

import { useLoader } from "@/lib/use-loader";
import { dispatchSlice, updateSlice } from "@/store/slicers";
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
import { useRouter } from "next/navigation";
import { ISalesOrder } from "@/types/sales";
import {
  UserProductionEventsProps,
  assignProductionAction,
  getUserProductionEventsAction,
} from "@/app/_actions/sales-production";
import { getProductionUsersAction } from "@/app/_actions/hrm";
import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";
// import { UseFormReturn } from "react-hook-form/dist/types";

export default function SalesProductionModal() {
  const [isPending, startTransition] = useTransition();
  const [userId, setUserId] = React.useState<any>();
  const [prodDueDate, setDueDate] = React.useState<any>();

  const [selectedMonth, setSelectedMonth] = React.useState<any>(new Date());
  const [productions, setProductionEvents] = React.useState<ISalesOrder[]>([]);
  const modal = useAppSelector((state) => state.slicers?.modal);
  const productionUsers = useAppSelector(
    (state) => state.slicers?.productionUsers
  );
  //   useEffect(() => {
  //     if (!productionUsers) {
  //       _useAsync(async () => {
  //         dispatchSlice("productionUsers", await getProductionUsersAction());
  //       });
  //     }
  //   }, [productionUsers]);
  async function save(order) {
    startTransition(async () => {
      await assignProductionAction({
        id: order.id,
        userId,
        prodDueDate,
      });
      closeModal("assignProduction");
      router.refresh();
      toast.success("Production Assigned!");
    });
  }

  const router = useRouter();
  async function __loadProds(props: UserProductionEventsProps) {
    const __prods = await getUserProductionEventsAction(props);
    setProductionEvents(__prods as any);
  }
  useEffect(() => {
    // console.log([])
    if (selectedMonth && userId) {
      __loadProds({
        userId,
        date: selectedMonth,
      });
    }
  }, [selectedMonth, userId]);
  const selectProducer = React.useCallback(
    (producer) => {
      setUserId(producer.id);
    },
    [setUserId]
  );
  const monthChange = React.useCallback((e) => {
    // console.log(e);
    setSelectedMonth(e);
  }, []);
  return (
    <BaseModal<ISalesOrder>
      className="sm:max-w-[850px]"
      onOpen={(order) => {
        if (!productionUsers) {
          getProductionUsersAction().then((result) => {
            dispatchSlice("productionUsers", result);
          });
        }
        setUserId(order.id);
        setDueDate(order.prodDueDate);
      }}
      onClose={() => {
        setSelectedMonth(new Date());
        setUserId(null);
        setDueDate(null);
        setProductionEvents([]);
      }}
      modalName="assignProduction"
      Title={({ data: order }) => (
        <div>Assign Production ({order?.orderId})</div>
      )}
      Content={({ data }) => (
        <div className="flex space-x-4 ">
          <ScrollArea className="max-h-[350px] sm:w-[200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="">Employees</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionUsers?.map((field, i) => (
                  <TableRow
                    className={`${
                      field.id == userId ? "bg-accent" : ""
                    } cursor-pointer`}
                    onClick={() => selectProducer(field)}
                    key={field.id}
                  >
                    <TableCell
                      id="Name"
                      className={`inline-flex cursor-pointer items-center space-x-2`}
                    >
                      <CheckCircle
                        className={`h-3.5 w-3.5 ${
                          field.id == userId ? "" : "opacity-20"
                        }`}
                      />
                      <p className="text-primary">{field.name}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="min-h-[350px]">
            <Calendar
              onMonthChange={monthChange}
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
          <ScrollArea className="max-h-[350px]  flex-1 sm:w-[200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="">Production Queue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productions?.map((field, i) => (
                  <TableRow key={field.id}>
                    <TableCell
                      onClick={() => selectProducer(field)}
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
                          {formatDate(field.prodDueDate)}
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
      )}
      Footer={({ data }) => (
        <Btn
          isLoading={isPending}
          onClick={() => save(data)}
          size="sm"
          type="submit"
        >
          Save
        </Btn>
      )}
    />
  );
}
