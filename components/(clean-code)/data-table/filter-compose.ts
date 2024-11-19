export function composeFilter(filters, data, extras?) {
    const f = filters?.map((filter) => {
        const filterData = data?.[filter?.value] || extras?.[filter?.value];
        if (filterData) {
            filter.options = filterData.map((value) => ({
                value,
                label: value,
            }));
        }
        return filter;
    });
    console.log({ f });

    return f;
}
