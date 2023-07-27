"use client";
import { nav } from "@/lib/navs";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AuthPage({}) {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/signin");
    },
  });
  let sb = nav(session);
  if (!sb) return;
  redirect(sb.homeRoute);
  return <></>;
}
