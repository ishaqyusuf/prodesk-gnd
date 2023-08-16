"use client";

import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Fragment } from "react";
import { openModal } from "@/lib/modal";
import { ModalName } from "@/store/slicers";

interface Props {
  title;
  subtitle?;
  newLink?;
  newDialog?: ModalName;
}
export default function PageHeader({
  title,
  newLink,
  subtitle,
  newDialog,
}: Props) {
  const Node = newLink ? Link : Fragment;
  return (
    <div className="flex items-center justify-between space-y-2">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center space-x-2">
        {(newLink || newDialog) && (
          <Button
            onClick={() => {
              newDialog && openModal(newDialog);
            }}
            size="sm"
            className="h-8"
          >
            <Node className="inline-flex items-center" href={newLink}>
              <Plus className="h-4 w-4 mr-2" />
              <span>New </span>
            </Node>
          </Button>
        )}
      </div>
    </div>
  );
}
