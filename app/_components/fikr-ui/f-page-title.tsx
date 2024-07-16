"use client";

import { createPortal } from "react-dom";

export default function FTitle({ children }) {
    const Element = document?.getElementById("headerTitleSlot");
    if (!Element) return;
    return createPortal(
        <div className="text-lg xl:text-xl font-medium">{children}</div>,
        Element
    );
}
