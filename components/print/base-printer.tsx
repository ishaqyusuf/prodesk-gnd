"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  children?;
}
export default function BasePrinter({ children }: Props) {
  return (
    <>
      {createPortal(
        <div className="hidden print:block">{children}</div>,
        document.body
      )}
    </>
  );
}
