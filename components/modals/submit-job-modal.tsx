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
import { InstallCostingTemplate } from "@/types/community";
import { useAppSelector } from "@/store";
import { loadStaticList } from "@/store/slicers";
import {
  saveProject,
  staticProjectsAction,
} from "@/app/_actions/community/projects";
import { HomeJobList, IJobs, IUser } from "@/types/hrm";

import {
  PrimaryCellContent,
  SecondaryCellContent,
} from "../columns/base-columns";
import { ScrollArea } from "../ui/scroll-area";
import { getJobCostData, getUnitJobs } from "@/app/_actions/hrm-jobs/job-units";
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
import {
  createJobAction,
  updateJobAction,
} from "@/app/_actions/hrm-jobs/create-job";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  loadStatic1099Contractors,
  staticLoadTechEmployees,
} from "@/app/_actions/hrm/get-employess";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ModalInterface {
  data: IJobs | undefined;
  defaultTab?;
}
export default function SubmitJobModal({ type = "installation" }: { type? }) {
  const route = useRouter();
  const [isSaving, startTransition] = useTransition();
  const form = useForm<IJobs>({
    defaultValues: {
      meta: {},
    },
  });

  async function submit(data) {
    startTransition(async () => {
      // if(!form.getValues)
      try {
        // const isValid = employeeSchema.parse(form.getValues());
        const { homeData, unit, project, ...job } = form.getValues();
        job.type = type;
        job.amount = 0;
        [job.meta.addon, job.meta.taskCost, job.meta.additional_cost].map(
          (n) => n > 0 && (job.amount += Number(n))
        );

        if (!job.id) await createJobAction(job as any);
        else await updateJobAction(job as any);
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

  async function init(data: ModalInterface) {
    loadStaticList("staticProjects", projects, staticProjectsAction);
    form.reset(
      !data?.data
        ? {}
        : {
            ...data.data,
          }
    );
    setTab(data?.defaultTab || "project");
    setAddCost(null as any);
    if (data?.data && data?.defaultTab == "tasks") {
      const costdat = await getJobCostData(
        data?.data?.unitId,
        data?.data.subtitle
      );
      // console.log(costdat);
      setUnitCosting(costdat as any);
    }
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
  async function loadUnits(projectId) {
    const ls = await getUnitJobs(projectId);
    form.setValue("meta.addon", ls.addon || 0);
    setUnits(ls.homeList);
    // form.setValue('homeData',ls.homeList)
  }
  async function selectUnit(unit: HomeJobList) {
    form.setValue("homeData", unit);
    form.setValue("unitId", unit.id);
    setUnitCosting(unit.costing.costings);

    const costData = {};
    Object.entries(unit.costing.costings).map(([k, v]) => {
      costData[k] = {
        cost: costSetting?.meta?.list?.find((d) => d.uid == k)?.cost,
      };
    });
    form.setValue("meta.costData", costData);
    form.setValue("subtitle", unit.name);
    _setTab("tasks");
  }
  const [units, setUnits] = useState<HomeJobList[]>([]);
  const [costChart, setCostChart] = useState<any>({});
  const [addCost, setAddCost] = useState(0);
  const [costSetting, setCostSetting] = useState<InstallCostSettings>(
    {} as any
  );
  const [unitCosting, setUnitCosting] = useState<
    InstallCostingTemplate<number | string>
  >({} as any);
  const techEmployees = useAppSelector((s) => s.slicers.staticInstallers);
  useEffect(() => {
    getSettingAction<InstallCostSettings>("install-price-chart").then((res) => {
      setCostSetting(res);
    });

    loadStaticList(
      "staticInstallers",
      techEmployees,
      loadStatic1099Contractors
    );
  }, []);

  const [tab, setTab] = useState("project");
  const [prevTab, setPrevTab] = useState<any>([]);
  function _setTab(t) {
    setPrevTab([tab, ...prevTab]);
    setTab(t);
  }
  function calculateTasks() {
    // form.setValue('amount')
    const tasks = form.getValues("meta.costData");
    let total = 0;
    Object.entries(tasks).map(([k, v]) => {
      if (v.qty > 0 && v.cost > 0) total += Number(v.qty) * Number(v.cost);
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
    <BaseModal<ModalInterface>
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
                  "meta.costData",
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
              user: "Select Employee",
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
                <TabsTrigger value="user" />
                <TabsTrigger value="project" />
                <TabsTrigger value="unit" />
                <TabsTrigger value="tasks" />
                <TabsTrigger value="general" />
              </TabsList>
              <TabsContent value="user">
                <div className="flex flex-col divide-y">
                  {techEmployees?.map((user) => (
                    <Button
                      onClick={() => {
                        form.setValue("userId", user.id);

                        _setTab("project");
                      }}
                      variant={"ghost"}
                      key={user.id}
                      className=""
                    >
                      <p className="flex w-full">{user.name}</p>
                    </Button>
                  ))}
                </div>
              </TabsContent>
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
                    onClick={() => {
                      form.setValue("meta.addon", null as any);
                      _setTab("general");
                    }}
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costSetting?.meta?.list
                        ?.filter((v) => unitCosting[v.uid])
                        .map((row, i) => {
                          return (
                            <Row
                              key={i}
                              form={form}
                              row={row}
                              unitCosting={unitCosting}
                            />
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
                    <Input className="h-8" {...form.register("description")} />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label>Install Report</Label>
                    <Textarea className="h-8" {...form.register("note")} />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label>Co-Worker</Label>
                    <Select
                      onValueChange={(e) => form.setValue("coWorkerId", +e)}
                      defaultValue={form.getValues("coWorkerId")?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectGroup>
                          {techEmployees?.map((profile, _) => (
                            <SelectItem key={_} value={profile.id?.toString()}>
                              {profile.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
            <Btn onClick={calculateTasks} size="sm">
              Proceed
            </Btn>
          );
      }}
    />
  );
}
export function Row({ form, row, unitCosting }) {
  return (
    <TableRow>
      <TableCell className="px-1">
        <PrimaryCellContent>{row.title}</PrimaryCellContent>
        <SecondaryCellContent>
          <Money value={row.cost} />
          {" per qty"}
        </SecondaryCellContent>
      </TableCell>
      <TableCell className="px-1">
        <div className="flex items-center space-x-0.5">
          <div className="hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="flex h-8">
                  <span className="">
                    {form.getValues(
                      `meta.costData.${row.uid}
                                          .qty` as any
                    ) || "-"}
                  </span>
                  {" /"}
                  {unitCosting[row.uid]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[185px]">
                <DropdownMenuItem
                  onClick={(e) => {
                    form.setValue(`meta.costData.${row.uid}.qty`, null as any);
                  }}
                >
                  -
                </DropdownMenuItem>
                {Array(unitCosting[row.uid])
                  .fill(null as any)
                  .map((_, i) => (
                    <DropdownMenuItem
                      onClick={(e) => {
                        form.setValue(`meta.costData.${row.uid}.qty`, i + 1);
                      }}
                      key={i}
                    >
                      {i + 1}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Input
            max={unitCosting[row.uid]}
            min={0}
            value={form.getValues(`meta.costData.${row.uid}.qty` as any)}
            onBlur={(e) => {
              const maxQty = Number(unitCosting[row.uid]);
              let val = form.getValues(`meta.costData.${row.uid}.qty` as any);
              if (val > maxQty) {
                toast.error("max qty exceeded");

                form.setValue(`meta.costData.${row.uid}.qty`, maxQty);
              }
              if (val < 0) {
                toast.error("min qty exceeded");
                form.setValue(`meta.costData.${row.uid}.qty`, 0);
              }
            }}
            onChange={(e) => {
              let v = +e.target.value;
              form.setValue(`meta.costData.${row.uid}.qty`, v);
            }}
            type="number"
            className="w-16 h-8 hiddens"
          />
          <Label className="px-1">
            {" /"}
            {unitCosting[row.uid]}
          </Label>
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
}
