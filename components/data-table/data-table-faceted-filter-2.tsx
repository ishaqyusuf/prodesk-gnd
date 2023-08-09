import * as React from "react" 
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons"
import { Table, type Column } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Check } from "lucide-react"
import { DataTableFilterableColumn } from "@/types/data-table"

export interface Option {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}
// interface DataTableFacetedFilter<TData, TValue> {
//   column?: Column<TData, TValue>
//   title?: string
//   single?: Boolean
//   options: Option[]
// }
interface DataTableFacetedFilter<TData, TValue> {
  title?: string;
options: Option[]
  filter?: DataTableFilterableColumn<TData, TValue>;
  range?;
  single?: Boolean
  column?: Column<TData, TValue>;
  dateTypeColumn?: Column<TData, TValue>;
  rangeSwitch?: Boolean;
  defaultValue?: String
}
export function DataTableFacetedFilter2<TData, TValue>({
  title,
  options,single,column,defaultValue
}: DataTableFacetedFilter<TData,TValue>) {

  const facets = column?.getFacetedUniqueValues();
  // const selectedValues = new Set();
  const [_selectedValues, setSelectedValue] = React.useState(new Set());
  const fv = column?.getFilterValue();
  React.useEffect(() => {
    const v = fv; // as string[];

    const isArray = Array.isArray(v);
    // selectedValues.clear();
    if (v) {
      const ns = new Set(_selectedValues);
      if (single) {
        // console.log(isArray ? v[0] : v);
        ns.add(isArray ? v[0] : v);
        // console.log(_selectedValues.size);
      } else {
        (isArray ? v : [v]).map((_v) => ns.add(_v));
      }
      setSelectedValue(ns);
    }
  }, [fv]);

  const [open, setOpen] = React.useState(false);
  if (!column || !column.id) {
    console.log("NULL COLUMN", column);
    return null;
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          {/* <PlusCircle className="mr-2 h-4 w-4" /> */}
          {title}
          {_selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {_selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {_selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {_selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => _selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
          {
            _selectedValues.size == 0 && defaultValue && <Badge>
              { defaultValue }
            </Badge>
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          {!(single || options.map?.length < 5) && (
            <CommandInput placeholder={title} />
          )}
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = _selectedValues.has(option.value);

                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      const ns = new Set(_selectedValues);
                      if (single) {
                        if (isSelected) {
                          setOpen(false);
                          return;
                        }
                        ns.clear();
                        ns.add(option.value); 
                        setOpen(false);
                      } else {
                        if (isSelected) {
                          ns.delete(option.value);
                        } else {
                          ns.add(option.value);
                        }
                      }
                      const filterValues = Array.from(ns);

                      // const fv = filterValues.length
                      //     ? single
                      //       ? [filterValues[0]]
                      //       : filterValues
                      //     : undefined
                        
                      column?.setFilterValue(
                        filterValues
                      );
                      setSelectedValue(ns);
                    }}
                  >
                    {!single && (
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                    )}
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {_selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setSelectedValue(new Set());
                      column?.setFilterValue(undefined);
                    }}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
