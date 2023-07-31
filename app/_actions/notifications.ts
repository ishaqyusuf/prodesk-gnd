"use server";

import { prisma } from "@/db";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";

export async function loadNotifications() {
  const data = await getServerSession(authOptions);
  const noficiations = await prisma.notifications.findMany({
    where: {
      userId: data?.user?.id,
    },
  });
}
