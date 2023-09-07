"use client";
import { useAppSelector } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Refresh() {
  const route = useRouter();
  const refreshToken = useAppSelector((s) => s.slicers.refreshToken);
  useEffect(() => {
    if (refreshToken) {
      console.log("REFRESHING....", refreshToken);
      route.refresh();
    }
  }, [refreshToken]);
  return <></>;
}
