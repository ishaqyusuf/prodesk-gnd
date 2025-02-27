"use client";

import {
    _getSalesCustomerSystemData,
    GetSalesCustomerSystemData,
} from "@/actions/get-sales-customer-system-data";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";

export default function CustomerProfileUpdateModal({ phoneNo, profileId }) {
    const [data, setData] = useState<GetSalesCustomerSystemData>(null);
    useEffect(() => {
        console.log({ phoneNo, profileId });

        _getSalesCustomerSystemData(phoneNo, profileId).then((result) => {
            console.log({ result });

            setData(result);
        });
    }, [phoneNo, profileId]);
    useEffect(() => {}, [profileId]);
    const opened = data?.profileConflicts != null && profileId && phoneNo;
    return null;
    return (
        <Dialog
            open={opened}
            onOpenChange={(e) => {
                setData(null);
            }}
        >
            <DialogContent>
                <DialogTitle>Update Customer Profile</DialogTitle>
            </DialogContent>
        </Dialog>
    );
}
