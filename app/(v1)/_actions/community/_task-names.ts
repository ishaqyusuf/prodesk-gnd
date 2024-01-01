"use server";

import { prisma } from "@/db";
import { IBuilder } from "@/types/community";

export type TaskNameWhere = {
    [id in
        | "deco"
        | "punchout"
        | "installable"
        | "produceable"
        | "billable"]: boolean;
};
export async function _taskNames(_where: TaskNameWhere) {
    const builders: IBuilder[] = (await prisma.builders.findMany()) as any;
    let taskNames: string[] = [];
    builders.map(b => {
        b.meta.tasks
            .filter(f => {
                let _show = true;
                Object.entries(_where).map(([k, v]) => {
                    if (f[k] != v) _show = false;
                });
                return _show;
            })
            .map(task => {
                let tn = task.name.toUpperCase();
                if (!taskNames.includes(tn)) taskNames.push(tn);
            });
    });
    return taskNames;
}
