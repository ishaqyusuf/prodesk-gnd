"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ComboboxProps } from "./combo-box";
import { DropdownMenu } from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Props<T> extends ComboboxProps<T> {
  className?;
}

export default function AutoComplete<T>({
  className,
  form,
  value,
  valueKey,
  setValue,
  keyName,
}: Props<T>) {
  const [__value, __setValue] = useState(
    form ? form.getValues(keyName) : value
  );
  const [validInput, setValidInput] = useState();
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu
      open={open}
      onOpenChange={(e) => {
        setOpen(e);
        if (!e) {
          form?.setValue(keyName, __value);
          setValue && setValue(__value);
        } else {
          setValidInput(form ? form.getValues(keyName) : value);
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Input
          className={cn(className)}
          onChange={(e) => {
            __setValue(e);
          }}
        />
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}
