"use server";

import { prisma } from "@/db";
import { permissions } from "@/lib/data/role";
import { queryBuilder, whereQuery } from "@/lib/db-utils";
import { BaseQuery } from "@/types/action";
import { IRoleForm } from "@/types/hrm";
import { Prisma } from "@prisma/client";
import { transformData } from "@/lib/utils";

interface Props extends BaseQuery {}
export async function _getRoles(query: Props) {
  if (!query.sort) {
    query.sort = "name";
    query.sort_order = "asc";
  }
  const builder = await queryBuilder<Prisma.RolesWhereInput>(
    query,
    prisma.roles
  );
  return builder.response(
    await prisma.roles.findMany({
      where: builder.getWhere(),
      ...builder.queryFilters,
      include: {
        _count: {
          select: {
            RoleHasPermissions: true,
          },
        },
      },
    })
  );
}
export async function getRoleForm(roleId = null) {
  const permission: any = {};
  if (roleId) {
    const rhp = await prisma.roleHasPermissions.findMany({
      where: {
        roleId,
      },
      include: {
        permission: true,
      },
    });
    rhp.map((r) => (permission[r.permission.name] = true));
    return {
      roleId,
      permission,
    };
  }
  return {
    roleId: null,
    permission,
  };
}
export async function _saveRole(role: IRoleForm) {
  // const permissionList = permissions;
  const pl = await prisma.permissions.findMany({
    select: { name: true, id: true },
  });

  const ids: number[] = [];
  await Promise.all(
    Object.entries(role.permission).map(async ([k, v]) => {
      const e = pl.find((p) => p.name == k);
      if (e && v) {
        ids.push(e.id);
      } else {
        const newPermission = await prisma.permissions.create({
          data: {
            name: k,
            ...transformData({}),
          },
        });
        ids.push(newPermission.id);
      }
    })
  );
  if (!role.roleId)
    role.roleId = (
      await prisma.roles.create({
        data: {
          name: role.name,
          ...transformData({}),
          RoleHasPermissions: {
            createMany: {
              data: [...ids.map((permissionId) => ({ permissionId }))],
              skipDuplicates: true,
            },
          },
        },
      })
    ).id;
  else
    await prisma.roles.update({
      where: {
        id: role.roleId,
      },
      data: {
        name: role.name,
        ...transformData({}, true),
        RoleHasPermissions: {
          createMany: {
            data: [...ids.map((permissionId) => ({ permissionId }))],
            skipDuplicates: true,
          },
        },
      },
    });
  await prisma.roleHasPermissions.deleteMany({
    where: {
      roleId: role.roleId,
      permissionId: {
        notIn: ids,
      },
    },
  });
}
