import { prisma } from "@/db";
import SalesDownload from "./sales";

export default async function DownloadPage({ params }) {
    const [path, token, slug]: ["sales", string, string] = params.slugs;

    const order = await prisma.salesOrders.findFirst({
        where: {
            orderId: slug,
        },
    });
    return <SalesDownload id={order.id} mode={order.type} />;
}
