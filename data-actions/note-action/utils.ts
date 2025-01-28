import { NoteTagNames } from "./constants";
import { GetNotes } from "./get-notes-action";

export type TagFilters = ReturnType<typeof tagFilter>;
export function filterNotesByTags(notes: GetNotes, tagFilters: TagFilters[]) {
    const filteredNotes = notes.filter((note) => {
        return tagFilters.every((tf) => {
            const matchedTag = note.tags.find((t) => t.tagName == tf.tagName);
            return matchedTag?.tagValue == tf?.value;
        });
        return true;
    });
}
export function tagFilter(tagName: NoteTagNames, value) {
    return { tagName, value };
}
export function composeNoteTags(tagFilters: TagFilters[]) {
    return {};
}
export function composeNoteTagToken(tags: TagFilters[]) {
    return tags
        .sort((a, b) => a.tagName.localeCompare(b.tagName))
        .map((tag) => `${tag.tagName}_is_${tag.value}`)
        .join("_and_");
}
export function noteTokenToObject(tok): TagFilters[] {
    return tok?.split("_and_").map((tok) => {
        const [tagName, value] = tok.split("_is_");
        return { tagName, value };
    });
}
