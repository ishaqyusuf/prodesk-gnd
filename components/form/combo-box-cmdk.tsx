import { Command } from "cmdk";
import React from "react";
import { UseFormReturn } from "react-hook-form/dist/types/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export function ComboBoxCmdk<T>({
  list,
  form,
  keyName,
  prompSize = "auto",
  ...props
}: {
  list;
  form: UseFormReturn<any>;
  keyName;
  id?;
  placeholder?;
  className?;
  prompSize?: "sm" | "md" | "lg" | "auto";
}) {
  const [loading, setLoading] = React.useState(false);

  const [open, setOpen] = React.useState(true);
  const [items, setItems] = React.useState<{ label; value; data? }[]>([]);
  function selectItem(v) {
    console.log(v);
    setOpen(false);
    form.setValue(keyName, v.value);
    setQ("");
  }
  const watch = form.watch(keyName);
  const [q, setQ] = React.useState("");
  const [newItem, setNewItem] = React.useState("");
  React.useEffect(() => {
    setItems(list?.map((l) => ({ label: l, value: l })));
  }, [watch]);
  return (
    <Command.Dialog open={open} onOpenChange={setOpen}>
      <Command.Input
        value={q}
        onValueChange={(v) => {
          setQ(v);
          setNewItem(v.trim());
        }}
        placeholder={props.placeholder || "..."}
      />

      <Command.List>
        {loading && <Command.Loading>Hang on…</Command.Loading>}

        <Command.Empty>No results found.</Command.Empty>
        {newItem != null && (
          <Command.Item key={0} onSelect={() => selectItem({ value: newItem })}>
            <span> {newItem}</span>
          </Command.Item>
        )}
        <Command.Group heading="Fruits">
          {items?.map((item, index) => (
            <Command.Item onSelect={() => selectItem(item)} key={index + 1}>
              <span>{item.label}</span>
            </Command.Item>
          ))}
          {/* <Command.Item>Apple</Command.Item>
          <Command.Item>Orange</Command.Item>
          <Command.Separator />
          <Command.Item>Pear</Command.Item>
          <Command.Item>Blueberry</Command.Item> */}
        </Command.Group>

        {/* <Command.Item>Fish</Command.Item> */}
      </Command.List>
    </Command.Dialog>
  );
}
