import { useState } from "react";
import { TagFilters } from "./utils";
import { GetNotes } from "./actions/get-notes-action";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import FormInput from "@/components/common/controls/form-input";

interface NoteProps {
    tagFilters: TagFilters[];
    subject: string;
    headline?: string;
}
export default function Note(props: NoteProps) {
    const [notes, setNotes] = useState<GetNotes>([]);
    return (
        <div className="">
            {!notes?.length ? (
                <div className="py-2 flex justify-center items-center gap-4">
                    {/* <div>No Note</div> */}
                    <NoteForm />
                </div>
            ) : (
                <></>
            )}
        </div>
    );
}
function NoteForm({}) {
    const form = useForm({
        defaultValues: {
            note: "",
            formMode: false,
        },
    });
    const [note, formMode] = form.watch(["note", "formMode"]);
    async function save() {
        //
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
                        <Button onClick={save} size="xs">
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
