"use client";

// import dbUpgrade from "@/app/actions/upgrade/upgrade";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { dbUpgradeAction } from "@/app/_actions/upgrade/db-upgrade";
import Btn from "./btn";
import { fixSales } from "@/app/_actions/upgrade/fix-sales";
import {
  changeIzriEmail,
  fixUsersMeta,
} from "@/app/_actions/upgrade/hrm-upgrade";

export default function Upgrader() {
  const [isPending, startTransaction] = useTransition();

  const upgrade = useCallback(async () => {
    startTransaction(async () => {
      // await dbUpgradeAction();
      // await fixSales();
      // await changeIzriEmail();
      // console.log(await fixUsersMeta());
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
