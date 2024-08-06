"use server";

import { prisma } from "@/db";
import { RegisterSchema } from "./validation";
import { redirect } from "next/navigation";

export async function signupDealerAction(data: RegisterSchema) {
    const dealer = await prisma.dealerAuth.findFirst({
        where: {
            email: data.email,
        },
    });
    const usr = await prisma.users.findFirst({
        where: {
            email: data.email,
        },
    });
    if (usr) throw Error("You cannot create a dealer account with this email.");
    if (dealer) {
        throw Error("Account with email already exists.");
    }
    const auth = await prisma.dealerAuth.create({
        data: {
            email: data.email,
            dealer: {
                create: {
                    name: data.name,
                    address: data.address,
                    email: data.email,
                    businessName: data.businessName,
                    meta: {},
                },
            },
        },
    });
    redirect(`/dealer/registration-submitted?email=${auth.email}`);
}
