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

interface NoteProps {
    tagFilters: TagFilters[];
    subject: string;
    headline?: string;
}
export default function Note(props: NoteProps) {
    const [notes, setNotes] = useState<GetNotes>([]);
    useEffect(() => {
        const tagQuery: SearchParamsType = {};
        props.tagFilters.map((f) => {
            tagQuery[`note.${f.tagName}`] = f.tagValue;
        });
        getNotesAction(tagQuery).then((result) => {
            console.log(result);
            setNotes(result);
        });
    }, []);
    async function onCreate(note) {
        if (!note) throw new Error("Note cannot be empty");
        const result = await createNoteAction({
            type: "sales",
            headline: props.headline,
            subject: props.subject,
            note,
            tags: props.tagFilters,
        });
        console.log(result);
    }
    return (
        <div className="">
            {!notes?.length ? (
                <div className="py-2 flex justify-center items-center gap-4">
                    {/* <div>No Note</div> */}
                    <NoteForm onCreate={onCreate} />
                </div>
            ) : (
                <></>
            )}
        </div>
    );
}
function NoteForm({ onCreate }) {
    const form = useForm({
        defaultValues: {
            note: "",
            formMode: false,
        },
    });
    const { formRef, onKeyDown } = useEnterSubmit();
    const [note, formMode] = form.watch(["note", "formMode"]);
    async function submit() {
        try {
            await onCreate(note);
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
                            Save
                        </Button>
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
