"use client";

import { store, useAppSelector } from "@/store";
import { ModalName, updateSlice } from "@/store/slicers";

export function openModal(name: ModalName, data) {
  store.dispatch(
    updateSlice({
      key: "modal",
      data: {
        name,
        data,
      },
    })
  );
}
export function closeModal(name: ModalName) {
  store.dispatch(
    updateSlice({
      key: "modal",
      data: {
        name: null,
        data: null,
      },
    })
  );
}
