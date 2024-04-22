"use client";
import { useContext, useEffect, useState } from "react";
import { DykeItemFormContext, useDykeForm } from "../../form-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MultiComponent({ Render }) {
    const form = useDykeForm();
    const item = useContext(DykeItemFormContext);
    const [tabs, setTabs] = useState<{ title }[]>([]);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        const formData = form.getValues();
        const itemData = item.get.itemArray();

        const _tabs = Object.entries(itemData.multiComponent)
            .map(([productTitle, cData]) => {
                if (!cData.checked) return null;
                return { title: productTitle, toolId: cData.toolId };
            })
            .filter(Boolean);

        // console.log(_tabs);
        setTabs(_tabs as any);
        setReady(true);
    }, []);
    if (ready)
        return (
            <div className="flex flex-col overflow-hidden">
                <Tabs>
                    <TabsList className="w-auto">
                        {tabs?.map((tab, index) => (
                            <TabsTrigger value={tab.title} key={index}>
                                {tab.title}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {/* <TabsContent></TabsContent> */}
                </Tabs>
            </div>
        );
}
