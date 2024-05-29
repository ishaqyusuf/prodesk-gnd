"use client";

import { ServerPromiseType } from "@/types";
import { useEffect, useState } from "react";

interface Props {
    onSuccess?;
    onError?;
    transform?;
}
export default function useEffectLoader(fn, {}: Props) {
    type DataType = ServerPromiseType<typeof fn>["Response"];
    const [data, setData] = useState<DataType>();
    const [ready, setReady] = useState(false);
    useEffect(() => {
        fn().then((res) => {
            setData(res);
            setReady(true);
        });
    }, []);
    return {
        data,
        ready,
    };
}
