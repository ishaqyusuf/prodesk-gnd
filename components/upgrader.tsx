"use client";

// import dbUpgrade from "@/app/actions/upgrade/upgrade";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { dbUpgradeAction } from "@/app/_actions/upgrade/db-upgrade";
import Btn from "./btn";
import { fixSales } from "@/app/_actions/upgrade/fix-sales";
import {
  changeIzriEmail,
  fixUsersMeta,
} from "@/app/_actions/upgrade/hrm-upgrade";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  linkHomeTemplateCosts,
  upgradeCommunity,
  upgradeCostCharts,
  upgradeHomeTemplates,
  upgradeInstallPriceChart,
} from "@/app/_actions/upgrade/community";
import { Icons } from "./icons";
import { dotArray } from "@/lib/utils";
import { upgradeJobPayments } from "@/app/_actions/upgrade/jobs-upgrade";

export default function Upgrader() {
  const [isPending, startTransaction] = useTransition();
  const actions: { label; action?; children?: { label?; action? }[] }[] = [
    {
      label: "Sales Order",
      action: null,
    },
    {
      label: "Community",
      children: [
        { label: "Home Template", action: upgradeHomeTemplates },
        { label: "Install Price Chart", action: upgradeInstallPriceChart },
        { label: "Cost Chart", action: upgradeCostCharts },
        { label: "Link Home Total Cost", action: linkHomeTemplateCosts },
      ],
    },
    {
      label: "Hrm",
      children: [{ label: "Job Payments", action: upgradeJobPayments }],
    },
  ];
  const upgrade = useCallback(async () => {
    startTransaction(async () => {
      // await dbUpgradeAction();
      // await fixSales();
      // await changeIzriEmail();
      // console.log(await fixUsersMeta());
      toast.success("completed");
    });
  }, []);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="destructive"
            disabled={isPending}
            className="flex h-8  data-[state=open]:bg-muted"
          >
            {isPending && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            <span className="">Upgrade</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[185px]">
          {actions.map((a, id) => {
            if (a.children)
              return (
                <DropdownMenuSub key={id}>
                  <DropdownMenuSubTrigger>{a.label}</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {a.children.map((ac, sid) => (
                      <DropdownMenuItem
                        key={`sub-${sid}`}
                        onClick={() => {
                          startTransaction(async () => {
                            console.log(await ac.action());
                          });
                        }}
                      >
                        {ac.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            return (
              <DropdownMenuItem
                key={id}
                onClick={() => {
                  startTransaction(async () => {
                    if (a.action) console.log(await a.action());
                  });
                }}
              >
                Install Price Chart
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* <Btn isLoading={isPending} onClick={() => upgrade()}>
        Upgrade
      </Btn> */}
    </>
  );
}
function convertKeysToCamelCase(obj) {
  const camelCaseKey = (key) =>
    key.replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
  //.replace(/\.([a-zA-Z])/g, (_, c) => c.toUpperCase());

  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split(".");
    let currentObj = newObj;

    for (const [index, camelKey] of keys.map(camelCaseKey).entries()) {
      if (index === keys.length - 1) {
        currentObj[camelKey] = value;
      } else {
        currentObj[camelKey] = currentObj[camelKey] || {};
        currentObj = currentObj[camelKey];
      }
    }
  }
  return newObj;
}
// function convertKeysToCamelCase(obj) {
//   const camelCaseKey = (key) =>
//     key.replace(/\.([a-zA-Z])/g, (_, c) => c.toUpperCase());

//   const newObj = {};
//   for (const [key, value] of Object.entries(obj)) {
//     const keys = key.split(".");
//     let currentObj = newObj;

//     for (const [index, camelKey] of keys.map(camelCaseKey).entries()) {
//       if (index === keys.length - 1) {
//         currentObj[camelKey] = value;
//       } else {
//         currentObj[camelKey] = currentObj[camelKey] || {};
//         currentObj = currentObj[camelKey];
//       }
//     }
//   }
//   return newObj;
// }
// function convertKeysToCamelCase(obj) {
//   const camelCaseKey = (key) =>
//     key.replace(/\.([a-zA-Z])/g, (_, c) => c.toUpperCase());

//   const newObj = {};
//   for (const [key, value] of Object.entries(obj)) {
//     const camelKey = camelCaseKey(key);
//     if (value !== null && typeof value === "object" && !Array.isArray(value)) {
//       newObj[camelKey] = convertKeysToCamelCase(value);
//     } else {
//       newObj[camelKey] = value;
//     }
//   }
//   return newObj;
// }
const design = {
  entry: {
    orientation: "LH",
    six_eight: "2 - 3-0",
    bore: "Two",
    material: "Fiber",
  },
  garage_door: { material: "Wood", bore: "TWO" },
  interior_door: {
    style: "PREHUNG COLONIST",
    casing_style: "WM366 COLONIAL 2-1/4",
    height_1: "6/8",
    two_six_1_lh: "4",
    two_eight_1_lh: "1",
    two_six_1_rh: "1",
  },
  double_door: [],
  bifold_door: {
    five: "2",
    two: "3",
    three_ll: "1 + 1 - 3/0 LL METAL",
    casing: "4 \u00bc",
    qty: "25/16",
  },
  lock_hardware: [],
  deco_shutters: [],
};
