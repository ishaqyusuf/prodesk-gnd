"use client";

import React, { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import BaseSheet from "./base-sheet";
import { IJobs } from "@/types/hrm";
import { Info } from "../info";
import {
  DateCellContent,
  PrimaryCellContent,
  SecondaryCellContent,
} from "../columns/base-columns";
import Money from "../money";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";

export default function JobOverviewSheet() {
  const route = useRouter();
  const [isSaving, startTransition] = useTransition();

  async function init(data) {}
  return (
    <BaseSheet<IJobs>
      className="sm:max-w-[550px]"
      onOpen={(data) => {
        init(data);
      }}
      onClose={() => {}}
      modalName="jobOverview"
      Title={({ data }) => <div className="">{data?.title}</div>}
      Description={({ data }) => <div>{data?.subtitle}</div>}
      Content={({ data }) => (
        <div>
          <ScrollArea className="h-screen ">
            <div className="grid grid-cols-2 items-start gap-4 text-sm mt-6 mb-28">
              <Content data={data} />
            </div>
          </ScrollArea>
        </div>
      )}
      //   Footer={({ data }) => (
      //     <Btn
      //       isLoading={isSaving}
      //       onClick={() => submit()}
      //       size="sm"
      //       type="submit"
      //     >
      //       Save
      //     </Btn>
      //   )}
    />
  );
}
function Content({ data }: { data }) {
  const [job, setJob] = useState<IJobs>(data);

  return (
    <>
      <Info label="Done By">
        <p>{data?.user?.name}</p>
        <DateCellContent>{data?.user?.createdAt}</DateCellContent>
      </Info>
      <Info label="Job Type">
        <p>{data?.type}</p>
      </Info>
      <Info label="Additional Cost">
        <Money value={data?.meta.additional_cost} />
      </Info>
      <Info label="Total Cost">
        <Money value={job?.amount} />
      </Info>
      <Info label="Payment">
        {job?.paidAt ? (
          <>
            <p>{job?.checkNo}</p>
            <DateCellContent>{job?.paidAt}</DateCellContent>
          </>
        ) : (
          <>No payment</>
        )}
      </Info>
      <Info className="col-span-2" label="Job Comment">
        <div>{data?.note || "No Comment"}</div>
      </Info>
      <div className="col-span-2">
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead className="px-1">Task</TableHead>
              <TableHead className="px-1">Qty</TableHead>
              <TableHead className="px-1">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.meta?.cost_data?.map((cd, i) => (
              <TaskRow key={i} job={job} index={i} setJob={setJob} row={cd} />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
function TaskRow({ row, index, job, setJob }) {
  const [qty, setQty] = useState(row.qty);
  const [dVal, setDVal] = useState(false);
  useEffect(() => {
    if (qty != row.qty) setDVal(qty);
  }, [qty, row.qty]);
  const deb = useDebounce(dVal, 800);
  useEffect(() => {
    // console.log(deb);
  }, [deb]);
  function blurred(e) {
    // console.log("BLURRED VALUE", qty);
  }
  return (
    <TableRow>
      <TableCell className="px-1">
        <PrimaryCellContent>{row.title}</PrimaryCellContent>
        <SecondaryCellContent>
          <Money value={row.unit_value || row.cost} />
        </SecondaryCellContent>
      </TableCell>
      <TableCell className="px-1">
        <Input
          onBlur={blurred}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          type="number"
          className="w-16 h-8"
        />
      </TableCell>
      <TableCell className="px-1">
        <SecondaryCellContent>
          <Money value={qty * (row.unit_value || row.cost)} />
        </SecondaryCellContent>
      </TableCell>
    </TableRow>
  );
}
