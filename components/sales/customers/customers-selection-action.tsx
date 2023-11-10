"use client";

import { _mergeDuplicationAction } from "@/app/_actions/customers/merge-duplicate-action";

export default function CustomersSelectionAction({ items }: { items }) {
    async function mergeDuplicates() {
        await _mergeDuplicationAction(items.map(item => item.id));
    }
    return (
        <>
            {/* <Btn onClick={mergeDuplicates} className="h-8">
                <Icons.Merge className="w-4 h-4 mr-2" />
                Merge
            </Btn> */}
        </>
    );
}
