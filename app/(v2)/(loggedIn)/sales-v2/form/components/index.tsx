"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { SalesItemForm } from "./item-form";
import { Form } from "@/components/ui/form";
import { DykeForm, IDykeFormContext } from "../../type";
import { DykeFormContext } from "../../form-context";
import dykeUtils from "../../dykeUtils";

interface Props {}
export default function SalesFormComponent({}: Props) {
    const item = dykeUtils.newItem("0");
    const form = useForm<DykeForm>({
        defaultValues: {
            items: {
                ...item.item,
            },
            currentItemIndex: "0",
            itemsIndex: [0],
            itemBlocks: {
                ...item.block,
            },
        },
    });
    const [currentItemIndex] = form.watch(["currentItemIndex"]);

    const [itemsIndex, setItemsIndex] = useState([0]);

    const ctxValue = {
        currentItemIndex,
        setOpened(index) {
            if (currentItemIndex != index)
                form.setValue("currentItemIndex", index);
        },
    } as IDykeFormContext;
    return (
        <DykeFormContext.Provider value={ctxValue}>
            <FormProvider {...form}>
                <Form {...form}>
                    {itemsIndex.map((i) => (
                        <SalesItemForm
                            key={i}
                            form={form}
                            rowIndex={i.toString()}
                            openIndex={open}
                            setOpen={(e) => {
                                if (e)
                                    form.setValue(
                                        "currentItemIndex",
                                        i.toString()
                                    );
                                else if (!e && currentItemIndex == i.toString())
                                    form.setValue("currentItemIndex", null);
                            }}
                        />
                    ))}
                </Form>
            </FormProvider>
        </DykeFormContext.Provider>
    );
}
