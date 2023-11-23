"use client";

import { useEffect, useState } from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarProps } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import dayjs from "dayjs";
import { DateFormats, formatDate } from "@/lib/use-day";

interface Props {
    range?: Boolean;
    hideIcon?: Boolean;
    value?: any;
    setValue?: any;
    format?: DateFormats;
    placeholder?;
}
export function DatePicker({
    className,
    value,
    range,
    setValue,
    hideIcon,
    format = "YYYY-MM-DD",
    placeholder = "Pick a date",
    ...calendarProps
}: CalendarProps & Props) {
    const [date, setDate] = useState<DateRange | undefined | Date>(
        value ? value : range ? { form: null, to: null } : null
    );
    useEffect(() => {
        setDate(value ? value : range ? { form: null, to: null } : null);
    }, [value, range]);
    // const [date, setDate] = React.useState<DateRange | undefined>({
    //   from: new Date(2023, 0, 20),
    //   to: addDays(new Date(2023, 0, 20), 20),
    // });
    function from() {
        if (!range) return null;
        return (date as any).from;
    }
    function to() {
        if (!range) return null;
        return (date as any).from;
    }

    function _date() {
        if (range) return null;
        return date as any;
    }
    function __format(d) {
        return formatDate(d, format);
    }
    // React.useEffect(() => {
    //   console.log(value);
    // }, []);
    const [open, setOpen] = useState(false);
    return (
        <div className={cn("grid gap-2")}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !date && "text-muted-foreground",
                            className
                        )}
                    >
                        {!hideIcon && <CalendarIcon className="mr-2 h-4 w-4" />}
                        {range &&
                            (from() ? (
                                to() ? (
                                    <>
                                        {__format(from())} - {__format(to())}
                                    </>
                                ) : (
                                    __format(from())
                                )
                            ) : (
                                <span className="whitespace-nowrap">
                                    {placeholder}
                                </span>
                            ))}
                        {!range &&
                            (!date ? (
                                <span className="whitespace-nowrap">
                                    {placeholder}
                                </span>
                            ) : (
                                __format(_date())
                            ))}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        {...(calendarProps as any)}
                        initialFocus
                        mode={(range ? "range" : "single") as any}
                        defaultMonth={range ? from() : date}
                        selected={date}
                        onSelect={v => {
                            setDate(v);
                            setValue?.(v);
                            setOpen(false);
                        }}
                        numberOfMonths={range ? 2 : 1}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
