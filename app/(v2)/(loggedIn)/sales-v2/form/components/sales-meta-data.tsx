"use client";

import { InfoLine } from "../../../sales/edit/components/sales-details-section";
import { useDykeForm } from "../_hooks/form-context";
import ControlledSelect from "@/components/common/controls/controlled-select";
import { useEffect, useState } from "react";
import { getCustomerProfileList } from "../_action/get-customer-profiles";
import ControlledInput from "@/components/common/controls/controlled-input";
import salesData from "../../../sales/sales-data";
import DateControl from "@/_v2/components/common/date-control";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

export default function SalesMetaData() {
    const form = useDykeForm();

    const [profiles, setProfiles] = useState([]);
    useEffect(() => {
        async function initialize() {
            setProfiles(await getCustomerProfileList());
        }
        initialize();
    }, []);
    const type = form.watch("order.type");
    return (
        <div className="xl:col-span-3 grid gap-2 xl:grid-cols-2 xl:gap-x-4">
            <InfoLine label="Sales Rep:">
                <span>{form.getValues("salesRep.name")}</span>
            </InfoLine>
            <InfoLine label="Profile">
                <ControlledSelect
                    control={form.control}
                    name="order.meta.sales_profile"
                    options={profiles}
                />
            </InfoLine>
            <InfoLine label="Q.B Order #">
                <ControlledInput control={form.control} name="order.meta.qb" />
            </InfoLine>
            <InfoLine label="Delivery">
                <ControlledSelect
                    control={form.control}
                    name="order.deliveryOption"
                    options={salesData.delivery}
                />
            </InfoLine>
            <InfoLine label="Mockup %">
                <ControlledInput
                    control={form.control}
                    name="order.meta.mockupPercentage"
                />
            </InfoLine>
            {type == "order" ? (
                <InfoLine label="Payment Term">
                    <ControlledSelect
                        control={form.control}
                        name="order.paymentTerm"
                        options={salesData.paymentTerms}
                    />
                </InfoLine>
            ) : (
                <InfoLine label="Good Until">
                    <DateControl
                        className="h-8 min-w-[150px]"
                        name="order.goodUntil"
                    />
                </InfoLine>
            )}
            <InfoLine label="Tax">
                <ControlledCheckbox
                    switchInput
                    className="h-8 min-w-[150px]"
                    name="order.meta.tax"
                />
            </InfoLine>
        </div>
    );
}
