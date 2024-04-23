export async function nextId(model) {
    return (await lastId(model)) + 1;
}
export async function lastId(model, _default = 0) {
    return ((
        await model.findFirst({
            where: {
                deletedAt: undefined,
            },
            orderBy: {
                id: "desc",
            },
        })
    )?.id || _default) as number;
}
// export async function slugModel()
