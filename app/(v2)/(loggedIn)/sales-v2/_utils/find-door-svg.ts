import JsonSearch from "@/_v2/lib/json-search";
import { doorSvgsById, dykeDoorsSvg } from "@/lib/data/dyke-doors-svg";

export function findDoorSvg(title) {
    console.log(title);

    const s = new JsonSearch(
        dykeDoorsSvg.map(({ title, url }, index) => ({
            title,
            url,
            id: (index + 1).toString(),
        })),
        {
            sort: true,
            indices: {
                title: "title",
            },
        }
    );

    // console.log("....");

    let res = s.queryWithScore(title, (item) => item);
    // return null;
    // console.log(res);
    //   return res;
    // console.log(res);

    const item = res[0]?.item;
    if (!item) return {};
    return {
        svg: doorSvgsById[item.id],
        url: item.url,
    };
}
