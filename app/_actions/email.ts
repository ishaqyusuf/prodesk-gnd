"use server";

import { EmailProps } from "@/types/email";
import { _email } from "./_email";
import MailComposer from "@/components/emails/mail-composer";
import { prisma } from "@/db";
import dayjs from "dayjs";
import { myId } from "./utils";
import { transformEmail } from "@/lib/email-transform";

export async function sendMessage(data: EmailProps) {
  const trs = transformEmail(data.subject, data.body, data.data);
  await _email({
    from: data.from,
    to: data.to as string,
    parentId: data.parentId,
    subject: trs.subject,
    react: MailComposer({
      body: trs.body,
    }),
  });
  await prisma.inbox.create({
    data: {
      from: data.from,
      type: data.type,
      body: data.body,
      senderId: (await myId()) as number,
      to: data.to,
      subject: data?.subject,
      parentId: data.parentId,
      createdAt: new Date(),
    },
  });
}
