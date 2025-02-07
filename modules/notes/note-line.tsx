import { Menu } from "@/components/(clean-code)/menu";
import { GetNotes } from "./actions/get-notes-action";
import { Progress } from "@/components/(clean-code)/progress";
import { formatDate } from "@/lib/use-day";

export function NoteLine({ note }: { note: GetNotes[number] }) {
    const event = note?.events?.[0];
    return (
        <div key={note.id} className="border-b flex">
            <span className="text-muted-foreground mr-4">
                {formatDate(note.createdAt)}
            </span>
            <div className="inline-flex flex-1 gap-2 items-center">
                {/* <NoteTag note={note} tag={note.status} /> */}
                <NoteTag note={note} tag={note.type} />
                <div className="flex-1">{note.note}</div>
                {!event || <div>{formatDate(event.eventDate)}</div>}
            </div>
        </div>
    );
}
function NoteTag({ tag, note }) {
    if (!tag?.tagValue) return null;
    return (
        <Menu
            Trigger={
                <Progress>
                    <Progress.Status noDot>{tag.tagValue}</Progress.Status>
                </Progress>
            }
        >
            <Menu.Item>Item 1</Menu.Item>
        </Menu>
    );
}
