import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import { INav } from "@/store/headerNavSlice";

interface BreadcrumbsProps {
  segments: INav[];
  separator?: React.ComponentType<{ className?: string }>;
}

export function Breadcrumbs({ segments, separator }: BreadcrumbsProps) {
  const SeparatorIcon = separator ?? ChevronRightIcon;

  return (
    <nav
      aria-label="breadcrumbs"
      className="flex items-center text-sm font-medium text-muted-foreground"
    >
      {segments?.map((segment, index) => {
        const isLastSegment = index === segments.length - 1;

        return (
          <React.Fragment key={index}>
            <Link
              aria-current={isLastSegment ? "page" : undefined}
              href={segment.link || "/"}
              className={cn(
                "truncate transition-colors hover:text-muted-foreground",
                isLastSegment
                  ? "pointer-events-none text-muted-foreground"
                  : "text-foreground"
              )}
            >
              {segment.title}
            </Link>
            {!isLastSegment && (
              <SeparatorIcon className="mx-2 h-4 w-4" aria-hidden="true" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
