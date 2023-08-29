"use client";
import AutoComplete2 from "@/components/auto-complete-headless";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function PlaygroundPage({}) {
  const form = useForm({
    defaultValues: {
      id: "ishaq",
    },
  });
  const watchId = form.watch("id");
  useEffect(() => {
    setTimeout(() => {
      form.setValue("id", "abu-awf");
    }, 3000);
  }, []);
  return (
    <div className="flex flex-col h-screen justify-center items-center">
      {watchId}
      <AutoComplete2
        value={watchId}
        form={form}
        formKey={"id"}
        itemText={"label"}
        itemValue={"id"}
        options={[
          { id: "ishaq", label: "Ishaq Yusuf" },
          { id: "danmairomo", label: "Sulaiman DanMairomo" },
          { id: "abu-haatim", label: "Abu Haatim" },
          { id: "abu-awf", label: "Abu Awf" },
          { id: "abu-nafeesah", label: "Abu Nafeesah" },
        ]}
      />
    </div>
  );
}
