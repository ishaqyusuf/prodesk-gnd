import {
    EmployeeProfile,
    Homes,
    JobPayments,
    Jobs,
    Projects,
    Roles,
    Users
} from "@prisma/client";
import {
    InstallCost,
    InstallCosting,
    InstallCostingTemplate
} from "./community";
import { OmitMeta } from "./type";

export type IUser = Users & {
    meta: {};
    role: Roles;
    roles: Roles[];
    employeeProfile: EmployeeProfile;
};
export type IJobs = Omit<Jobs, "meta" | "type"> & {
    payment: IJobPayment;
    type: IJobType;
    meta: IJobMeta;
    unit: Homes;
    homeData: HomeJobList;
    project: Projects;
    user: IUser;
};
export type IJobType = "punchout" | "installation" | "Deco-Shutter";
export interface IJobMeta {
    additional_cost: number;
    taskCost: number;
    addon: number;
    costData: InstallCostingTemplate<{ qty: number; cost: number }>;
}
export type IJobPayment = JobPayments & {
    meta: {};
    user: IUser;
    jobs: IJobs[];
    payer: IUser;
    _count: {
        jobs;
    };
};
export interface HomeJobList {
    name?;
    id?;
    disabled?;
    costing?: InstallCosting;
}
export interface IRole extends Roles {
    _count: {
        RoleHasPermissions;
    };
}
export interface IRoleForm {
    roleId;
    name;

    permission: { [key in string]: boolean };
}
