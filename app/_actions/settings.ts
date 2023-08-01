"use server";
import { prisma } from "@/db";
import { PostType } from "@/types/post";

export async function getSettingAction<T>(type: PostType) {
  // const type: PostType = "sales-settings";
  const setting = await prisma.posts.findFirst({
    where: {
      type,
    },
  });
  if (!setting) {
    let newSetting = await prisma.posts.create({
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
  const setting = await prisma.posts.update({
    where: {
      id,
    },
    data,
  });
  return setting;
}
