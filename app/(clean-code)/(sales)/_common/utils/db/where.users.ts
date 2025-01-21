import { FilterParams } from "@/components/(clean-code)/data-table/search-params";
import { Prisma } from "@prisma/client";
import { composeQuery } from "../db-utils";
import { addSpacesToCamelCase } from "@/lib/utils";

export function whereUsers(query: FilterParams) {
    const wheres: Prisma.UsersWhereInput[] = [];
    const permissions = query["user.permissions"]?.split(",");

    if (permissions?.length) {
        const wherePermissions: Prisma.PermissionsWhereInput[] = [];
        permissions.map((permission) => {
            const name = addSpacesToCamelCase(permission);
            wherePermissions.push({
                name,
            });
        });
        wheres.push({
            roles: {
                some: {
                    role: {
                        RoleHasPermissions: {
                            some: {
                                permission:
                                    wherePermissions?.length > 1
                                        ? {
                                              AND: wherePermissions,
                                          }
                                        : wherePermissions[0],
                            },
                        },
                    },
                },
            },
        });
    }
    return composeQuery(wheres);
}
