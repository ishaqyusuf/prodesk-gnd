"use client";

import { Button } from "@/components/ui/button";
import { stepUpdateDebug } from "./debug-steps";

export default function MigrateStepDuplicateUid() {
    return (
        <>
            <Button
                onClick={async () => {
                    const resp = await stepUpdateDebug();
                    console.log(resp);
                }}
            >
                Step UID
            </Button>
        </>
    );
}
