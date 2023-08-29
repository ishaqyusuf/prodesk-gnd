"use client";

import React, { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

import { useFieldArray, useForm } from "react-hook-form";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { emailSchema } from "@/lib/validations/email";
import { ICustomer } from "@/types/customers";
import { CustomerTypes } from "@prisma/client";
import {
  getCustomerProfiles,
  saveCustomer,
} from "@/app/_actions/sales/sales-customers";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { IHome, IProject } from "@/types/community";
import { useAppSelector } from "@/store";
import { loadStaticList } from "@/store/slicers";
import { staticBuildersAction } from "@/app/_actions/community/builders";
import { projectSchema } from "@/lib/validations/community-validations";
import {
  saveProject,
  staticProjectsAction,
} from "@/app/_actions/community/projects";
import { HomeJobList, IJobs, IUser } from "@/types/hrm";
import AutoComplete2 from "../auto-complete-headless";
import { staticRolesAction } from "@/app/_actions/hrm/static-roles";
import { employeeSchema } from "@/lib/validations/hrm";
import {
  createEmployeeAction,
  saveEmployeeAction,
} from "@/app/_actions/hrm/save-employee";
import {
  PrimaryCellContent,
  SecondaryCellContent,
} from "../columns/base-columns";
import { ScrollArea } from "../ui/scroll-area";
import { getUnitJobs } from "@/app/_actions/hrm-jobs/job-units";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Money from "../money";
import { getSettingAction } from "@/app/_actions/settings";
import { InstallCostSettings } from "@/types/settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { createJobAction } from "@/app/_actions/hrm-jobs/create-job";
import { sum } from "@/lib/utils";

export default function SubmitJobModal({ type = "installation" }: { type? }) {
  const route = useRouter();
  const [isSaving, startTransition] = useTransition();
  const form = useForm<
    IJobs & {
      costChart: {
        [id in string]: { cost: number; qty: number; total: number };
      };
    }
  >({
    defaultValues: {
      meta: {},
    },
  });
  const [page, setPage] = useState(1);
  async function submit(data) {
    startTransition(async () => {
      // if(!form.getValues)
      try {
        // const isValid = employeeSchema.parse(form.getValues());
        const { homeData, unit, project, costChart, ...job } = form.getValues();
        job.type = type;
        job.amount = +sum([addon, taskCost, job.meta.additional_cost]);
        if (!job.id) await createJobAction(job as any);
        // if (!data?.id)
        //   await createEmployeeAction({
        //     ...form.getValues(),
        //   });
        // else
        //   await saveEmployeeAction({
        //     ...form.getValues(),
        //   });
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

  async function init(data) {
    setPage(1);
    loadStaticList("staticProjects", projects, staticProjectsAction);

    form.reset(
      !data
        ? {}
        : {
            ...data,
          }
    );
    setTab("project");
    setAddCost(null as any);
  }

  async function selectProject(project) {
    const projectId = project?.id;
    form.setValue("projectId", projectId);
    form.setValue("project", project as any);
    form.setValue("unit", null as any);
    form.setValue("title", project.title);
    if (project?.id) {
      await loadUnits(projectId);
      _setTab("unit");
    } else setTab("general");
  }
  const [units, setUnits] = useState<HomeJobList[]>([]);
  const [costChart, setCostChart] = useState<any>({});
  const [addCost, setAddCost] = useState(0);

  useEffect(() => {
    getSettingAction<InstallCostSettings>("install-price-chart").then((res) => {
      // console.log(res)
      const puc: any = {};
      res?.meta?.list?.map((ls) => {
        puc[ls.title] = {
          cost: ls.cost || 0,
        };
      });
      // console.log(puc);
      setCostChart(puc);
    });
  }, []);
  async function loadUnits(projectId) {
    const ls = await getUnitJobs(projectId);

    form.setValue("meta.addon", ls.addon || 0);
    setUnits(ls.homeList);
    // form.setValue('homeData',ls.homeList)
  }
  async function selectUnit(unit: HomeJobList) {
    form.setValue("homeData", unit);
    form.setValue("unitId", unit.id);
    replace(
      unit.costing.costings
        .map((c) => {
          const { cost, title, maxQty } = c;
          return { cost: cost || costChart[title]?.cost, title, maxQty };
        })
        .filter((c) => c.cost > 0) as any
    );
    form.setValue("subtitle", unit.name);
    _setTab("tasks");
  }
  const [tab, setTab] = useState("project");
  const [prevTab, setPrevTab] = useState<any>([]);
  function _setTab(t) {
    setPrevTab([tab, ...prevTab]);
    setTab(t);
  }
  // const costData = form.watch("homeData");
  const { fields, replace, update } = useFieldArray({
    control: form.control,
    name: "meta.cost_data",
  });
  function calculateTasks() {
    // form.setValue('amount')
    const tasks = form.getValues("meta.cost_data");
    let total = 0;
    tasks.map((task, i) => {
      const c = costChart[task.title]?.cost;
      if (task.qty > 0 && c > 0) {
        const tot = task.qty * c;
        form.setValue(`meta.cost_data.${i}.total`, tot);
        total += tot;
      }
    });
    form.setValue("meta.taskCost", total);
    // form.setValue("amount", total + addon);
    _setTab("general");
  }
  const amount = form.watch("amount");
  const taskCost = form.watch("meta.taskCost");
  const addon = form.watch("meta.addon");
  // const addCost = form.watch("meta.additional_cost");
  function resetFields(k) {
    k.map((v) => form.setValue(v, null));
  }
  return (
    <BaseModal<IJobs | undefined>
      className="sm:max-w-[550px]"
      onOpen={(data) => {
        init(data);
      }}
      onClose={() => {}}
      modalName="submitJob"
      Title={({ data }) => (
        <div className="flex space-x-2 items-center">
          {prevTab?.length > 0 && (
            <Button
              onClick={() => {
                const [tab1, ...tabs] = prevTab;
                setTab(tab1);
                setPrevTab(tabs);
                const unitFields = [
                  "homeData",
                  "meta.taskCosts",
                  "meta.cost_data",
                  "unitId",
                  "subtitle",
                ];
                if (tab1 == "unit") resetFields(unitFields);
                if (tab1 == "project")
                  resetFields([
                    "projectId",
                    "meta.addon",
                    "title",
                    "unit",
                    "project",
                    ...unitFields,
                  ]);
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
                <TabsTrigger value="tasks" />
                <TabsTrigger value="general" />
              </TabsList>
              <TabsContent value="project">
                <div className="flex flex-col divide-y">
                  <Button
                    onClick={() => _setTab("general")}
                    variant={"ghost"}
                    className=""
                  >
                    <p className="flex w-full">Custom Task</p>
                  </Button>
                  {projects?.map((project) => (
                    <Button
                      onClick={() => selectProject(project)}
                      variant={"ghost"}
                      key={project.id}
                      className=""
                    >
                      <p className="flex w-full">{project.title}</p>
                    </Button>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="unit">
                <div className="flex flex-col divide-y">
                  <Button
                    onClick={() => _setTab("general")}
                    variant={"ghost"}
                    className=""
                  >
                    <p className="flex w-full">Custom Task</p>
                  </Button>
                  {units?.map((unit) => (
                    <Button
                      onClick={() => selectUnit(unit)}
                      variant={"ghost"}
                      key={unit.id}
                      className=""
                    >
                      <p className="flex w-full">{unit.name}</p>
                    </Button>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="tasks">
                <div className="col-span-2">
                  <Table className="">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-1">Task</TableHead>
                        <TableHead className="px-1">Qty</TableHead>
                        {/* <TableHead className="px-1 text-right" align="right">
                          Total
                        </TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields?.map((row, i) => {
                        return (
                          <TableRow key={i}>
                            <TableCell className="px-1">
                              <PrimaryCellContent>
                                {row.title}
                              </PrimaryCellContent>
                              <SecondaryCellContent>
                                {/* <Money
                                  value={form.getValues(
                                    `costChart.${row.title}.cost`
                                  )}
                                /> */}
                                <Money value={row.cost} />
                                {" per qty"}
                              </SecondaryCellContent>
                            </TableCell>
                            <TableCell className="px-1">
                              <div className="flex items-center space-x-0.5">
                                <Input
                                  max={+row.maxQty}
                                  value={form.getValues(
                                    `meta.cost_data.${i}.qty` as any
                                  )}
                                  onChange={(e) => {
                                    const v = +e.target.value;

                                    const cost = form.getValues(
                                      `costChart.${row.title}.cost`
                                    );
                                    form.setValue(
                                      `meta.cost_data.${i}.qty` as any,
                                      v
                                    );
                                    form.setValue(
                                      `meta.cost_data.${i}.total` as any,
                                      (cost || 0) * (v || 0)
                                    );
                                  }}
                                  type="number"
                                  className="w-16 h-8"
                                />
                                <span className="px-1">
                                  {" /"}
                                  {row?.maxQty}
                                </span>
                              </div>
                            </TableCell>
                            {/* <TableCell className="px-1 w-28" align="right">
                              <SecondaryCellContent>
                                <Money
                                  value={form.getValues(
                                    `meta.cost_data.${i}.total` as any
                                  )}
                                />
                              </SecondaryCellContent>
                            </TableCell> */}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="general">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2 col-span-2">
                    <Label>Title</Label>
                    <Input
                      placeholder=""
                      disabled={form.getValues("projectId") != null}
                      className="h-8"
                      {...form.register("title")}
                    />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label>Subtitle</Label>
                    <Input
                      placeholder=""
                      disabled={form.getValues("unitId") != null}
                      className="h-8"
                      {...form.register("subtitle")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Additional Cost ($)</Label>
                    <Input
                      className="h-8"
                      type="number"
                      // value={addCost}
                      // onChange={(e) => setAddCost(+e.target.value)}
                      {...form.register("meta.additional_cost")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Reason</Label>
                    <Input
                      className="h-8"
                      type="number"
                      {...form.register("description")}
                    />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label>Install Report</Label>
                    <Textarea className="h-8" {...form.register("note")} />
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
              <div className="">
                <Label>Task Costs</Label>
                <SecondaryCellContent>
                  <Money value={taskCost} />
                </SecondaryCellContent>
              </div>
              <div className="">
                <Label>Addon</Label>
                <SecondaryCellContent>
                  <Money value={addon} />
                </SecondaryCellContent>
              </div>
              {/* <div className="">
                <Label>Total Cost</Label>
                <SecondaryCellContent>
                  <Money value={addon + taskCost + addCost} />
                </SecondaryCellContent>
              </div> */}
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
            <Btn onClick={calculateTasks} size="sm" variant="secondary">
              Proceed
            </Btn>
          );
      }}
    />
  );
}
