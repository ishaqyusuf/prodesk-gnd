import { Projects } from "@prisma/client";

export type IProject = Projects & {
  meta: {};
};
