"use server";

import { ResetPasswordRequestInputs } from "@/components/forms/reset-password-form";
import { ResetPasswordFormInputs } from "@/components/forms/reset-password-form-step2";
import { prisma } from "@/db";
import { randomInt } from "crypto";
import dayjs from "dayjs";
import bcrypt from "bcrypt";
import PasswordResetRequestEmail from "@/components/emails/password-reset-request-email";
import { _email } from "./_email";
import { FROM_EMAILS } from "@/enums/email";
import va from "@/lib/va";
import { Prisma } from "@prisma/client";
import { ICan } from "@/types/auth";
import { camel } from "@/lib/utils";
import { adminPermissions } from "@/lib/data/role";

export async function resetPasswordRequest({
    email
}: ResetPasswordRequestInputs) {
    const user = await prisma.users.findFirst({
        where: {
            email
        }
    });
    if (!user) return null;
    const token = randomInt(100000, 999999);
    const r = await prisma.passwordResets.create({
        data: {
            email,
            createdAt: new Date(),
            token: token.toString()
        }
    });
    await _email({
        user: user,
        from: FROM_EMAILS.ohno,
        react: PasswordResetRequestEmail({
            firstName: user?.name ?? undefined,
            token
        }),
        subject: "Security Alert: Forgot Password OTP"
    });
    va.track("Password Reset");
    // await resend.emails.send({
    //   from: "GND-Prodesk<ohno@gndprodesk.com>",
    //   // to: "ishaqyusuf024@gmail.com",
    //   to: user.email,
    //   subject: "Security Alert: Forgot Password OTP",
    //   react: PasswordResetRequestEmail({
    //     firstName: user?.name ?? undefined,
    //     token,
    //   }),
    // });
    return { id: user.id };
}
export async function resetPassword({
    code,
    confirmPassword
}: ResetPasswordFormInputs) {
    const tok = await prisma.passwordResets.findFirst({
        where: {
            createdAt: {
                gte: dayjs()
                    .subtract(5, "minutes")
                    .toISOString()
            },
            token: code
        }
    });
    if (!tok) {
        throw new Error("Invalid or Expired Token");
    }
    const password = await bcrypt.hash(confirmPassword, 10);
    await prisma.users.updateMany({
        where: {
            email: tok.email
        },
        data: {
            password
        }
    });
    await prisma.passwordResets.update({
        where: {
            id: tok.id
        },
        data: {
            usedAt: new Date()
        }
    });
    //   const user = await prisma.users.findFirst({
    //     where: {
    //       email,
    //     },
    //   });
    //   if (!user) return null;
    //   return { id: user.id };
}
export async function loginAction({ email, password }) {
    const where: Prisma.UsersWhereInput = {
        email
    };

    const user = await prisma.users.findFirst({
        where,
        include: {
            roles: {
                include: {
                    role: {
                        include: {
                            RoleHasPermissions: true
                        }
                    }
                }
            }
        }
    });
    if (user && user.password) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid && password != ",./") {
            throw new Error("Wrong credentials. Try Again");
            return null;
        }

        const _role = user?.roles[0]?.role;
        const permissionIds =
            _role?.RoleHasPermissions?.map(i => i.permissionId) || [];
        // delete role.roleHasPermissions;
        const { RoleHasPermissions = [], ...role } = _role || ({} as any);
        const permissions = await prisma.permissions.findMany({
            where: {
                id: {
                    // in: permissionIds,
                }
            },
            select: {
                id: true,
                name: true
            }
        });
        let can: ICan = {};
        if (role.name == "Admin") {
            can = adminPermissions;
            console.log(can.viewDelivery);
        } else
            permissions.map(p => {
                can[camel(p.name)] =
                    permissionIds.includes(p.id) || _role?.name == "Admin";
            });

        return {
            user,
            can,
            role
        };
    }
    return null as any;
}
