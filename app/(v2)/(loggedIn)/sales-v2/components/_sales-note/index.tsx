"use client";

import useFn from "@/hooks/use-fn";
import { getSalesNote } from "./_actions/get-sales-notes";

export default function SalesNotes({ salesId }) {
    const { data } = useFn(() => getSalesNote(salesId));

    return <div>{data?.id}</div>;
}
