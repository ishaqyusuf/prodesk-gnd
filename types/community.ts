import { Projects } from "@prisma/client";

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
};
