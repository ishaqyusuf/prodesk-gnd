import { isProdClient } from "@/lib/is-prod";
import { useEffect, useRef, useState } from "react";

export function useEffectAfterMount(fn, deps: any[] = []) {
    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current && !isProdClient) {
            console.log("BEFORE MOUNT");
            isMounted.current = true;
            return;
        }
        console.log("AFTER MOUNT");
        fn();
    }, deps);
}
