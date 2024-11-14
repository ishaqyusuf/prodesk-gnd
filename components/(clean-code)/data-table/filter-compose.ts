export function composeFilter(filters, data) {
    return filters?.map((filter) => {
        const filterData = data?.[filter?.value];
        if (filterData) {
            filter.options = filterData.map((value) => ({
                value,
                label: value,
            }));
        }
        return filter;
    });
}
