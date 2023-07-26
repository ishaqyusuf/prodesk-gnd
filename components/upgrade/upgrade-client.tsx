"use client";

import dbUpgrade from "@/app/actions/upgrade/upgrade";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import Btn from "../form/btn";
import { Button } from "../ui/button";

export default function UpgradeClient() {
  const [isPending, startTransaction] = useTransition();

  const upgrade = useCallback(async () => {
    // startTransaction(async () => {
    const c = await dbUpgrade();

    toast.success("completed");
    // });
  }, []);
  return (
    <>
      <Btn isLoading={isPending} onClick={() => upgrade()}>
        Upgrade
      </Btn>
    </>
  );
}
