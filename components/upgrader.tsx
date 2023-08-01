"use client";

// import dbUpgrade from "@/app/actions/upgrade/upgrade";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { dbUpgradeAction } from "@/app/_actions/db-upgrade";
import Btn from "./btn";

export default function Upgrader() {
  const [isPending, startTransaction] = useTransition();

  const upgrade = useCallback(async () => {
    startTransaction(async () => {
      await dbUpgradeAction();
      toast.success("completed");
    });
  }, []);
  return (
    <>
      <Btn isLoading={isPending} onClick={() => upgrade()}>
        Upgrade
      </Btn>
    </>
  );
}
