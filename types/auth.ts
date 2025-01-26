import { PERMISSIONS, ROLES } from "@/data/contants/permissions";

export type Permission = (typeof PERMISSIONS)[number];
export type Roles = (typeof ROLES)[number];

export type ICan = { [permission in Permission]: boolean };
