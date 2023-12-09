"use client";

import { ModalName, dispatchSlice } from "@/store/slicers";

export function openModal<T>(name: ModalName, data?: T) {
    setTimeout(() => {
        dispatchSlice("modal", {
            name,
            data,
        });
    }, 1000);
}
export function closeModal(name?: ModalName) {
    dispatchSlice("modal", {
        name: null,
        data: null,
    });
}
export type EmailTypes = "sales";
export function openEmailComposer(
    data,
    extras: { type: EmailTypes; parentId?: number }
) {
    openModal("email", { data, ...extras });
}
