import { getBadgeColor } from "@/lib/status-badge";
import { IHome, IHomeStatus } from "@/types/community";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
interface Props {
  home: IHome;
}
export function HomeProductionStatus({ home }: Props) {
  let [status, setStatus] = useState<IHomeStatus>({} as any);
  useEffect(() => {
    const prod = home?.tasks?.filter((t) => t.produceable);
    const produceables = prod?.length;
    const produced = prod?.filter((p) => p.producedAt).length;
    const pending = produceables - produced;
    let productionStatus = "Idle";
    const sent = prod?.filter((p) => p.sentToProductionAt)?.length;

    if (sent > 0) productionStatus = "Queued";
    if (produced > 0) {
      productionStatus = "Started";
      if (produced == produceables) productionStatus = "Completed";
    }

    setStatus({
      produceables,
      produced,
      pendingProduction: pending,
      productionStatus,
      badgeColor: getBadgeColor(productionStatus),
    });
  }, [home]);
  return (
    <div className="w-16">
      <Badge
        variant={"secondary"}
        className={`h-5 px-1 whitespace-nowrap  text-xs text-slate-100 ${status.badgeColor}`}
      >
        {status.productionStatus}
      </Badge>
    </div>
  );
}
export function HomeInstallationStatus({ home }: Props) {
  return (
    <div className="w-16">
      <Badge
        variant={"secondary"}
        className={cn(
          `h-5 px-1 whitespace-nowrap  text-xs text-slate-100`,
          home.jobs?.length > 0 ? "bg-green-600" : "bg-pink-600"
        )}
      >
        {home.jobs?.length || 0} submitted
      </Badge>
    </div>
  );
}
