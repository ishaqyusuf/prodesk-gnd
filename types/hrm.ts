import {
  EmployeeProfile,
  Homes,
  JobPayments,
  Jobs,
  Projects,
  Roles,
  Users,
} from "@prisma/client";
import { InstallCost } from "./community";

export type IUser = Users & {
  meta: {};
  role: Roles;
  roles: Roles[];
  employeeProfile: EmployeeProfile;
};
export type IJobs = Jobs & {
  meta: {
    additional_cost;
    taskCost;
    addon;
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
  };
  unit: Homes;
  homeData: HomeJobList;
  project: Projects;
  user: IUser;
};
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
