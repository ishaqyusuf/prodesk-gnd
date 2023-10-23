"use client";

import React, { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

import { useForm } from "react-hook-form";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { emailSchema } from "@/lib/validations/email";
import { ICustomer } from "@/types/customers";
import { CustomerTypes } from "@prisma/client";
import { saveCustomer } from "@/app/_actions/sales/sales-customers";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../ui/select";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

import { updateCustomerAction } from "@/app/_actions/sales/customer.crud";
import { staticCustomerProfilesAction } from "@/app/_actions/sales/sales-customer-profiles";
import refresh from "@/lib/refresh";
import { ISalesOrder, ISalesPickup } from "@/types/sales";
import { _createPickup } from "@/app/_actions/sales/_sales-pickup";
import { DatePicker } from "../date-range-picker";

export default function PickupModal() {
    const [isSaving, startTransition] = useTransition();
    const form = useForm<ISalesPickup>({
        defaultValues: {
            meta: {}
        }
    });
    async function submit(order: ISalesOrder) {
        startTransition(async () => {
            try {
                const data = form.getValues();
                if (!data.pickupAt) data.pickupAt = new Date();
                await _createPickup(order.id, data);

                closeModal();
                toast.message("Saved!");
                refresh();
            } catch (error) {
                console.log(error);
                toast.message("Invalid Form");
                return;
            }
        });
    }

    async function init(order: ISalesOrder, pickup?: ISalesPickup) {
        form.reset({
            pickupAt: new Date(),
            pickupBy: order.customer?.name
        });
    }
    return (
        <BaseModal<{ order: ISalesOrder; pickup?: ISalesPickup }>
            className="sm:max-w-[450px]"
            onOpen={data => {
                init(data.order, data.pickup);
            }}
            onClose={() => {}}
            modalName="pickup"
            Title={({ data: order }) => <div>Customer Form</div>}
            Content={({ data: order }) => (
                <div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2 col-span-2">
                            <Label>Pickup By</Label>
                            <Input
                                placeholder=""
                                className="h-8"
                                {...form.register("pickupBy")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Pickup Date</Label>
                            <DatePicker
                                format={"YYYY-MM-DD"}
                                className="flex-1 w-full h-8"
                                {...form.register("pickupAt")}
                            />
                        </div>
                    </div>
                </div>
            )}
            Footer={({ data }) => (
                <Btn
                    isLoading={isSaving}
                    onClick={() => submit(data?.order as any)}
                    size="sm"
                    type="submit"
                >
                    Save
                </Btn>
            )}
        />
    );
}
