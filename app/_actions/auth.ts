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
import { _email } from "./_email";
import { FROM_EMAILS } from "@/enums/email";

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
  await _email({
    user: user,
    from: FROM_EMAILS.ohno,
    react: PasswordResetRequestEmail({
      firstName: user?.name ?? undefined,
      token,
    }),
    subject: "Security Alert: Forgot Password OTP",
  });
  await resend.emails.send({
    from: "GND-Prodesk<ohno@gndprodesk.com>",
    // to: "ishaqyusuf024@gmail.com",
    to: user.email,
    subject: "Security Alert: Forgot Password OTP",
    react: PasswordResetRequestEmail({
      firstName: user?.name ?? undefined,
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
  await prisma.passwordResets.update({
    where: {
      id: tok.id,
    },
    data: {
      usedAt: new Date(),
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
