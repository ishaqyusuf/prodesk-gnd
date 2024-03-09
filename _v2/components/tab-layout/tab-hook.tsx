import { ICan } from "@/types/auth";
import { useSession } from "next-auth/react";
import { useState } from "react";

export function useTab() {
    const { data: session } = useSession({
        required: false,
    });
    const can = session?.can;
    const [tabs, setTabs] = useState<{ title: string; path: string }[]>([]);
    return {
        tabs,
        setTabs,
        reset() {
            setTabs([]);
        },
        registerTab(
            title,
            path,
            canAccess?: (can: ICan) => boolean | undefined
        ) {
            const permission = canAccess ? canAccess(can || {}) : true;
            if (permission) {
                setTabs((prevTabs) => [...prevTabs, { title, path }]);
            }
        },
    };
}
