"use client";

import { Button } from "@/components/ui/button";
import { migrationProductions } from "./migrate-productions";

export default function ProdMigration() {
    async function migrate() {
        const resp = await migrationProductions();
        console.log(resp);
    }
    return (
        <div>
            <Button onClick={migrate}>Migrate</Button>
        </div>
    );
}
