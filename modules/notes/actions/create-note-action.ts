"use server";
import { user } from "@/app/(v1)/_actions/utils";
import { prisma } from "@/db";
import { TagFilters } from "../utils";

interface CreateNoteData {
    type;
    headline;
    subject;
    note;
    tags: TagFilters[];
}
export async function createNoteAction(data: CreateNoteData) {
    const auth = await user();
    const senderContactId = (
        await prisma.notePadContacts.upsert({
            where: {
                name_email_phoneNo: {
                    email: auth.email,
                    name: auth.name,
                    phoneNo: auth.phoneNo,
                },
            },
            update: {},
            create: {
                email: auth.email,
                name: auth.name,
                phoneNo: auth.phoneNo,
            },
        })
    ).id;
    const note = await prisma.notePad.create({
        data: {
            // type: data.type,
            headline: data.headline,
            note: data.note,
            subject: data.subject,
            // status: "public",
            senderContact: {
                connect: {
                    id: senderContactId,
                },
            },
            tags: {
                createMany: {
                    data: data.tags,
                },
            },
        },
    });
    return note;
}
