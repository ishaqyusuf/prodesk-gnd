import { Builders, HomeTasks, Homes, Projects } from "@prisma/client";

export type IProject = Projects & {
  meta: {
    supervisor: {
      name;
      email;
    };
    media?: string[];
    addon?;
  };
  _count: {
    homes;
  };
  builder: IBuilder;
};
export type IBuilder = Builders & {
  meta: {};
};
export type IHome = Homes & {
  meta: {};
  project: IProject;
  tasks: ITasks[];
};

export type ITasks = HomeTasks & {
  meta: {};
};
export interface IHomeStatus {
  produceables: number;
  produced: number;
  pendingProduction: number;
  productionStatus;
  badgeColor;
}
