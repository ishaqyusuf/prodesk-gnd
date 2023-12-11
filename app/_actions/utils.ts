"use server";

import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";
import { prisma } from "@/db";
import { IUser } from "@/types/hrm";
export async function user() {
    const data = await getServerSession(authOptions);
    if (!data) throw new Error();
    return data.user;
}
export async function userId() {
    return (await user()).id;
}
export async function _dbUser() {
    return (await prisma.users.findUnique({
        where: { id: await userId() },
    })) as any as IUser;
}
export async function streamlineMeta(meta: any = null) {
    if (meta == null) return {};

    function _streamline(value) {
        let _str: any = null;
        if (value != null) {
            if (typeof value === "object" && value?.length <= 0) {
                _str = {};
                Object.entries(value).map(([k, v]) => {
                    const _val = _streamline(v);
                    if (_val) _str[k] = _val;
                });
                return _str;
            } else {
                return value;
            }
        }
    }
    return _streamline(meta);
}
export async function hashPassword(pwrd) {
    return await bcrypt.hash(pwrd, 10);
}
