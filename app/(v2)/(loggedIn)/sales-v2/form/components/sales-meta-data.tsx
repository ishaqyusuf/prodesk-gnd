"use client";

import { InfoLine } from "../../../sales/edit/components/sales-details-section";
import { useDykeForm } from "../_hooks/form-context";
import ControlledSelect from "@/components/common/controls/controlled-select";
import { useEffect, useState } from "react";
import ControlledInput from "@/components/common/controls/controlled-input";
import salesData from "../../../sales/sales-data";
import DateControl from "@/_v2/components/common/date-control";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";

export default function SalesMetaData() {
    const form = useDykeForm();
    const profiles = form.getValues("data.profiles");

    const profile = form.watch("order.meta.sales_profile");
    useEffect(() => {
        const p = profiles.find((p) => p.label == profile);
        form.setValue("order.paymentTerm", p?.meta?.net as any);
        form.setValue("order.goodUntil", p?.goodUntil);
    }, [profile]);
    const type = form.getValues("order.type");
    return (
        <div className="xl:col-span-3 grid gap-2 xl:grid-cols-2 xl:gap-x-4">
            <InfoLine label="Sales Rep:">
                <span>{form.getValues("salesRep.name")}</span>
            </InfoLine>
            <InfoLine label="Profile">
                <ControlledSelect
                    control={form.control}
                    size="sm"
                    className="min-w-[150px]"
                    name="order.meta.sales_profile"
                    options={profiles}
                />
            </InfoLine>
            <InfoLine label="Q.B Order #">
                <ControlledInput
                    size="sm"
                    control={form.control}
                    name="order.meta.qb"
                />
            </InfoLine>
            <InfoLine label="Delivery">
                <ControlledSelect
                    size="sm"
                    control={form.control}
                    className="min-w-[150px]"
                    name="order.deliveryOption"
                    options={salesData.delivery}
                />
            </InfoLine>
            <InfoLine label="Mockup %">
                <ControlledInput
                    control={form.control}
                    type="number"
                    size="sm"
                    name="order.meta.mockupPercentage"
                />
            </InfoLine>
            {type == "order" ? (
                <InfoLine label="Payment Term">
                    <ControlledSelect
                        control={form.control}
                        size="sm"
                        className="min-w-[150px]"
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
            <div className="grid grid-cols-2 gap-2 items-center xl:col-span-2">
                <InfoLine label="Tax">
                    <ControlledCheckbox
                        switchInput
                        className="h-8"
                        name="order.meta.tax"
                    />
                </InfoLine>
                <InfoLine label="Component Price">
                    <ControlledCheckbox
                        switchInput
                        className="h-8"
                        name="order.meta.calculatedPriceMode"
                    />
                </InfoLine>
            </div>
        </div>
    );
}
