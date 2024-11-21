import { useEffect } from "react";
import { SiteLinksPage } from "./links";
import { useQueryTab } from "./provider";

interface Props {
    page: SiteLinksPage;
}
export default function QueryTab({ page }: Props) {
    const qt = useQueryTab();
    useEffect(() => {
        qt.setPage(page);
    }, []);
    return <>{/* <span>{qt.pageData?.rootPath}</span> */}</>;
}
