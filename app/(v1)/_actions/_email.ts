"use server";

import { env } from "@/env.mjs";
import { resend } from "@/lib/resend";

interface Props {
    from;
    user;
    subject;
    react;
    // to,
}

export async function _email({ from, user, subject, react }: Props) {
    const isProd = env.NEXT_PUBLIC_NODE_ENV === "production";
    // console.log(isProd, env.NEXT_PUBLIC_NODE_ENV);
    // return;
    await resend.emails.send({
        from,
        // to:  "ishaqyusuf024@gmail.com",
        to: isProd ? user.email : "ishaqyusuf024@gmail.com",
        // cc: isProd ? [] : "ishaqyusuf024@gmail.com",
        subject,
        react,
    });
}
