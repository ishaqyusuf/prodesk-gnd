"use client";

import { Progressor, getProgress } from "@/lib/status";
import { useEffect, useState } from "react";
import { Progress } from "../ui/progress";
import StatusBadge from "./status-badge";

interface Props {
    status;
    score?;
    total?;
    fallBackStatus?;
}
export default function ProgressStatus({
    status,
    score,
    total,
    fallBackStatus = "Unknown",
}: Props) {
    const [progress, setProgress] = useState<Progressor | null>({} as any);
    useEffect(() => {
        setProgress(getProgress(score, total));
    }, [score, total, status]);
    if (progress?.total)
        return (
            <div className="w-20">
                {progress.percentage > 0 && (
                    <p>
                        <Progress
                            value={progress.percentage}
                            color={progress.color}
                            className="h-2"
                        />
                    </p>
                )}
                {status && (
                    <p className="text-sm text-muted-foreground">{status}</p>
                )}
            </div>
        );
    return <StatusBadge status={status || fallBackStatus} />;
}
