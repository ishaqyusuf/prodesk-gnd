import { getCustomerService } from "@/app/_actions/customer-services/crud";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import { DataPageShell } from "@/components/shells/data-page-shell";
import WorkOrderOverviewSection from "@/components/work-order/work-order-overview-section";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Customer Service",
  description: "",
};

export default async function CustomerServicePage({ params: { slug } }) {
  const workOrder = await getCustomerService(slug);
  metadata.description = workOrder?.homeOwner;
  if (!workOrder) return notFound();
  return (
    <DataPageShell className="px-8" data={workOrder}>
      <Breadcrumbs>
        <BreadLink
          isFirst
          title="Customer Services"
          link="/customer-services"
        />
        <BreadLink
          title={`${workOrder?.projectName} ${workOrder?.lot}/${workOrder?.block}`}
        />
      </Breadcrumbs>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 flex flex-col space-y-4">
          <WorkOrderOverviewSection />
        </div>
      </div>
    </DataPageShell>
  );
}
