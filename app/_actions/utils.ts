"use server";

import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
export async function myId() {
  const data = await getServerSession(authOptions);
  return data?.user.id;
}
