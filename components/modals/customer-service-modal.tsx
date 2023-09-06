"use client";

import React, { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { useAppSelector } from "@/store";
import { loadStaticList } from "@/store/slicers";
import { staticProjectsAction } from "@/app/_actions/community/projects";
import { IJobs } from "@/types/hrm";

import { ScrollArea } from "../ui/scroll-area";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

import { getProjectUnitList } from "@/app/_actions/customer-services/get-project-units";
import { IWorkOrder } from "@/types/customer-service";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DatePicker } from "../date-range-picker";
import AutoComplete2 from "../auto-complete-headless";
import { findHomeOwnerAction } from "@/app/_actions/customer-services/find-home-owner";
import { customerServiceSchema } from "@/lib/validations/customer-service";
import {
  createCustomerService,
  updateCustomerService,
} from "@/app/_actions/customer-services/save-customer-service";

export default function CustomerServiceModal() {
  const route = useRouter();
  const [isSaving, startTransition] = useTransition();
  const form = useForm<IWorkOrder>({
    defaultValues: {
      meta: {},
    },
  });

  async function submit(data) {
    startTransition(async () => {
      // if(!form.getValues)
      try {
        const isValid = customerServiceSchema.parse(form.getValues());
        const data = form.getValues();
        if (data.id) await updateCustomerService(data.id, data as any);
        else await createCustomerService(data as any);
        closeModal();
        toast.message("Success!");
        route.refresh();
      } catch (error) {
        console.log(error);
        toast.message("Invalid Form");
        return;
      }
    });
  }
  const projects = useAppSelector((state) => state?.slicers?.staticProjects);
  useEffect(() => {
    loadStaticList("staticProjects", projects, staticProjectsAction);
  }, []);
  async function init(data) {
    let formData: IWorkOrder = data;
    if (!formData)
      formData = {
        requestDate: new Date(),
        status: "Pending",
        meta: {
          lotBlock: "",
        },
      } as any;
    const pid = projects.find((p) => p.title == formData.projectName)?.id;
    if (pid) loadUnits(pid);
    if (!formData.meta.lotBlock) {
      const { lot, block } = formData;
      if (lot && block) formData.meta.lotBlock = `${lot}/${block}`;
    }
    form.reset({
      ...formData,
    });
    setTab("general");
    // setAddCost(null as any);
  }

  async function loadUnits(projectId) {
    const ls = await getProjectUnitList(projectId);
    setUnits(ls.filter((u) => u.lot && u.block));
  }

  const [units, setUnits] = useState<{ id; lotBlock; lot; block }[]>([]);

  const [tab, setTab] = useState("general");
  const [prevTab, setPrevTab] = useState<any>([]);
  function _setTab(t) {
    setPrevTab([tab, ...prevTab]);
    setTab(t);
  }
  function resetFields(k) {
    k.map((v) => form.setValue(v, null));
  }
  async function findHomeOwner(unit) {
    const [projectName, id] = form.getValues(["projectName", "id"]);
    if (!id) {
      Object.entries(
        await findHomeOwnerAction(projectName, unit.lot, unit.block)
      ).map(([k, v]) => form.setValue(k as any, v));
    }
  }
  return (
    <BaseModal<IJobs | undefined>
      className="sm:max-w-[550px]"
      onOpen={(data) => {
        init(data);
      }}
      onClose={() => {}}
      modalName="customerServices"
      Title={({ data }) => (
        <div className="flex space-x-2 items-center">
          {prevTab?.length > 0 && (
            <Button
              onClick={() => {
                const [tab1, ...tabs] = prevTab;
                setTab(tab1);
                setPrevTab(tabs);
                const unitFields = [];
                if (tab1 == "unit") resetFields(unitFields);
                if (tab1 == "project")
                  resetFields(["lot", "block", ...unitFields]);
              }}
              className="h-8 w-8 p-0"
              variant="ghost"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {
            {
              project: "Select Project",
              unit: "Select Unit",
              tasks: "Task Information",
              general: "Other Information",
            }[tab]
          }
        </div>
      )}
      Content={({ data }) => (
        <div>
          <ScrollArea className="h-[350px] pr-4">
            <Tabs defaultValue={tab} className="">
              <TabsList className="hidden">
                <TabsTrigger value="project" />
                <TabsTrigger value="unit" />
                <TabsTrigger value="general" />
              </TabsList>

              <TabsContent value="general">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    {/* <Label>Project</Label> */}
                    <AutoComplete2
                      label="Project"
                      form={form}
                      formKey={"projectName"}
                      options={projects}
                      itemText={"title"}
                      itemValue={"title"}
                      onChange={(e: any) => {
                        loadUnits(e.data.id);
                        form.setValue("lot", e.data.lot);
                        form.setValue("block", e.data.block);
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    {/* <Label>Project</Label> */}
                    <AutoComplete2
                      label="Unit"
                      form={form}
                      formKey={"meta.lotBlock"}
                      options={units}
                      itemText={"lotBlock"}
                      itemValue={"lotBlock"}
                      onChange={(e: any) => {
                        console.log(e);
                        form.setValue("lot", e.data.lot);
                        form.setValue("block", e.data.block);
                        findHomeOwner(e.data);
                      }}
                    />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label>Supervisor</Label>
                    <Input
                      placeholder=""
                      className="h-8"
                      {...form.register("supervisor")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Request Date</Label>
                    <DatePicker
                      format={"YYYY-MM-DD"}
                      className="flex-1 w-full h-8"
                      setValue={(e) => form.setValue("requestDate", e)}
                      value={form.getValues("requestDate")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                      onValueChange={(v) => form.setValue("status", v)}
                      defaultValue={form.getValues("status") as any}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {[
                            "Pending",
                            "Scheduled",
                            "Incomplete",
                            "Completed",
                          ].map((opt, _) => (
                            <SelectItem key={_} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Home Owner</Label>
                    <Input className="h-8" {...form.register("homeOwner")} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Home/Cell</Label>
                    <Input className="h-8" {...form.register("homePhone")} />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label>Home Address</Label>
                    <Input className="h-8" {...form.register("homeAddress")} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Schedule Date</Label>
                    <DatePicker
                      format={"YYYY-MM-DD"}
                      className="flex-1 w-full h-8"
                      setValue={(e) => form.setValue("scheduleDate", e)}
                      value={form.getValues("scheduleDate")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Schedule Time</Label>
                    <Select
                      onValueChange={(v) => form.setValue("scheduleTime", v)}
                      defaultValue={form.getValues("scheduleTime") as any}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {["8AM - 12PM", "1PM to 4PM"].map((opt, _) => (
                            <SelectItem key={_} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label>Work Description</Label>
                    <Textarea
                      className="h-8"
                      {...form.register("description")}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </div>
      )}
      Footer={({ data }) => {
        if (tab == "general")
          return (
            <div className="space-x-4 items-center flex">
              <Btn
                isLoading={isSaving}
                onClick={submit}
                size="sm"
                type="submit"
              >
                Submit
              </Btn>
            </div>
          );
        if (tab == "tasks")
          return (
            <Btn onClick={() => {}} size="sm">
              Proceed
            </Btn>
          );
      }}
    />
  );
}
