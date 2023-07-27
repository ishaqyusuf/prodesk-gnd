"use server";

import { ResetPasswordRequestInputs } from "@/components/forms/reset-password-form";
import { ResetPasswordFormInputs } from "@/components/forms/reset-password-form-step2";
import { prisma } from "@/db";
import { randomInt } from "crypto";
import dayjs from "dayjs";
import bcrypt from "bcrypt";
import { resend } from "@/lib/resend";
import PasswordResetRequestEmail from "@/components/emails/password-reset-request-email";
import { env } from "@/env.mjs";

export async function resetPasswordRequest({
  email,
}: ResetPasswordRequestInputs) {
  const user = await prisma.users.findFirst({
    where: {
      email,
    },
  });
  if (!user) return null;
  const token = randomInt(100000, 999999);
  const r = await prisma.passwordResets.create({
    data: {
      email,
      createdAt: new Date(),
      token: token.toString(),
    },
  });
  await resend.emails.send({
    from: env.EMAIL_FROM_ADDRESS,
    to: "ishaqyusuf024@gmail.com",
    subject: "Password Reset Request",
    react: PasswordResetRequestEmail({
      firstName: user?.name ?? undefined,
      fromEmail: env.EMAIL_FROM_ADDRESS,
      token,
    }),
  });
  return { id: user.id };
}
export async function resetPassword({
  code,
  confirmPassword,
}: ResetPasswordFormInputs) {
  const tok = await prisma.passwordResets.findFirst({
    where: {
      createdAt: {
        gte: dayjs()
          .subtract(5, "minutes")
          .toISOString(),
      },
      token: code,
    },
  });
  if (!tok) {
    throw new Error("Invalid or Expired Token");
  }
  const password = await bcrypt.hash(confirmPassword, 10);
  await prisma.users.updateMany({
    where: {
      email: tok.email,
    },
    data: {
      password,
    },
  });
  //   const user = await prisma.users.findFirst({
  //     where: {
  //       email,
  //     },
  //   });
  //   if (!user) return null;
  //   return { id: user.id };
}
