import optionBuilder from "@/lib/option-builder";
import { SalesTableItem } from "../../../../(v1)/(loggedIn)/sales/orders/components/orders-table-shell";
import { IconKeys } from "@/components/_v1/icons";
import { truthy } from "@/lib/utils";
import { useModal } from "@/components/common/modal/provider";
import SendEmailSheet from "@/components/_v2/email/send-email";
import { useAssignment } from "@/app/(v2)/(loggedIn)/sales-v2/productions/_components/_modals/assignment-modal/use-assignment";
import salesData from "@/app/(v2)/(loggedIn)/sales/sales-data";
import { toast } from "sonner";
import { updateDeliveryModeDac } from "@/app/(v2)/(loggedIn)/sales/_data-access/update-delivery-mode.dac";
import { IOrderPrintMode, ISalesType } from "@/types/sales";
import {
    copyOrderAction,
    moveSales,
} from "../../../../(v1)/(loggedIn)/sales/_actions/sales";
import { useRouter } from "next/navigation";
import { openLink } from "@/lib/open-link";
import useSalesPdf from "@/app/(v2)/printer/sales/use-sales-pdf";

type Mode = "dealer" | "internal";
export function useSalesMenu(item: SalesTableItem, mode: Mode = "internal") {
    const modal = useModal();
    const isEstimate = item.type == "quote";
    const { isDyke, type, slug } = item;

    const typeSlug = `${type}/${slug}`;
    const _viewHref = isDyke ? `/sales-v2/overview/${typeSlug}` : ``;
    const _editHref = isDyke ? `/sales/${typeSlug}` : `${_viewHref}/form`;

    const assignment = useAssignment();
    function emailAction() {
        const email =
            item.billingAddress?.email ||
            item.shippingAddress?.email ||
            item.customer?.email;

        modal?.openSheet(
            <SendEmailSheet
                data={{
                    parentId: item.id,
                    to: email as any,
                    type: !isEstimate ? "sales" : "quote",
                }}
                download={{
                    slug: item.orderId,
                    date: item.createdAt,
                    path: "sales",
                }}
                subtitle={`Sales Order | ${item.orderId}`}
            />
        );
    }
    function prodAction() {
        assignment.open(item.id);
    }
    async function updateDeliveryMode(delivery) {
        if (delivery != item.deliveryOption) {
            await updateDeliveryModeDac(
                item.id,
                delivery,
                !isEstimate ? "orders" : "quotes"
            );

            toast.success("Updated");
        }
    }
    const router = useRouter();
    const copyAs = async (as: ISalesType) => {
        const resp = await copyOrderAction({
            orderId: item.orderId,
            as,
        });
        if (resp.link)
            toast.message(`${as} copied successfully`, {
                action: {
                    label: "Open",
                    onClick: () => router.push(resp.link),
                },
            });
    };
    const moveTo = async (type: ISalesType) => {
        await moveSales(item.id, type);
        toast.message("Success");
    };
    const moveToQuote = async () => await moveTo("quote");
    const moveToSales = async () => await moveTo("order");
    const copyAsSale = async () => await copyAs("order");
    const copyAsEstimate = async () => await copyAs("quote");

    const _pdf = useSalesPdf();
    async function print(mode: IOrderPrintMode, sec) {
        const print = sec == "Print";
        const mockup = sec == "Print Mockup";
        const pdf = sec == "Pdf";

        let ids = [item.slug];
        const query = {
            slugs: ids.join(","),
            mode,
            mockup: mockup ? "yes" : "no",
            preview: false,
        };
        if (item.deletedAt) (query as any).deletedAt = item.deletedAt;
        if (pdf)
            _pdf?.print({
                ...query,
                pdf: true,
            } as any);
        else openLink(`printer/sales`, query, true);
    }
    const ctx = {
        options: [
            _option("View", _viewHref, "view"),
            _option("Edit", _editHref, "edit"),
            _option("Email", emailAction, "Email"),
            ...truthy(
                !isEstimate,
                [
                    _option("Production", prodAction, "production"),
                    _option(
                        "Delivery",
                        null,
                        "delivery",
                        salesData.delivery?.map((d, i) =>
                            _option(
                                d.text,
                                () => updateDeliveryMode(d.text),
                                i == 0 ? "pickup" : "delivery2"
                            )
                        )
                    ),
                    _option("Move to Quote", moveToQuote, "estimates"),
                ],
                [_option("Move to Sales", moveToSales, "orders")]
            ),
            _option("Copy as", null, "copy", [
                _option("Sales", copyAsSale, "orders"),
                _option("Quote", copyAsEstimate, "estimates"),
            ]),
            _option(
                "Print",
                null,
                "print",
                isEstimate
                    ? [
                          _option(
                              "Print",
                              () => print("quote", "print"),
                              "estimates"
                          ),
                          _option(
                              "Print Mockup",
                              () => print("quote", "Print Mockup"),
                              "box"
                          ),
                          _option("Pdf", () => print("quote", "Pdf"), "pdf"),
                      ]
                    : ["Print", "Print Mockup", "Pdf"]
                          .map((groupTitle) => [
                              { groupTitle },
                              _option(
                                  "Order & Packing",
                                  () => print("order-packing", groupTitle),
                                  "box"
                              ),
                              _option(
                                  "Order",
                                  () => print("order", groupTitle),
                                  "orders"
                              ),
                              _option(
                                  "Packing List",
                                  () => print("packing list", groupTitle),
                                  "packingList"
                              ),
                              _option(
                                  "Production",
                                  () => print("production", groupTitle),
                                  "production"
                              ),
                          ])
                          .flat()
            ),
        ] as MenuOption[],
    };
    return ctx;
}

function _option(title, action, icon: IconKeys, subMenu: MenuOption[] = null) {
    const isHref = typeof action === "string";
    return {
        title,
        action: isHref ? undefined : action,
        icon,
        href: isHref ? action : undefined,
        subMenu,
    };
}
// export type ExtendedOption = Option | { groupHead: string; options: Option[] };
export interface MenuOption {
    title?: string;
    groupTitle?: string;
    action?;
    icon?: IconKeys;
    href?;
    subMenu?: MenuOption[];
}
