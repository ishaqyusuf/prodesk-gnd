"use client";

import { openMergeDuplicatesModal } from "@/app/(v2)/(loggedIn)/sales/_modals/merge-customer-modal/open";
import Btn from "../../btn";
import { Icons } from "../../icons";

export default function CustomersBatchAction({ items }: { items }) {
    async function mergeDuplicates() {
        openMergeDuplicatesModal(items);
    }
    return (
        <>
            {items.length > 1 && (
                <Btn onClick={mergeDuplicates} className="h-8">
                    <Icons.Merge className="w-4 h-4 mr-2" />
                    Merge
                </Btn>
            )}
        </>
    );
}
