"use client";

import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Fragment } from "react";
import { openModal } from "@/lib/modal";
import { ModalName } from "@/store/slicers";
import LinkableNode from "./link-node";
import { Icons } from "./icons";
import { ICan } from "@/types/auth";
import AuthGuard from "./auth-guard";

interface Props {
  title;
  subtitle?;
  newLink?;
  Action?;
  modalData?;
  buttonText?;
  newDialog?: ModalName;
  ButtonIcon?;
  permissions?: (keyof ICan)[];
}
export default function PageHeader({
  title,
  newLink,
  subtitle,
  Action,
  permissions,
  newDialog,
  buttonText = "New",
  ButtonIcon = "add",
  modalData,
}: Props) {
  const Node = newLink ? Link : Fragment;
  const BtnIcon = Icons[ButtonIcon];
  return (
    <div className="flex items-center justify-between space-y-2">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <AuthGuard permissions={permissions || []}>
          {(newLink || newDialog) && (
            <Button
              onClick={() => {
                newDialog && openModal(newDialog);
              }}
              size="sm"
              className="h-8"
            >
              <LinkableNode className="inline-flex items-center" href={newLink}>
                <BtnIcon className="h-4 w-4 mr-2" />
                <span>{buttonText} </span>
              </LinkableNode>
            </Button>
          )}
        </AuthGuard>
        {Action && <Action />}
      </div>
    </div>
  );
}
