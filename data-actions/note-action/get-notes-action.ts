"use server";

import { SearchParamsType } from "@/components/(clean-code)/data-table/search-params";
import { prisma } from "@/db";
import { NoteTagNames } from "./constants";
import { AsyncFnType } from "@/types";

export type GetNotes = AsyncFnType<typeof getNotesAction>;
export async function getNotesAction(query: SearchParamsType) {
    const notes = await prisma.notePad.findMany({
        where: {
            tags: {
                some: {
                    tagName: "salesId" as NoteTagNames,
                    tagValue: query["note.salesId"],
                },
            },
        },
        include: {
            tags: true,
            comments: {
                include: {
                    note: true,
                },
            },
        },
    });
    return notes;
}
