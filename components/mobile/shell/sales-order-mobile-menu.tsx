"use client";

import { useState } from "react";
import { MobileMenu, MobileOption } from "../mobile-menu-item";
import { closeModal } from "@/lib/modal";
import { Icons } from "@/components/icons";
import { sales } from "@/lib/sales/sales-helper";
import { useRouter } from "next/navigation";
import { TabsContent } from "@/components/ui/tabs";
import MobileMenuCtx from "../mobile-menu-ctx";

export default function SalesOrderMobileMenuShell() {
    const router = useRouter();
    const [currentTab, setCurrentTab] = useState("main");
    const [tab, setTab] = useState("main");
    return <MobileMenuCtx Title={({ data }) => data?.orderId} />;
}
export function SalesProductionMobileMenu({ data }) {
    return (
        <TabsContent value="production">
            <MobileMenu>
                <MobileOption
                    href={`/sales/productions/${data?.slug}`}
                    onClick={closeModal as any}
                    Icon={Icons.open}
                    label="Open"
                />
                <MobileOption
                    onClick={() => {
                        sales.productionModal(data);
                    }}
                    Icon={Icons.flag}
                    label={data?.prodId ? "Update Assignment" : "Assign"}
                />
                {data?.prodStatus == "Completed" ? (
                    <MobileOption
                        onClick={() => {
                            sales.markIncomplete(data);
                            closeModal();
                        }}
                        Icon={Icons.flag}
                        label={"Incomplete"}
                    />
                ) : (
                    <>
                        <MobileOption
                            onClick={() => {
                                sales._clearAssignment(data);
                            }}
                            Icon={Icons.close}
                            label={"Clear Assign"}
                        />
                        <MobileOption
                            label="Mark as Completed"
                            Icon={Icons.check}
                            onClick={() => sales.completeProduction(data)}
                        />
                    </>
                )}
            </MobileMenu>
        </TabsContent>
    );
}
