"use client";

import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  isFirst?: Boolean;
  isLast?: Boolean;
  link?;
  title?;
  slug?;
}
export function BreadLink({ isFirst, isLast, link, title }: Props) {
  return (
    <>
      <Link
        aria-current={isLast ? "page" : undefined}
        href={link || "/"}
        className={cn(
          "truncate transition-colors hover:text-muted-foreground",
          isLast
            ? "pointer-events-none text-muted-foreground"
            : "text-foreground"
        )}
      >
        {title}
      </Link>
      {!isLast && (
        <ChevronRightIcon className="mx-2 h-4 w-4" aria-hidden="true" />
      )}
    </>
  );
}

export const ProductionsCrumb = (props: Props) => (
  <BreadLink {...props} title="Productions" link="/sales/productions" />
);
export const OrdersCrumb = (props: Props) => (
  <BreadLink {...props} title="Orders" link="/sales/orders" />
);
export const EstimatesCrumb = (props: Props) => (
  <BreadLink {...props} title="Estimates" link="/sales/estimates" />
);
export const OrderViewCrumb = (props: Props) => (
  <BreadLink
    {...props}
    link={`/sales/order/${props.slug}`}
    title={props.slug}
  />
);
