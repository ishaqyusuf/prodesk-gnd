"use server";

import { transformEmail } from "./transform";

export interface EmailProps {
    subject;
    data;
    body;
    attachments?: {
        url?: string;
        fileName?: string;
    }[];
}
export async function sendEmail(props: EmailProps) {
    const { subject, body } = transformEmail(props);
}
