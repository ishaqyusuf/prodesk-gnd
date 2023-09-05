"use client";

import { IProject } from "@/types/community";
import { Cell } from "../columns/base-columns";
import Money from "../money";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState, useTransition } from "react";
import { updateProjectMeta } from "@/app/_actions/community/projects";
import Btn from "../btn";
import { WorkOrders } from "@prisma/client";
import { IWorkOrder } from "@/types/customer-service";
import { useAppSelector } from "@/store";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

interface Props {
  workOrder: IWorkOrder;
}
export default function WorkOrderTechCell({ workOrder }: Props) {
  const techEmployees = useAppSelector((s) => s.slicers.staticTechEmployees);
  const [isPending, startTransition] = useTransition();
  async function submit() {
    startTransition(async () => {
      setIsOpen(false);
    });
  }
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Cell>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className="flex h-8  data-[state=open]:bg-muted"
          >
            <span className="whitespace-nowrap">
              {workOrder.tech ? workOrder.tech.name : "Select"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[185px] p-4 grid gap-2">
          {techEmployees?.map((e) => (
            <DropdownMenuItem key={e.id}>{e.name}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Cell>
  );
}
