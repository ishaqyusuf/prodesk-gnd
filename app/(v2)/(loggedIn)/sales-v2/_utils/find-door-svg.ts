import JsonSearch from "@/_v2/lib/json-search";
import { dykeDoorsSvg } from "@/lib/data/dyke-doors-svg";

export function findDoorSvg(title) {
    console.log(title);

    const s = new JsonSearch(
        dykeDoorsSvg.map(({ title, url }) => ({ title, url })),
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
    console.log(res);

    return res[0]?.item?.url;
}
