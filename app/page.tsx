"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Home() {
  const { data } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/signin");
    },
  });
  return <div></div>;
}
