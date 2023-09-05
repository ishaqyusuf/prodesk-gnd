import {
  EmployeeProfile,
  Homes,
  JobPayments,
  Jobs,
  Projects,
  Roles,
  Users,
} from "@prisma/client";
import { InstallCost, InstallCostingTemplate } from "./community";
import { OmitMeta } from "./type";

export type IUser = Users & {
  meta: {};
  role: Roles;
  roles: Roles[];
  employeeProfile: EmployeeProfile;
};
export type IJobs = OmitMeta<Jobs> & {
  meta: IJobMeta;
  unit: Homes;
  homeData: HomeJobList;
  project: Projects;
  user: IUser;
};
export interface IJobMeta {
  additional_cost: number;
  taskCost: number;
  addon: number;
  costData: InstallCostingTemplate<{ qty: number; cost: number }>;
  cost_data: {
    id;
    title;
    maxQty;
    cost;
    unit_value;
    total;
    qty;
    ctx: {
      __qty;
      __total;
    };
  }[];
}
export type IJobPayment = JobPayments & {
  meta: {};
  user: IUser;
  payer: IUser;
  _count: {
    jobs;
  };
};
export interface HomeJobList {
  name?;
  id?;
  costing: InstallCost;
}
