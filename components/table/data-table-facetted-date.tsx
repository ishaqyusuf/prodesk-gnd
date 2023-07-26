import { useEffect, useState } from "react";
import { Column, Table } from "@tanstack/react-table";
import { Check, LucideIcon, CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "../ui/calendar";
import { DateRange } from "react-day-picker";
import { Checkbox } from "../ui/checkbox";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { formatDate } from "@/lib/use-day";
import { typedMemo } from "@/lib/hocs/typed-memo";

interface DataTableFacetedFilter<TData, TValue> {
  title?: string;
  filterTypes?;
  range?;
  rangeSwitch?: Boolean;
  table: Table<TData>;
}

export function DataTableFacetedDate<TData, TValue>({
  title = "Date",
  table,
  rangeSwitch,
  filterTypes,
  range,
}: DataTableFacetedFilter<TData, TValue>) {
  const column: Column<TData, TValue> | undefined = table.getColumn(
    "_date"
  ) as any;
  const dateTypecolumn: Column<TData, TValue> | undefined = table.getColumn(
    "_dateType"
  ) as any;

  const [open, setOpen] = useState(false);
  const [_title, setTitle] = useState();
  const [dateRange, setDateRange] = useState(range);

  const [date, setDate] = useState<DateRange | undefined | Date>();
  const fv = column?.getFilterValue();

  useEffect(() => {
    const cVal = fv;
    console.log(cVal);
    // if (!cVal) return;
    // const isArray = Array.isArray(cVal);
    // let _v = isArray ? cVal : [cVal];
    // console.log(_v);
    // const [from, to] = _v.map((_) => new Date(_));
    // const _d = (
    //   from && to
    //     ? {
    //         from,
    //         to,
    //       }
    //     : from
    // ) as any;
    // console.log(_d);
    setDateRange(!(cVal instanceof Date));
    setDate(cVal as any);
  }, [fv]);

  const dtc = dateTypecolumn?.getFilterValue();
  useEffect(() => {
    setTitle(filterTypes.find((t) => t.value == dtc)?.label);
  }, []);
  useEffect(() => {
    console.log(dtc);
    setTitle(filterTypes.find((t) => t.value == dtc)?.label);
  }, [dtc]);
  if (!column || !column.id) {
    console.log("NULL COLUMN", column);
    return null;
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {_title || title}
          <Separator orientation="vertical" className="mx-2 h-4" />
          {date && date instanceof Date ? (
            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
              {formatDate(date, "YYYY-MM-DD")}
            </Badge>
          ) : null}
          <RangeText date={date} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex justify-end space-x-2 p-2 px-4 pt-4">
          {filterTypes && (
            <DataTableFacetedFilter
              _key="_dateType"
              title="Filter"
              single
              table={table}
              options={filterTypes}
            />
          )}
          {rangeSwitch && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sameAddress"
                checked={dateRange}
                onCheckedChange={(e) => {
                  setDateRange(e);
                  setDate(null as any);
                }}
              />
              <label
                htmlFor="sameAddress"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Range
              </label>
            </div>
          )}
        </div>
        <Calendar
          initialFocus
          mode={(dateRange ? "range" : "single") as any}
          selected={date}
          onSelect={(e) => {
            setDate(e);
            console.log(e, date);
            let fd: any = null;
            if (e instanceof Date) {
              setOpen(false);
              fd = formatDate(e, "YYYY-MM-DD");
            } else {
              const { from, to } = e;
              if (from && to) {
                fd = [from, to].map((d) => formatDate(d, "YYYY-MM-DD"));

                setOpen(false);
              } else return;
            }
            console.log(fd);
            column.setFilterValue(e);
          }}
          numberOfMonths={dateRange ? 2 : 1}
        />
      </PopoverContent>
    </Popover>
  );
}
const RangeText = typedMemo(({ date }) => {
  if (!date?.from || !date?.to) return null;
  return (
    <>
      <Badge variant="secondary" className="rounded-sm px-1 font-normal">
        {formatDate(date.from, "YYYY-MM-DD")}
      </Badge>
      -
      <Badge variant="secondary" className="rounded-sm px-1 font-normal">
        {formatDate(date.to, "YYYY-MM-DD")}
      </Badge>
    </>
  );
});
