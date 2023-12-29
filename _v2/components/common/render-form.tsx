"use client";

import { Form } from "@/components/ui/form";
import { env } from "@/env.mjs";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
let reRender = 0;
export default function RenderForm({
    children,
    ...props
}: {
    children?;
} & any) {
    const isProd = env.NEXT_PUBLIC_NODE_ENV === "production";
    if (!isProd) reRender++;
    const form = useFormContext();
    // form.formState.isDirty
    return (
        <>
            <div
                className={cn(
                    isProd
                        ? "hidden"
                        : "fixed top-0 right-[50%] bg-red-500 rounded-full p-1 text-white text-xs  font-semibold px-2 leading-none z-[9999]"
                )}
            >
                <p>Render: {reRender}</p>
                <p>
                    Dirty Fields:{" "}
                    {Object.keys(form.formState.dirtyFields)?.length}
                </p>
                <p>Submission: {form.formState.submitCount}</p>
                {/* <p>Submission: {form.formState.}</p> */}
            </div>
            <Form {...props}>{children}</Form>
        </>
    );
}
