"use client";

import React, { useContext, useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { _useAsync } from "@/lib/use-async";
import Btn from "../../../../components/btn";
import BaseModal from "../../../../components/modals/base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

import { useForm, useFormContext } from "react-hook-form";

import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

import { Button } from "../../../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { InstallCostingTemplate } from "@/types/community";
import { useAppSelector } from "@/store";
import { loadStaticList } from "@/store/slicers";
import { staticProjectsAction } from "@/app/_actions/community/projects";
import { HomeJobList, IJobs, IUser } from "@/types/hrm";

import {
    PrimaryCellContent,
    SecondaryCellContent,
} from "../../../../components/columns/base-columns";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { getJobCostData, getUnitJobs } from "@/app/_actions/hrm-jobs/job-units";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../../components/ui/table";
import Money from "../../../../components/money";
import { getSettingAction } from "@/app/_actions/settings";
import { InstallCostLine, InstallCostSettings } from "@/types/settings";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../../../../components/ui/tabs";
import { Textarea } from "../../../../components/ui/textarea";
import {
    createJobAction,
    updateJobAction,
} from "@/app/_actions/hrm-jobs/create-job";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { loadStatic1099Contractors } from "@/app/_actions/hrm/get-employess";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../../components/ui/select";
import { cn } from "@/lib/utils";
import AutoComplete from "../../../../components/auto-complete";
import { _changeWorker } from "@/app/_actions/hrm-jobs/job-actions";
import { User } from "next-auth";
import PunchoutCost from "./punchout-cost";
import { SubmitModalContext } from "./context";
import { Form, FormField } from "@/components/ui/form";
import { _punchoutCosts } from "../_actions/punchout-costs";
import SubmitJobTitle from "./submit-job-title";
import SelectEmployee from "./select-employee";
import { validateTaskQty } from "./validation";

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
            meta: {},
        },
    });
    const id = form.watch("id");
    useEffect(() => {
        loadStaticList("staticProjects", projects, staticProjectsAction);

        // loadStaticList(
        //     "staticInstallers",
        //     techEmployees,
        //     loadStatic1099Contractors
        // );

        getSettingAction<InstallCostSettings>("install-price-chart").then(
            (res) => {
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
                const { homeData, unit, project, user, createdAt, ...job } =
                    form.getValues();
                if (isPunchout()) {
                    validateCosts();
                    Object.keys(job.meta.costData || {}).map((k) => {
                        (job.meta.costData[k] as any).cost =
                            costList.find((c) => c.uid == k)?.cost || 0;
                    });
                    console.log(job.meta.costData);
                    job.meta.taskCost = totalTaskCost(job.meta.costData || {});
                    // console.log(job.meta.taskCost, job.meta.costData);
                }
                if (!job.id) {
                    if (!isInstallation() || !job.homeId) job.meta.addon = 0;
                }
                // job.type = form.getValues("type");
                job.amount = 0;
                [
                    job.meta.addon,
                    job.meta.taskCost,
                    job.meta.additional_cost,
                ].map((n) => n > 0 && (job.amount += Number(n)));
                if (job.coWorkerId) job.amount /= 2;
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
    useEffect(() => {
        (async () => {
            if (isPunchout()) {
                const c = await _punchoutCosts();
                setCostList(c);
                let cq = {};
                c.map((a) => {
                    cq[a.uid] = Number(a.defaultQty) || 0;
                });
                console.log("is punchout");
                setUnitCosting(cq);
            }
        })();
    }, []);
    const projects = useAppSelector((state) => state?.slicers?.staticProjects);

    async function init(data: IJobs, defaultTab) {
        const employees = (await loadStatic1099Contractors()) as any;
        // console.log(employees);
        setEmployees(employees);

        form.reset();
        setPrevTab([]);
        setTasks([]);
        // if(data)
        const __ = !data?.id
            ? {
                  title: "Custom Project",
                  type: data?.type,
                  meta: {
                      costData: {},
                  },
              }
            : {
                  ...data,
              };
        const { homeTasks, ...d } = __ as any;
        // Object.entries(__).map(([k, v]) => form.setValue(k as any, v));
        form.reset(d);
        if (!defaultTab) defaultTab = "tasks";
        setTab(defaultTab);
        setAddCost(null as any);
        setUnitCosting({});
        if (data && defaultTab == "tasks") {
            if (!data?.homeId && data.id) {
                setTab("general");
                return;
            }
            // console.log(data);
            const costdat = await getJobCostData(data?.homeId, data.subtitle);
            // console.log(costdat);
            setUnitCosting(costdat as any);
        }
        if (data?.projectId && data?.homeId) {
            // let project = projects.find(p => data.projectId == p.id);
            const _units = await loadUnits(data.projectId);
            const unit = _units.find((u) => (u.id = data?.homeId));
            // console.log(unit, _units);
            console.log(unit);
            if (!unit && defaultTab == "tasks") setTab("general");
            if (unit) {
                console.log("unit=>", unit);
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
                    cost: costSetting?.meta?.list?.find((d) => d.uid == k)
                        ?.cost,
                    // qty: cd[k]?.qty || null
                };
            });
            if (Object.keys(cd).length == 0)
                form.setValue("meta.costData", costData);
        }
        form.setValue("subtitle", unit.name);
        // console.log(costSetting, unit.costing);
        const _tasks = costSetting?.meta?.list
            ?.filter((v) => isDecoShutter() || unit?.costing?.[v.uid])
            ?.filter(
                (v) =>
                    (isDecoShutter() &&
                        v.title.toLowerCase() == "deco-shutters") ||
                    (!isDecoShutter() &&
                        v.title.toLowerCase() != "deco-shutters")
            )
            .filter(
                (l) =>
                    (isPunchout() && l.punchout) ||
                    (isInstallation() && !l.punchout)
            );
        // console.log(costSetting?.meta?.list.filter((task) => task.punchout));
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
    // const techEmployees = useAppSelector(s => s.slicers.staticInstallers);
    const [techEmployees, setEmployees] = useState<User[]>([]);

    const [tab, setTab] = useState("project");
    const [prevTab, setPrevTab] = useState<any>([]);
    function _setTab(t) {
        setPrevTab([tab, ...prevTab]);
        setTab(t);
        setQ("");
    }
    function totalTaskCost(tasks) {
        console.log(tasks);

        let total = 0;
        Object.entries(tasks).map(([k, v]: [any, any]) => {
            // console.log(tasks);
            if (v.qty > 0 && v.cost > 0) {
                if (isPunchout()) {
                    total += Number(v.qty) * Number(v.cost);
                    return;
                }
                if (Number(v.qty || 0) > Number(unitCosting?.[k] || 0)) {
                    // toast.error("Some quantity has exceed default value.");
                    // throw Error();
                    // return;
                }
                total += Number(v.qty) * Number(v.cost);
            }
        });
        return total;
    }
    function validateCosts() {
        const validation = validateTaskQty(unitCosting, form);
        if (!validation) {
            // console.log(valid)
            toast.error("Some quantity has exceed default value.");
            throw new Error();
            return;
        }
    }
    function calculateTasks(nextTab = true) {
        // form.setValue('amount')
        const tasks = form.getValues("meta.costData") || {};
        console.log(tasks);
        validateCosts();
        // console.log(validation);
        // return;
        // form.setError("meta.costData.anc", {
        //     message: "error",
        // });
        // return;
        const total = totalTaskCost(tasks);

        form.setValue("meta.taskCost", total);
        if (nextTab)
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
        k.map((v) => form.setValue(v, null));
    }
    const [q, setQ] = useState("");
    function search<T>(list: T[], key: keyof T) {
        return list;
        return list.filter((l) =>
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
                                title: "Custom Project",
                            },
                            ...(projects || []),
                        ]}
                        onSelect={(item: any) => selectProject(item.data)}
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
                                    costings: {},
                                },
                            },
                            ...units,
                        ]}
                        onSelect={(item: any) => selectUnit(item.data)}
                        itemText={"name"}
                        itemValue="id"
                    />
                </div>
            </>
        );
    }

    const [costList, setCostList] = useState<InstallCostLine[]>([]);
    return (
        <Form {...form}>
            <SubmitModalContext.Provider
                value={{
                    form,
                    calculateTasks,
                    setCostList,
                    costList,
                    isPunchout,
                    prevTab,
                    resetFields,
                    setTab,
                    setPrevTab,
                    tab,
                    search,
                    _changeWorker,
                    _setTab,
                    techEmployees,
                    admin,
                    unitCosting,
                }}
            >
                <BaseModal<ModalInterface>
                    className="sm:max-w-[550px]"
                    onOpen={(data) => {
                        init(data?.data as any, data.defaultTab);
                    }}
                    onClose={() => {}}
                    modalName="submitJob"
                    Subtitle={({ data }) =>
                        data?.data?.id && <>{data.data?.subtitle}</>
                    }
                    Title={SubmitJobTitle}
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
                                    <SelectEmployee data={data} />
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
                                                "col-span-2"
                                                // isPunchout() && "hidden"
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
                                                            <CostRow
                                                                key={i}
                                                                row={row}
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
                                                        form.getValues(
                                                            "projectId"
                                                        ) != null
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
                                                        form.getValues(
                                                            "homeId"
                                                        ) != null
                                                    }
                                                    className="h-8"
                                                    {...form.register(
                                                        "subtitle"
                                                    )}
                                                />
                                            </div>
                                            {isPunchout() && <PunchoutCost />}
                                            <div className="grid gap-2">
                                                <Label>
                                                    {isInstallation() ||
                                                    isPunchout()
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
                                                        !isPunchout() &&
                                                            "col-span-2"
                                                    )}
                                                >
                                                    <Label>Co-Worker</Label>
                                                    <Select
                                                        onValueChange={(e) =>
                                                            form.setValue(
                                                                "coWorkerId",
                                                                +e
                                                            )
                                                        }
                                                        defaultValue={form
                                                            .getValues(
                                                                "coWorkerId"
                                                            )
                                                            ?.toString()}
                                                    >
                                                        <SelectTrigger className="h-8">
                                                            <SelectValue placeholder="" />
                                                        </SelectTrigger>

                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {techEmployees?.map(
                                                                    (
                                                                        profile,
                                                                        _
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                _
                                                                            }
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
                                <Btn onClick={() => calculateTasks()} size="sm">
                                    Proceed
                                </Btn>
                            );
                    }}
                />
            </SubmitModalContext.Provider>
        </Form>
    );
}
export function CostRow({ row }) {
    // const qty = form.watch(`meta.costData.${row.uid}.qty` as any);

    const { form, admin, unitCosting } = useContext(SubmitModalContext);
    // const {error} = form;
    // const fc = useFormContext();
    const {
        formState: { errors },
    } = form;

    const formKey = `meta.costData.${row.uid}.qty` as any;
    return (
        <FormField
            control={form.control}
            name={formKey}
            render={({ field, fieldState }) => (
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
                                min={0}
                                {...form.register(formKey)}
                                type="number"
                                className={cn(
                                    "w-16 h-8 hiddens",
                                    fieldState.error && "border-red-400"
                                )}
                            />
                            {admin && (
                                <Label className="px-1">
                                    {" /"}
                                    {unitCosting[row.uid]}
                                </Label>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            )}
        />
    );
}
