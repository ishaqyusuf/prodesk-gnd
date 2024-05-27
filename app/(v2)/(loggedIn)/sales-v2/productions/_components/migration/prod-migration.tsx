"use client";

import { Button } from "@/components/ui/button";
import { migrationProductions } from "./migrate-productions";
import { toast } from "sonner";
import { useTransition } from "react";
import Btn from "@/components/_v1/btn";

export default function ProdMigration() {
    const [transition, startTransition] = useTransition();
    async function migrate() {
        startTransition(async () => {
            const resp = await migrationProductions();
            console.log(resp);
            toast.message("done");
            // if (resp.count) migrate();
        });
    }
    return (
        <div>
            <Btn isLoading={transition} onClick={migrate}>
                Migrate
            </Btn>
        </div>
    );
}
