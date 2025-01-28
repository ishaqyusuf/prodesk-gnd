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
] as const;

export const noteSchema = z.object({
    "note.status": z.enum(noteStatus).optional(),
});
export type FilterKeys = keyof typeof noteSchema._type;
export const noteParamsParser: {
    [k in FilterKeys]: any;
} = {
    "note.status": parseAsString,
};
