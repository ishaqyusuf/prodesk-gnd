"use client";

import { memo, useEffect, useState } from "react";
import { Tabs, TabsContent } from "../../ui/tabs";
import { MobileMenu, MobileOption } from "./mobile-menu-item";
import BaseSheet from "../sheets/base-sheet";
import { Button } from "../../ui/button";
import { Icons } from "../icons";
import optionBuilder from "@/lib/option-builder";
import { sales } from "@/lib/sales/sales-helper";
import { useModal } from "@/_v2/components/common/modal/provider";

const MobileMenuContext = ({ Title, Subtitle }: { Title; Subtitle? }) => {
    const [options, setOptions] = useState<any[]>([]);
    const [tab, setTab] = useState<string>("main");
    useEffect(() => {
        setTab("main");
    }, []);
    const modal = useModal();
    return (
        <BaseSheet
            onOpen={(data) => {
                setTab("main");
                setOptions(
                    optionBuilder.toMobile(
                        sales.salesMenuOption(data as any, modal)
                    )
                );
            }}
            Title={({ data }) => (
                <div className="w-full text-start flex items-center space-x-2">
                    {tab != "main" && (
                        <Button
                            onClick={() => setTab("main")}
                            className="p-0 w-8 h-8"
                            variant="ghost"
                        >
                            <Icons.arrowLeft className="w-4 h-4" />
                        </Button>
                    )}
                    <Title data={data} />
                </div>
            )}
            side="bottom"
            modalName="salesMobileOption"
            Content={({ data }) => (
                <div className="-mx-4">
                    <Tabs defaultValue={tab} className="">
                        {options.map((opt, i) => (
                            <TabsContent key={i} value={opt.name}>
                                <MobileMenu>
                                    {opt.items?.map((item, j) => {
                                        return (
                                            <MobileOption
                                                key={j}
                                                {...item}
                                                more={item.more?.length}
                                                onClick={() => {
                                                    // console.log(item.);
                                                    if (item.more) {
                                                        setTab(item.label);
                                                    } else
                                                        item.onClick &&
                                                            item.onClick();
                                                }}
                                            />
                                        );
                                    })}
                                </MobileMenu>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            )}
        />
    );
};
export default memo(MobileMenuContext);
