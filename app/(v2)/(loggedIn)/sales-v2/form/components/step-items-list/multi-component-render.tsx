"use client";
import { useContext, useEffect, useState } from "react";
import { DykeItemFormContext, useDykeForm } from "../../_hooks/form-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useMultiDykeForm from "../../_hooks/use-multi-generator";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function MultiComponentRender({ Render, line = false }) {
    const mdf = useMultiDykeForm();

    useEffect(() => {
        mdf.initialize();
    }, []);
    if (mdf.ready)
        return (
            <div className="flex flex-col">
                {line ? (
                    <div className="h-[300px] px-8 -mx-8 overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableHead>Moulding</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Line Total</TableHead>
                                <TableHead></TableHead>
                            </TableHeader>
                            <TableBody>
                                {mdf.tabs?.map((tab, index) => (
                                    <TableRow key={index}>
                                        <Render componentTitle={tab.title} />
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <Tabs
                        defaultValue={mdf.currentTab}
                        onValueChange={mdf.setCurrentTab}
                        className={cn(line && "flex space-x-4")}
                    >
                        <TabsList
                            defaultValue={mdf.tabs?.[0]?.title}
                            className={cn(
                                line && "flex flex-col w-1/3",
                                "h-auto"
                            )}
                        >
                            {mdf.tabs?.map((tab, index) => (
                                <TabsTrigger
                                    value={tab.title}
                                    key={index}
                                    className="whitespace-normal"
                                >
                                    {tab.title}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {mdf.tabs?.map((tab, index) => (
                            <TabsContent value={tab.title} key={index}>
                                <div className="h-[300px] px-8 -mx-8 overflow-auto">
                                    <Render componentTitle={tab.title} />
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>
        );
}