"use client";

import { Progressor, getProgress } from "@/lib/status";
import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";

interface Props {
    status;
    score;
    total;
}
export default function ProgressStatus({ status, score, total }: Props) {
    const [progress, setProgress] = useState<Progressor>({} as any);
    useEffect(() => {
        setProgress(getProgress(score, total));
    }, [score, total, status]);

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
}
