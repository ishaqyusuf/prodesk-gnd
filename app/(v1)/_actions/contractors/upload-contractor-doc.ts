"use server";

import { prisma } from "@/db";
import { _revalidate } from "../_revalidate";

export async function _saveDocUpload(data) {
    data.createdAt = data.updatedAt = new Date();
    await prisma.userDocuments.create({
        data: data
    });

    _revalidate("contractor-overview");
}
