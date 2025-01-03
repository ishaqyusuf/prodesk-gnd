import { SalesType } from "@/app/(clean-code)/(sales)/types";
import { useSalesOverview } from "../overview-provider";
import { Menu } from "@/components/(clean-code)/menu";
import { Move } from "lucide-react";
import { openLink } from "@/lib/open-link";
import { SalesPrintProps } from "@/app/(v2)/printer/sales/page";
import { toast } from "sonner";
import { salesPdf } from "@/app/(v2)/printer/_action/sales-pdf";

interface Props {
    pdf?: boolean;
}
export function PrintAction({ pdf }: Props) {
    const ctx = useSalesOverview();
    const dispatchList = ctx.item.dispatchList;
    const type = ctx.item.type;
    function print(params?: SalesPrintProps["searchParams"]) {
        const query = {
            slugs: ctx.item?.slug,
            mode: type,
            preview: false,
            ...(params || {}),
        } as SalesPrintProps["searchParams"];
        if (!pdf) openLink(`/printer/sales`, query, true);
        else {
            toast.promise(
                async () => {
                    const pdf = await salesPdf(query);
                    const link = document.createElement("a");
                    link.href = pdf.url;
                    console.log({ url: pdf.url });
                    link.download = `${query.slugs}.pdf`;
                    link.click();
                },
                {
                    loading: "Creating pdf...",
                    success(data) {
                        return "Downloaded.";
                    },
                    error(data) {
                        return "Something went wrong";
                    },
                }
            );
        }
    }
    if (type == "quote")
        return (
            <Menu.Item
                icon={pdf ? "pdf" : "print"}
                onClick={() => {
                    print();
                }}
            >
                {pdf ? "PDF" : "Print"}
            </Menu.Item>
        );
    return (
        <Menu.Item
            icon={pdf ? "pdf" : "print"}
            SubMenu={
                <>
                    <Menu.Item
                        SubMenu={
                            dispatchList?.length == 0 ? null : (
                                <>
                                    <Menu.Item onClick={() => {}}>
                                        {pdf ? "PDF " : "Print "} All
                                    </Menu.Item>
                                    {dispatchList.map((d) => (
                                        <Menu.Item
                                            key={d.id}
                                            onClick={() => {}}
                                        >
                                            {d.title}
                                        </Menu.Item>
                                    ))}
                                </>
                            )
                        }
                        icon="packingList"
                        disabled={dispatchList?.length == 0}
                    >
                        Packing List
                    </Menu.Item>
                    <Menu.Item
                        icon="orders"
                        onClick={() => {
                            print();
                        }}
                    >
                        Order
                    </Menu.Item>
                    <Menu.Item
                        icon="production"
                        onClick={() => {
                            print({
                                mode: "production",
                            });
                        }}
                    >
                        Production
                    </Menu.Item>
                </>
            }
        >
            {pdf ? "PDF" : "Print"}
        </Menu.Item>
    );
}
