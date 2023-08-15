"use client";

import { ModalName, dispatchSlice } from "@/store/slicers";

export function openModal<T>(name: ModalName, data?: T) {
  dispatchSlice("modal", {
    name,
    data,
  });
}
export function closeModal(name?: ModalName) {
  dispatchSlice("modal", {
    name: null,
    data: null,
  });
}
