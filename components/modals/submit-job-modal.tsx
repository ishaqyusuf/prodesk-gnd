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
import {
    ExtendedHome,
    ExtendedHomeTasks,
    InstallCostingTemplate
} from "@/types/community";
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
import { _changeWorker } from "@/app/_actions/hrm-jobs/job-actions";

interface ModalInterface {
    data: IJobs | undefined;
    defaultTab?;
    changeWorker?: Boolean;
}
export default function SubmitJobModal({ admin }: { admin?: Boolean }) {
    const route = useRouter();
    // const isPunchout = type == "punchout";
    const [isSaving, startTransition] = useTransition();
    const form = useForm<IJobs>({
        defaultValues: {
            meta: {}
        }
    });
    const id = form.watch("id");
    useEffect(() => {
        loadStaticList("staticProjects", projects, staticProjectsAction);
        loadStaticList(
            "staticInstallers",
            techEmployees,
            loadStatic1099Contractors
        );

        getSettingAction<InstallCostSettings>("install-price-chart").then(
            res => {
                console.log("res", res);
                setCostSetting(res);
            }
        );
    }, []);
    const type = form.watch("type");
    function is(_type: "punchout" | "deco-shutter" | "installation") {
        return type == _type;
    }
    const isPunchout = () => is("punchout");
    const isDecoShutter = () => is("deco-shutter");
    const isInstallation = () => is("installation");
    async function submit() {
        startTransition(async () => {
            // if(!form.getValues)
            try {
                // const isValid = employeeSchema.parse(form.getValues());
                const {
                    homeData,
                    unit,
                    project,
                    user,
                    createdAt,
                    ...job
                } = form.getValues();
                if (!job.id) {
                    if (!isInstallation() || !job.homeId) job.meta.addon = 0;
                }
                // job.type = form.getValues("type");
                job.amount = 0;
                [
                    job.meta.addon,
                    job.meta.taskCost,
                    job.meta.additional_cost
                ].map(n => n > 0 && (job.amount += Number(n)));
                if (job.coWorkerId) job.amount /= 2;
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
        setPrevTab([]);
        setTasks([]);
        // if(data)
        const __ = !data?.id
            ? {
                  title: "Custom Project",
                  type: data?.type,
                  meta: {}
              }
            : {
                  ...data
              };
        const { homeTasks, ...d } = __ as any;
        // Object.entries(__).map(([k, v]) => form.setValue(k as any, v));
        form.reset(d);
        if (!defaultTab) defaultTab = "tasks";
        setTab(defaultTab);
        setAddCost(null as any);
        setUnitCosting({});
        if (data && defaultTab == "tasks") {
            const costdat = await getJobCostData(data?.homeId, data.subtitle);
            console.log(costdat);
            setUnitCosting(costdat as any);
        }
        if (data?.projectId) {
            // let project = projects.find(p => data.projectId == p.id);
            const _units = await loadUnits(data.projectId);
            const unit = _units.find(u => (u.id = data?.homeId));
            // console.log(unit, _units);
            console.log(unit);
            if (!unit && defaultTab == "tasks") setTab("general");
            if (unit) {
                // console.log(unit);
                selectUnit(unit as any);
            }
        }
    }
    async function selectProject(project) {
        // console.log(project);
        // return;

        const projectId = project?.id;
        form.setValue("unit", null as any);
        form.setValue("homeId", null as any);
        form.setValue("meta.addon", null as any);
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
        if (!id) form.setValue("meta.addon", 0);
        if (!projectId) setUnits([]);
        else {
            const ls = await getUnitJobs(projectId, type, id == null);
            if (isInstallation() && !id)
                form.setValue("meta.addon", ls.addon || 0);
            setUnits(ls.homeList);
            // console.log(ls.homeList);
            return ls.homeList;
        }
        return [];
        // form.setValue('homeData',ls.homeList)
    }
    async function selectUnit(unit: HomeJobList) {
        form.setValue("homeData", unit);
        setTasks([]);
        form.setValue("homeId", unit.id);
        if (unit.costing) {
            setUnitCosting(unit.costing);
            const costData = {};
            const cd = form.getValues("meta.costData") ?? {};
            // console.log(Object.keys(cd).length == 0);
            Object.entries(unit.costing).map(([k, v]) => {
                costData[k] = {
                    cost: costSetting?.meta?.list?.find(d => d.uid == k)?.cost
                    // qty: cd[k]?.qty || null
                };
            });
            if (Object.keys(cd).length == 0)
                form.setValue("meta.costData", costData);
        }
        form.setValue("subtitle", unit.name);
        console.log(costSetting, unit.costing);
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
            console.log(tasks);
            if (v.qty > 0 && v.cost > 0) {
                if (Number(v.qty || 0) > Number(unitCosting?.[k] || 0)) {
                    toast.error("Some quantity has exceed default value.");
                    throw Error();
                    return;
                }
                total += Number(v.qty) * Number(v.cost);
            }
        });
        form.setValue("meta.taskCost", total);
        // form.setValue("amount", total + addon);
        _setTab("general");
    }
    const amount = form.watch("amount");
    const taskCost = form.watch("meta.taskCost");
    const addon = form.watch("meta.addon");
    const homeId = form.watch("homeId");
    const jobId = form.watch("id");
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
            Subtitle={({ data }) =>
                data?.data?.id && <>{data.data?.subtitle}</>
            }
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
                        {data?.data?.id ? (
                            <>{data?.data?.title}</>
                        ) : (
                            {
                                user: "Select Employee",
                                project: "Select Project",
                                unit: "Select Unit",
                                tasks: "Task Information",
                                general: "Other Information"
                            }[tab]
                        )}
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
                                                onClick={async () => {
                                                    if (data?.changeWorker) {
                                                        await _changeWorker(
                                                            data?.data?.id,
                                                            data?.data?.userId,
                                                            user?.id
                                                        );
                                                        toast.success(
                                                            "Worker changed!"
                                                        );
                                                        closeModal();
                                                        return;
                                                    }
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

                        <TabsContent value="tasks">
                            <ScrollArea className="h-[350px] pr-4">
                                {!data?.data?.id && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <UnitForm />
                                    </div>
                                )}
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
                                                        admin={admin}
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
                                        <Label>Addon </Label>
                                        <SecondaryCellContent>
                                            <Money
                                                value={
                                                    (isInstallation() &&
                                                        homeId) ||
                                                    jobId
                                                        ? addon
                                                        : 0
                                                }
                                            />
                                        </SecondaryCellContent>
                                    </div>
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
export function Row({ form, admin, row, unitCosting }) {
    // const qty = form.watch(`meta.costData.${row.uid}.qty` as any);
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
                    <Input
                        // max={unitCosting[row.uid]}
                        min={0}
                        // value={qty}
                        // onBlur={e => {
                        //     const maxQty = Number(unitCosting[row.uid]);
                        //     let val = form.getValues(
                        //         `meta.costData.${row.uid}.qty` as any
                        //     );
                        //     if (val > maxQty) {
                        //         toast.error("max qty exceeded");

                        //         form.setValue(
                        //             `meta.costData.${row.uid}.qty`,
                        //             maxQty
                        //         );
                        //     }
                        //     if (val < 0) {
                        //         toast.error("min qty exceeded");
                        //         form.setValue(
                        //             `meta.costData.${row.uid}.qty`,
                        //             0
                        //         );
                        //     }
                        // }}
                        // onChange={e => {
                        //     let v = +e.target.value;
                        //     form.setValue(`meta.costData.${row.uid}.qty`, v);
                        // }}
                        {...form.register(
                            `meta.costData.${row.uid}.qty` as any
                        )}
                        type="number"
                        className="w-16 h-8 hiddens"
                    />
                    {admin && (
                        <Label className="px-1">
                            {" /"}
                            {unitCosting[row.uid]}
                        </Label>
                    )}
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
