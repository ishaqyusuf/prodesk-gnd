"use server";

import { prisma } from "@/db";
import bcrypt from "bcrypt";

export async function changeIzriEmail() {
  const user = await prisma.users.findFirst({
    where: {
      name: {
        contains: "izri",
      },
    },
  });
  const password = await bcrypt.hash("Millwork", 10);
  if (!user) throw new Error("error");
  await prisma.users.update({
    where: {
      id: user.id,
    },
    data: {
      password,
      email: "izrispam@gmail.com",
    },
  });
  console.log(user);
}
