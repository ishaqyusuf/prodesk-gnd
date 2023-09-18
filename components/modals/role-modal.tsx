"use client";

import React, { useTransition } from "react";

import { useRouter } from "next/navigation";

import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

import { useForm } from "react-hook-form";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { EmployeeProfile } from "@prisma/client";

import { saveEmployeeProfile } from "@/app/_actions/hrm/employee-profiles";
import { permissions } from "@/lib/data/role";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import { _saveRole, getRoleForm } from "@/app/_actions/hrm/roles.crud";
import { IRoleForm } from "@/types/hrm";
import { roleSchema } from "@/lib/validations/hrm";

export default function RoleModal() {
  const route = useRouter();
  const [isSaving, startTransition] = useTransition();
  const form = useForm<IRoleForm>({
    defaultValues: {},
  });
  async function submit(data) {
    startTransition(async () => {
      // if(!form.getValues)
      try {
        const formData = form.getValues();
        // const isValid = roleSchema.parse(formData);

        const role = await _saveRole(formData);
        closeModal();
        toast.message("Success!");
        route.refresh();
      } catch (error) {
        toast.message("Invalid Form");
        return;
      }
    });
  }

  async function init(data) {
    const resp = await getRoleForm(data?.id);

    form.reset({
      ...resp,
      name: data?.name,
    });
  }
  return (
    <BaseModal<EmployeeProfile | undefined>
      className="sm:max-w-[450px]"
      onOpen={(data) => {
        init(data);
      }}
      onClose={() => {}}
      modalName="role"
      Title={({ data }) => (
        <div>
          {data?.id ? "Edit" : "Create"}
          {" Role"}
        </div>
      )}
      Content={({ data }) => (
        <div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2 col-span-2">
              <Label>Role Name</Label>
              <Input
                placeholder=""
                className="h-8"
                {...form.register("name")}
              />
            </div>
            <div className="col-span-2 grid gap-2">
              <div className="grid grid-cols-7 gap-3 bg-accent p-1">
                <Label className="col-span-5">Permission</Label>
                <Label className="col-span-1 text-center">View</Label>
                <Label className="col-span-1 text-center">Edit</Label>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="divide-y divide-accent">
                  {permissions.map((permission) => (
                    <div
                      key={permission}
                      className="grid grid-cols-7 p-1 gap-2 items-center"
                    >
                      <Label className="capitalize col-span-5">
                        {permission}
                      </Label>
                      {["view", "edit"].map((k) => (
                        <div key={k} className="text-center">
                          <Checkbox
                            checked={form.getValues(
                              `permission.${k} ${permission}` as any
                            )}
                            onCheckedChange={(e) => {
                              form.setValue(
                                `permission.${k} ${permission}` as any,
                                e
                              );
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      )}
      Footer={({ data }) => (
        <Btn
          isLoading={isSaving}
          onClick={() => submit(data)}
          size="sm"
          type="submit"
        >
          Save
        </Btn>
      )}
    />
  );
}
