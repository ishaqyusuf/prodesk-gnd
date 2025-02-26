"use client";

import { GetSalesCustomerSystemData } from "@/actions/get-sales-customer-system-data";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";

export default function CustomerProfileUpdateModal({ phoneNo, profileId }) {
    const [data, setData] = useState<GetSalesCustomerSystemData>(null);
    useEffect(() => {
        if (phoneNo) {
            //
        }
    }, [profileId, phoneNo]);
    const opened = data != null;
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
