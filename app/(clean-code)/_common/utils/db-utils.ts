import dayjs from "dayjs";
function fixDbTime(date: dayjs.Dayjs, h = 0, m = 0, s = 0) {
    return date.set("hours", h).set("minutes", m).set("seconds", s);
}
export function anyDateQuery() {
    return {
        lte: fixDbTime(dayjs()).toISOString(),
    };
}
export function isDay(date: dayjs.Dayjs) {
    return {
        gte: fixDbTime(date).toISOString(),
        lte: fixDbTime(date, 23, 59, 59).toISOString(),
    };
}
export const withDeleted = {
    OR: [{ deletedAt: null }, { deletedAt: { not: null } }],
};
export const whereTrashed = {
    where: {
        deletedAt: {},
    },
};
export const whereNotTrashed = {
    where: {
        deletedAt: null,
    },
};
export async function getPageInfo(input, where, model) {
    const { page = 1, perPage = 20 } = input;
    const skip = (page - 1) * Number(perPage);
    const count = await model.count({
        where,
    });
    const from = skip + 1;
    const pageInfo = {
        hasPreviousPage: skip > 0,
        pageCount: Math.ceil(count / perPage),
        totalItems: count,
        pageIndex: skip / perPage,
        currentPage: page,
        from,
        to: Math.min(skip + Number(perPage), count),
        perPage,
    };
    return pageInfo;
}

export function pageQueryFilter(input) {
    let { page = 1, perPage = 20 } = input;

    const keys = Object.keys(input);
    let skip = null;
    if (keys.includes("start")) {
        skip = input.start;
        perPage = input.size;
    } else {
        skip = (page - 1) * perPage;
    }

    let orderBy = {};
    const { sort_order = "desc", sort = "id" } = input;
    if (sort == "customer")
        orderBy = {
            customer: {
                name: sort_order,
            },
        };
    else {
        orderBy = {
            [sort || "id"]: sort_order,
        };
    }

    return {
        take: Number(perPage),
        skip: Number(skip),
        orderBy,
    };
}
