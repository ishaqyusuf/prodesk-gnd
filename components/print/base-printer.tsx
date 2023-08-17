"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  children?;
  id?;
}
export default function BasePrinter({ children, id }: Props) {
  return (
    <>
      {createPortal(
        <div id={id} className="hidden print:block">
          {children}
        </div>,
        document.body
      )}
    </>
  );
}
