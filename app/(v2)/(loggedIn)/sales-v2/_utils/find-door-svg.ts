import JsonSearch from "@/_v2/lib/json-search";
import { dykeDoorsSvg } from "@/lib/data/dyke-doors-svg";

export function findDoorSvg(title) {
    const s = new JsonSearch(dykeDoorsSvg, {
        sort: true,
    });

    let res = s.queryWithScore(title, (item) => item);
    // return null;
    // console.log(res);
    //   return res;
    return res[0]?.item?.url;
}
