import { useEffect } from "react";
import { SiteLinksPage } from "./links";
import { useQueryTab } from "./provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Icons } from "@/components/_v1/icons";

interface Props {
    page: SiteLinksPage;
}
export default function QueryTab({ page }: Props) {
    const qt = useQueryTab();
    useEffect(() => {
        qt.setPage(page);
    }, []);
    return (
        <div>
            {qt.pageData?.links?.map((link, index) => (
                <Button asChild key={index}>
                    <Link href={""}></Link>
                </Button>
            ))}
            {qt.newQuery && (
                <Button size="sm" className="h-8 text-xs" variant="outline">
                    <Icons.add className="w-4 h-4" />
                    <span>Query Tab</span>
                </Button>
            )}
        </div>
    );
}
