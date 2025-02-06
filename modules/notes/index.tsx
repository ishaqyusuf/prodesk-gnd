import { useEffect, useState } from "react";
import { TagFilters } from "./utils";
import { GetNotes, getNotesAction } from "./actions/get-notes-action";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import FormInput from "@/components/common/controls/form-input";
import { useEnterSubmit } from "@/hooks/use-enter-submit";
import { toast } from "sonner";
import { createNoteAction } from "./actions/create-note-action";
import { SearchParamsType } from "@/components/(clean-code)/data-table/search-params";
import { formatDate } from "@/lib/use-day";
import { NoteTagStatus, NoteTagTypes } from "./constants";
import FormSelect from "@/components/common/controls/form-select";
import { Menu } from "@/components/(clean-code)/menu";
import { Progress } from "@/components/(clean-code)/progress";
import { useAction } from "next-safe-action/hooks";

interface NoteProps {
    tagFilters: TagFilters[];
    subject: string;
    headline?: string;
    typeFilters?: NoteTagTypes[];
    statusFilters?: NoteTagStatus[];
}
export default function Note(props: NoteProps) {
    const [notes, setNotes] = useState<GetNotes>([]);
    useEffect(() => {
        const tagQuery: SearchParamsType = {};
        ["status", "type"].map((s) => {
            if (!props.tagFilters.find((a) => a.tagName == s))
                props.tagFilters.push({
                    tagName: s as any,
                    tagValue: "",
                });
        });
        props.tagFilters.map((f) => {
            if (f.tagName == "type" || f.tagName == "status") return;
            tagQuery[`note.${f.tagName}` as any] = f.tagValue;
        });
        console.log(tagQuery);
        getNotesAction(tagQuery).then((result) => {
            console.log(result);
            setNotes(result);
        });
    }, []);
    async function onCreate(note, type, status) {
        if (!note) throw new Error("Note cannot be empty");
        const tags = props.tagFilters.filter(
            (a) => !["status", "type"].includes(a.tagName)
        );
        tags.push({
            tagName: "status",
            tagValue: status,
        });
        tags.push({
            tagName: "type",
            tagValue: type,
        });
        const result = await createNoteAction({
            // type: "sales",
            type,
            status,
            headline: props.headline,
            subject: props.subject,
            note,
            tags,
        });
        console.log(result);
        setNotes((current) => {
            return [result, ...current] as any;
        });
    }
    return (
        <div className="">
            {!notes?.length ? (
                <div className="py-2 flex justify-center items-center gap-4">
                    {/* <div>No Note</div> */}
                    <NoteForm
                        statusFilters={props.statusFilters}
                        typeFilters={props.typeFilters}
                        onCreate={onCreate}
                    />
                </div>
            ) : (
                <>
                    <div className="py-2 flex justify-end items-center gap-4">
                        {/* <div>No Note</div> */}
                        <NoteForm
                            statusFilters={props.statusFilters}
                            typeFilters={props.typeFilters}
                            onCreate={onCreate}
                        />
                    </div>
                    {notes?.map((note) => (
                        <div key={note.id} className="border-b flex">
                            <span className="text-muted-foreground mr-4">
                                {formatDate(note.createdAt)}
                            </span>
                            <div className="inline-flex gap-2 items-center">
                                <NoteTag note={note} tag={note.status} />
                                <NoteTag note={note} tag={note.type} />
                                <span>{note.note}</span>
                            </div>
                        </div>
                    ))}
                </>
            )}
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
function NoteForm({ onCreate, statusFilters, typeFilters }) {
    // const action = useAction()
    const form = useForm({
        defaultValues: {
            note: "",
            formMode: false,
            type: typeFilters?.[0] || "",
            status: statusFilters?.[0] || "",
        },
    });
    const { formRef, onKeyDown } = useEnterSubmit();
    const [note, formMode, type, status] = form.watch([
        "note",
        "formMode",
        "type",
        "status",
    ]);
    async function submit() {
        try {
            await onCreate(note, type, status);
            toast.success("Saved.");
            form.reset();
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
            else toast.error("Unable to complete");
        }
    }
    return (
        <>
            {formMode ? (
                <Form {...form}>
                    <div className="w-full">
                        <div className="flex gap-2 w-full">
                            <FormInput
                                className="flex-1"
                                size="sm"
                                placeholder={"Note"}
                                control={form.control}
                                name="note"
                            />
                            <Button
                                onClick={(e) => {
                                    form.setValue("formMode", false);
                                }}
                                className=""
                                variant="destructive"
                                size="xs"
                            >
                                Cancel
                            </Button>
                            <Button onClick={submit} size="xs">
                                Saves
                            </Button>
                        </div>
                        <div className="flex gap-4">
                            {
                                <FormSelect
                                    disabled={!statusFilters?.length}
                                    className="w-32"
                                    options={statusFilters}
                                    control={form.control}
                                    name="status"
                                    size="sm"
                                />
                            }
                            <FormSelect
                                options={typeFilters}
                                control={form.control}
                                className="w-32"
                                name="type"
                                size="sm"
                            />
                        </div>
                    </div>
                </Form>
            ) : (
                <Button
                    onClick={(e) => {
                        form.setValue("formMode", true);
                    }}
                    size="xs"
                    variant="link"
                >
                    <Icons.add className="size-4" />
                    Add Note
                </Button>
            )}
        </>
    );
}
