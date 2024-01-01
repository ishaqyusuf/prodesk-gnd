"use client";

import { createPortal } from "react-dom";

interface Props {
  nodeId;
  children;
}
export default function Portal({ nodeId, children }: Props) {
  const node = document.getElementById(nodeId);
  if (node) return createPortal(<>{children}</>, node);
  return null;
}
