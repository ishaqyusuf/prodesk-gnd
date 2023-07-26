"use client";
import { useDebounce } from "@/hooks/use-debounce";
import React from "react";
import { UseFormReturn } from "react-hook-form/dist/types";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function Combobox<T>({
  list = [],
  form,
  keyName,
  allowCreate = false,
  prompSize = "auto",
  className,
  searchFn,
  labelKey,
  align = "end",
  selected,
  valueKey,
  ...props
}: {
  list?;
  selected?(T);
  form: UseFormReturn<any>;
  keyName;
  labelKey?;
  valueKey?;
  align?: "start" | "end" | "center" | undefined;
  id?;
  placeholder?;
  searchFn?(q): Promise<{ items: T[] }>;
  allowCreate?: Boolean;
  className?;
  prompSize?: "sm" | "md" | "lg" | "auto";
}) {
  interface IItem {
    label?;
    value;
    data?: T;
    hidden?;
  }
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<IItem[]>([]);
  function selectItem(v: IItem) {
    setOpen(false);
    form.setValue(keyName, v.value);
    setQ("");
    selected && selected(v.data);
  }
  function getLabel(v) {
    return typeof v === "string" ? v : labelKey ? v[labelKey] : v?.label;
  }
  function getValue(v) {
    return typeof v === "string" ? v : labelKey ? v[labelKey] : v?.value;
  }
  const watch = form.watch(keyName);
  const [q, setQ] = React.useState("");
  React.useEffect(() => {
    setItems(list?.map(transformItem));
  }, [watch]);
  function search(v) {
    const res = {};
    const isEmpty = v.trim()?.length > 0 == false;
    // RegExp.escape = function (pattern) {
    //   return pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // };
    const pattern = new RegExp(v?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    setItems(
      items.map((item) => {
        if (isEmpty) item.hidden = false;
        else {
          item.hidden = pattern.test(item.label) == false;
        }
        res[item.label] = [item.hidden, isEmpty];

        return item;
      })
    );
  }
  function transformItem(item) {
    return {
      label: getLabel(item),
      value: getValue(item),
      raw: item,
    };
  }
  const debouncedQuery = useDebounce(q, 800);
  async function dynamicSearch() {
    if (searchFn) {
      const resp = await searchFn(q);

      setItems(resp.items.map(transformItem) as any);
    }
  }
  React.useEffect(() => {
    // if (debouncedSearch) {
    // fetch(`/api/search?q=${debouncedSearch}`);
    dynamicSearch();
    //  fetchData();
    // table.getColumn(key)?.setFilterValue(debouncedSearch);
    // }
  }, [debouncedQuery]);
  // const [q, setQ] = React.useState("");
  function onOpen(e) {
    setOpen(e);
    if (e) {
      setQ("");
      dynamicSearch();
    }
  }
  // return (
  //   <AutoComplete
  //     // {...form.register(keyName)}
  //     value={form.getValues(keyName)}
  //     onChange={(v) => {
  //       setQ(v);
  //       form.setValue(keyName, v);
  //       // setNewItem(v.trim());
  //       search(v);
  //     }}
  //     options={items}
  //     {...props}
  //     // onSearch={searchHandler}
  //   />
  // );
  return (
    <>
      <Popover open={open} onOpenChange={onOpen}>
        <PopoverTrigger asChild>
          {/* <div className={className}> */}
          {/* <Input className="h-8 p-1" {...props} {...form.register(keyName)} /> */}
          <Button
            variant="outline"
            className="line-clamp-1 h-8 w-full justify-start px-2 text-start"
          >
            {form.getValues(keyName)}
          </Button>
          {/* </div> */}
        </PopoverTrigger>
        <PopoverContent
          className={`w-auto 
        p-0 
          `}
          align={align}
        >
          <Command shouldFilter={false}>
            <CommandInput
              className=""
              value={q}
              onValueChange={(v) => {
                setQ(v);
                // setNewItem(v.trim());

                search(v);
              }}
              placeholder={props.placeholder || "..."}
            />
            <CommandList className="h-28">
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {allowCreate && q?.length > 0 && (
                  <>
                    <CommandItem
                      key={0}
                      onSelect={() => selectItem({ value: q })}
                    >
                      <span>{q}</span>
                    </CommandItem>
                    <CommandSeparator />
                  </>
                )}
                {items?.map(
                  (item, index) =>
                    !item.hidden && (
                      <CommandItem
                        onSelect={() => selectItem(item)}
                        key={index + 1}
                      >
                        <span>{item.label}</span>
                      </CommandItem>
                    )
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
