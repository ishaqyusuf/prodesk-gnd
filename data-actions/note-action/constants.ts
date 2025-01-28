import { parseAsString } from "nuqs";
import { z } from "zod";

export const noteTypes = ["sales"] as const;

export const noteStatus = [
    "public",
    "admin",
    "dispatch",
    "production",
] as const;

export const tagNames = [
    "itemControlUID",
    "deliveryId",
    "salesId",
    "salesItemId",
    "salesAssignment",
] as const;
export type NoteTagNames = (typeof tagNames)[number];
export const noteSchema = z.object({
    "note.status": z.enum(noteStatus).optional(),
    "note.salesId": z.string().optional(),
});
export type FilterKeys = keyof typeof noteSchema._type;
export const noteParamsParser: {
    [k in FilterKeys]: any;
} = {
    "note.status": parseAsString,
    "note.salesId": parseAsString,
};
