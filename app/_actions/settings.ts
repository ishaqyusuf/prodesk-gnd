"use server";
import { prisma } from "@/db";
import { PostType } from "@/types/post";
import { SettingType } from "@/types/settings";

export async function getSettingAction<T>(type: SettingType) {
  // const type: PostType = "sales-settings";
  const setting = await prisma.settings.findFirst({
    where: {
      type,
    },
  });
  if (!setting) {
    let newSetting = await prisma.settings.create({
      data: {
        type,
        meta: {},
      },
    });
    return newSetting as T;
  }
  return setting as T;
}
export async function saveSettingAction(id, data): Promise<any> {
  // const type: PostType = "sales-settings";
  const setting = await prisma.settings.update({
    where: {
      id,
    },
    data,
  });
  return setting;
}
