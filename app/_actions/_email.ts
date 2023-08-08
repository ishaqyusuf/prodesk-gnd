"use server";

import { env } from "@/env.mjs";
import { resend } from "@/lib/resend";

interface Props {
  from;
  user;
  subject;
  react;
}

export async function _email({ from, user, subject, react }: Props) {
  const isProd = env.NODE_ENV === "production";
  await resend.emails.send({
    from,
    // to:  "ishaqyusuf024@gmail.com",
    to: isProd ? user.email : "pcruz321@gmail.com",
    cc: isProd ? [] : "ishaqyusuf024@gmail.com",
    subject,
    react,
  });
}
