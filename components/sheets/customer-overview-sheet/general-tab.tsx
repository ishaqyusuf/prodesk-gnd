"use client";

import {
    CustomerGeneralInfo,
    getCustomerGeneralInfoAction,
} from "@/actions/get-customer-general-info";
import { useCustomerOverviewQuery } from "@/hooks/use-customer-overview-query";
import { useEffect, useState } from "react";
import { GeneralTabLoading } from "./general-tab.loading";
import { timeout } from "@/lib/timeout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/format";

export function GeneralTab({}) {
    const query = useCustomerOverviewQuery();
    const generatTab = query.params?.tab == "general";
    const [data, setData] = useState<CustomerGeneralInfo | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function load() {
            setLoading(true);
            await timeout(1000);
            const result = await getCustomerGeneralInfoAction(query.accountNo);
            setData(result);
            setLoading(false);
        }
        if (generatTab) {
            load();
        }
    }, [generatTab, query.accountNo]);
    if (loading) return <GeneralTabLoading />;
    return (
        <div>
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={data.avatarUrl} alt={data?.displayName} />
                    <AvatarFallback>
                        {getInitials(data.displayName)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-lg font-semibold">
                        {data.displayName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Customer ID: {data.accountNo}
                    </p>
                </div>
            </div>
        </div>
    );
}
