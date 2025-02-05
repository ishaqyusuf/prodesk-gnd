"use server";

import { SearchParamsType } from "@/components/(clean-code)/data-table/search-params";
import { prisma } from "@/db";
import { tagNames } from "../constants";
import { AsyncFnType } from "@/types";

export type GetNotes = AsyncFnType<typeof getNotesAction>;
export async function getNotesAction(query: SearchParamsType) {
    const tagQueries = tagNames
        .map((tag) => ({
            tagName: tag,
            tagValue: query[`note.${tag}`],
        }))
        .filter((a) => a.tagValue);
    if (!tagQueries.length) throw new Error("Invalid note query");

    const notes = await prisma.notePad.findMany({
        where: {
            tags: {
                some:
                    tagQueries.length == 1
                        ? tagQueries[0]
                        : {
                              AND: tagQueries,
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
