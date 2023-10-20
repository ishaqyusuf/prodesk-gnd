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
    staticProjectsAction
} from "@/app/_actions/community/projects";
import { HomeJobList, IJobs, IUser } from "@/types/hrm";

import {
    PrimaryCellContent,
    SecondaryCellContent
} from "../columns/base-columns";
import { ScrollArea } from "../ui/scroll-area";
import { getJobCostData, getUnitJobs } from "@/app/_actions/hrm-jobs/job-units";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../ui/table";
import Money from "../money";
import { getSettingAction } from "@/app/_actions/settings";
import { InstallCostLine, InstallCostSettings } from "@/types/settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import {
    createJobAction,
    updateJobAction
} from "@/app/_actions/hrm-jobs/create-job";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { loadStatic1099Contractors } from "@/app/_actions/hrm/get-employess";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../ui/select";
import { cn } from "@/lib/utils";
import AutoComplete from "../auto-complete";

interface ModalInterface {
    data: IJobs | undefined;
    defaultTab?;
}
export default function SubmitJobModal() {
    const route = useRouter();
    // const isPunchout = type == "punchout";
    const [isSaving, startTransition] = useTransition();
    const form = useForm<IJobs>({
        defaultValues: {
            meta: {}
        }
    });
    const type = form.watch("type");
    function is(_type: "punchout" | "deco-shutter" | "installation") {
        return type == _type;
    }
    const isPunchout = () => is("punchout");
    const isDecoShutter = () => is("deco-shutter");
    const isInstallation = () => is("installation");
    async function submit(data) {
        startTransition(async () => {
            // if(!form.getValues)
            try {
                // const isValid = employeeSchema.parse(form.getValues());
                const { homeData, unit, project, ...job } = form.getValues();
                // job.type = form.getValues("type");
                job.amount = 0;
                [
                    job.meta.addon,
                    job.meta.taskCost,
                    job.meta.additional_cost
                ].map(n => n > 0 && (job.amount += Number(n)));

                if (!job.id) await createJobAction(job as any);
                else await updateJobAction(job as any);
                closeModal();
                toast.message("Success!");
                route.refresh();
            } catch (error) {
                // console.log(error);
                toast.message("Invalid Form");
                return;
            }
        });
    }
    const projects = useAppSelector(state => state?.slicers?.staticProjects);

    async function init(data: IJobs, defaultTab) {
        form.reset();
        setTasks([]);

        loadStaticList("staticProjects", projects, staticProjectsAction);
        const __ = !data?.id
            ? {
                  title: "Custom Project",
                  type: data?.type,
                  meta: {}
              }
            : {
                  ...data
              };
        Object.entries(__).map(([k, v]) => form.setValue(k as any, v));

        setTab(defaultTab || "tasks");
        setAddCost(null as any);
        setUnitCosting({});
        if (data && defaultTab == "tasks") {
            const costdat = await getJobCostData(data?.homeId, data.subtitle);
            // console.log(costdat);
            setUnitCosting(costdat as any);
        }
    }
    async function selectProject(project) {
        // console.log(project);
        // return;
        const projectId = project?.id;
        form.setValue("unit", null as any);
        form.setValue("homeId", null as any);
        form.setValue("meta.costData", {});
        form.setValue("subtitle", null as any);
        form.setValue("title", project.title);
        form.setValue("project", project as any);
        setUnitCosting({});

        await loadUnits(projectId);

        // if (project?.id && type != "punchout") {
        //     await loadUnits(projectId);
        //     _setTab("unit");
        // } else setTab("general");
    }
    async function loadUnits(projectId) {
        setTasks([]);
        form.setValue("meta.addon", 0);
        if (!projectId) setUnits([]);
        else {
            const ls = await getUnitJobs(projectId, type);
            if (isInstallation()) form.setValue("meta.addon", ls.addon || 0);
            setUnits(ls.homeList);
            console.log(ls.homeList);
        }
        // form.setValue('homeData',ls.homeList)
    }
    async function selectUnit(unit: HomeJobList) {
        form.setValue("homeData", unit);
        setTasks([]);
        form.setValue("homeId", unit.id);
        if (unit.costing) {
            setUnitCosting(unit.costing);
            const costData = {};
            Object.entries(unit.costing).map(([k, v]) => {
                costData[k] = {
                    cost: costSetting?.meta?.list?.find(d => d.uid == k)?.cost
                };
            });
            form.setValue("meta.costData", costData);
        }
        form.setValue("subtitle", unit.name);
        const _tasks = costSetting?.meta?.list
            ?.filter(v => isDecoShutter() || unit?.costing?.[v.uid])
            ?.filter(
                v =>
                    (isDecoShutter() &&
                        v.title.toLowerCase() == "deco-shutters") ||
                    (!isDecoShutter() &&
                        v.title.toLowerCase() != "deco-shutters")
            );
        // console.log(costSetting);
        // console.log(costSetting?.meta?.list?.length);
        // console.log(_tasks);
        setTasks(_tasks || []);
        // _setTab("tasks");
    }
    const [units, setUnits] = useState<HomeJobList[]>([]);
    const [costChart, setCostChart] = useState<any>({});
    const [addCost, setAddCost] = useState(0);
    const [tasks, setTasks] = useState<InstallCostLine[]>([]);
    const [costSetting, setCostSetting] = useState<InstallCostSettings>(
        {} as any
    );
    const [unitCosting, setUnitCosting] = useState<
        InstallCostingTemplate<number | string>
    >({} as any);
    const techEmployees = useAppSelector(s => s.slicers.staticInstallers);
    useEffect(() => {
        getSettingAction<InstallCostSettings>("install-price-chart").then(
            res => {
                setCostSetting(res);
            }
        );
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
        setQ("");
    }
    function calculateTasks() {
        // form.setValue('amount')
        const tasks = form.getValues("meta.costData") || {};
        let total = 0;
        Object.entries(tasks).map(([k, v]) => {
            if (v.qty > 0 && v.cost > 0)
                total += Number(v.qty) * Number(v.cost);
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
        k.map(v => form.setValue(v, null));
    }
    const [q, setQ] = useState("");
    function search<T>(list: T[], key: keyof T) {
        return list;
        return list.filter(l =>
            (l?.[key] as any)?.toLowerCase()?.includes(q?.toString())
        );
    }
    function UnitForm() {
        return (
            <>
                <div className="grid gap-2">
                    <Label>Project</Label>
                    <AutoComplete
                        form={form}
                        formKey={`projectId`}
                        options={[
                            {
                                id: null,
                                title: "Custom Project"
                            },
                            ...(projects || [])
                        ]}
                        onChange={item => selectProject(item.data)}
                        itemText={"title"}
                        itemValue="id"
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Unit</Label>
                    <AutoComplete
                        form={form}
                        formKey={`homeId`}
                        uppercase
                        options={[
                            {
                                id: null,
                                name: "Custom",
                                costing: {
                                    costings: {}
                                }
                            },
                            ...units
                        ]}
                        onChange={item => selectUnit(item.data)}
                        itemText={"name"}
                        itemValue="id"
                    />
                </div>
            </>
        );
    }
    return (
        <BaseModal<ModalInterface>
            className="sm:max-w-[550px]"
            onOpen={data => {
                init(data?.data as any, data.defaultTab);
            }}
            onClose={() => {}}
            modalName="submitJob"
            Title={({ data }) =>
                isPunchout() ? (
                    <>Punchout Detail</>
                ) : (
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
                                        "homeId",
                                        "subtitle"
                                    ];
                                    if (tab1 == "unit") resetFields(unitFields);
                                    if (tab1 == "project")
                                        resetFields([
                                            "projectId",
                                            "meta.addon",
                                            "title",
                                            "unit",
                                            "project",
                                            ...unitFields
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
                                general: "Other Information"
                            }[tab]
                        }
                    </div>
                )
            }
            Content={({ data }) => (
                <div>
                    <Tabs defaultValue={tab} className="">
                        <TabsList className="hidden">
                            <TabsTrigger value="user" />
                            <TabsTrigger value="project" />
                            <TabsTrigger value="unit" />
                            <TabsTrigger value="tasks" />
                            <TabsTrigger value="general" />
                        </TabsList>
                        <TabsContent value="user">
                            {/* <div className="">
                <Input
                  placeholder="Search"
                  className="h-8"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div> */}
                            <ScrollArea className="h-[350px] pr-4">
                                <div className="flex flex-col divide-y">
                                    {search(techEmployees, "name")?.map(
                                        user => (
                                            <Button
                                                onClick={() => {
                                                    form.setValue(
                                                        "userId",
                                                        user.id
                                                    );

                                                    _setTab("tasks");
                                                }}
                                                variant={"ghost"}
                                                key={user.id}
                                                className=""
                                            >
                                                <p className="flex w-full">
                                                    {user.name}
                                                </p>
                                            </Button>
                                        )
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="project">
                            <ScrollArea className="h-[350px] pr-4">
                                <div className="flex flex-col divide-y">
                                    <Button
                                        onClick={() => _setTab("general")}
                                        variant={"ghost"}
                                        className=""
                                    >
                                        <p className="flex w-full">
                                            Custom Task
                                        </p>
                                    </Button>
                                    {projects?.map(project => (
                                        <Button
                                            onClick={() =>
                                                selectProject(project)
                                            }
                                            variant={"ghost"}
                                            key={project.id}
                                            className=""
                                        >
                                            <p className="flex w-full">
                                                {project.title}
                                            </p>
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="unit">
                            <ScrollArea className="h-[350px] pr-4">
                                <div className="flex flex-col divide-y">
                                    <Button
                                        onClick={() => {
                                            form.setValue(
                                                "meta.addon",
                                                null as any
                                            );
                                            _setTab("general");
                                        }}
                                        variant={"ghost"}
                                        className=""
                                    >
                                        <p className="flex w-full">
                                            Custom Task
                                        </p>
                                    </Button>
                                    {units?.map(unit => (
                                        <Button
                                            onClick={() => selectUnit(unit)}
                                            variant={"ghost"}
                                            key={unit.id}
                                            className=""
                                        >
                                            <p className="flex w-full">
                                                {unit.name}
                                            </p>
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="tasks">
                            <ScrollArea className="h-[350px] pr-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <UnitForm />
                                </div>
                                <div
                                    className={cn(
                                        "col-span-2",
                                        isPunchout() && "hidden"
                                    )}
                                >
                                    <Table className="">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="px-1">
                                                    Task
                                                </TableHead>
                                                <TableHead className="px-1">
                                                    Qty
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {tasks.map((row, i) => {
                                                return (
                                                    <Row
                                                        key={i}
                                                        form={form}
                                                        row={row}
                                                        unitCosting={
                                                            unitCosting
                                                        }
                                                    />
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="general">
                            <ScrollArea className="h-[350px] pr-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    {isPunchout() && <UnitForm />}
                                    <div className="grid gap-2 col-span-2">
                                        <Label>Job Title</Label>
                                        <Input
                                            placeholder=""
                                            disabled={
                                                form.getValues("projectId") !=
                                                null
                                            }
                                            className="h-8"
                                            {...form.register("title")}
                                        />
                                    </div>
                                    <div className="grid gap-2 col-span-2">
                                        <Label>Description</Label>
                                        <Input
                                            placeholder=""
                                            disabled={
                                                form.getValues("homeId") != null
                                            }
                                            className="h-8"
                                            {...form.register("subtitle")}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>
                                            {isInstallation()
                                                ? "Additional Cost ($)"
                                                : "Cost ($)"}
                                        </Label>
                                        <Input
                                            className="h-8"
                                            type="number"
                                            // value={addCost}
                                            // onChange={(e) => setAddCost(+e.target.value)}
                                            {...form.register(
                                                "meta.additional_cost"
                                            )}
                                        />
                                    </div>
                                    {!isPunchout() && (
                                        <div className="grid gap-2">
                                            <Label>Reason</Label>
                                            <Input
                                                className="h-8"
                                                {...form.register(
                                                    "description"
                                                )}
                                            />
                                        </div>
                                    )}
                                    <div className="grid gap-2 col-span-2">
                                        <Label>Report</Label>
                                        <Textarea
                                            className="h-8"
                                            {...form.register(
                                                !isInstallation()
                                                    ? "description"
                                                    : "note"
                                            )}
                                        />
                                    </div>
                                    {!isDecoShutter() && (
                                        <div
                                            className={cn(
                                                "grid gap-2",
                                                !isPunchout() && "col-span-2"
                                            )}
                                        >
                                            <Label>Co-Worker</Label>
                                            <Select
                                                onValueChange={e =>
                                                    form.setValue(
                                                        "coWorkerId",
                                                        +e
                                                    )
                                                }
                                                defaultValue={form
                                                    .getValues("coWorkerId")
                                                    ?.toString()}
                                            >
                                                <SelectTrigger className="h-8">
                                                    <SelectValue placeholder="" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectGroup>
                                                        {techEmployees?.map(
                                                            (profile, _) => (
                                                                <SelectItem
                                                                    key={_}
                                                                    value={profile.id?.toString()}
                                                                >
                                                                    {
                                                                        profile.name
                                                                    }
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
            Footer={({ data }) => {
                if (tab == "general")
                    return (
                        <div className="space-x-4 items-center flex">
                            {!isPunchout() && (
                                <>
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
                                    </div>{" "}
                                </>
                            )}
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
    const qty = form.getValues(`meta.costData.${row.uid}.qty` as any);
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
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex h-8"
                                >
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
                            <DropdownMenuContent
                                align="end"
                                className="w-[185px]"
                            >
                                <DropdownMenuItem
                                    onClick={e => {
                                        form.setValue(
                                            `meta.costData.${row.uid}.qty`,
                                            null as any
                                        );
                                    }}
                                >
                                    -
                                </DropdownMenuItem>
                                {Array(unitCosting[row.uid])
                                    .fill(null as any)
                                    .map((_, i) => (
                                        <DropdownMenuItem
                                            onClick={e => {
                                                form.setValue(
                                                    `meta.costData.${row.uid}.qty`,
                                                    i + 1
                                                );
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
                        value={qty}
                        onBlur={e => {
                            const maxQty = Number(unitCosting[row.uid]);
                            let val = form.getValues(
                                `meta.costData.${row.uid}.qty` as any
                            );
                            if (val > maxQty) {
                                toast.error("max qty exceeded");

                                form.setValue(
                                    `meta.costData.${row.uid}.qty`,
                                    maxQty
                                );
                            }
                            if (val < 0) {
                                toast.error("min qty exceeded");
                                form.setValue(
                                    `meta.costData.${row.uid}.qty`,
                                    0
                                );
                            }
                        }}
                        onChange={e => {
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
