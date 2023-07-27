"use client";

// import dbUpgrade from "@/app/actions/upgrade/upgrade";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

export default function Upgrader() {
  const [isPending, startTransaction] = useTransition();

  const upgrade = useCallback(async () => {
    // startTransaction(async () => {
    // const c = await dbUpgrade();

    toast.success("completed");
    // });
  }, []);
  return (
    <>
      <Button onClick={() => upgrade()}>Upgrade</Button>
    </>
  );
}
