"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DollarSign, LineChart } from "lucide-react";

interface Props {
  children?;
}
export function StatCardContainer({ children }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{children}</div>
  );
}
interface StatCardProps {
  label: string;
  info?;
  money?: Boolean;
  icon?: "dollar" | "line";
  value;
}
export function StartCard({ label, value, money, icon, info }: StatCardProps) {
  let Icon: any = null;
  switch (icon) {
    case "dollar":
      Icon = DollarSign;
      break;
    case "line":
      Icon = LineChart;
      break;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <div>{Icon && <Icon className="h-4 w-4 text-muted-foreground" />}</div>
        {/* <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg> */}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {money ? formatCurrency.format(value) : value}
        </div>
        <p className="text-xs text-muted-foreground">
          {/* +20.1% from last month */}
          {info}
        </p>
      </CardContent>
    </Card>
  );
}
