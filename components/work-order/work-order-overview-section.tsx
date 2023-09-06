import { useAppSelector } from "@/store";
import { IWorkOrder } from "@/types/customer-service";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function WorkOrderOverviewSection({}) {
  const workOrder: IWorkOrder = useAppSelector((s) => s.slicers.dataPage.data);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="inline-flex items-center space-x-2">
            <span>
              {workOrder.projectName} {workOrder.lot}
              {"/"}
              {workOrder.block}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y space-y-4 flex flex-col">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3"></div>
      </CardContent>
    </Card>
  );
}
