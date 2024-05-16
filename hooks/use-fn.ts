import { useEffect, useState } from "react";

type NonNullableAsyncReturnType<T extends (...args: any) => Promise<any>> =
    NonNullable<Awaited<ReturnType<T>>>;
export default function useFn<T>(fn: T) {
    const [data, setData] = useState<NonNullableAsyncReturnType<T>>(
        null as any
    );
    useEffect(() => {
        (async () => {
            const resp = await (fn as any)();
            setData(resp);
        })();
    }, []);

    return {
        data,
    };
}
