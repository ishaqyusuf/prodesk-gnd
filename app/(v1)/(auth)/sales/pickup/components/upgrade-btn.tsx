"use client";

import { Button } from "@/components/ui/button";
import { upgradeDeliveries } from "../_action/upgrade-deliveries";
import { toast } from "sonner";

export default function UpgradeBtn() {
    return (
        <div>
            <Button
                onClick={() => {
                    upgradeDeliveries().then((d) => {
                        toast.success("Done!");
                        console.log(d);
                    });
                }}
            >
                Upgrade
            </Button>
        </div>
    );
}
