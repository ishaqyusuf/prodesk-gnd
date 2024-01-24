"use client";

import { Button } from "@/components/ui/button";
import { dykeDoorsSvg } from "@/lib/data/dyke-doors-svg";
import { useEffect, useState } from "react";
import { set } from "react-hook-form";

export default function DoorSvgsPage() {
    const [doors, setDoors] = useState<typeof dykeDoorsSvg>([]);
    useEffect(() => {
        console.log(doors);
        setDoors(dykeDoorsSvg);
    }, [doors]);

    return (
        <div>
            <div className="grid grid-cols-4 gap-4">
                {doors.map((d, i) => (
                    <Door {...d} key={i} index={i} setDoors={setDoors} />
                ))}
            </div>
        </div>
    );
}

function Door({ title, svg, url, index, setDoors }: any) {
    const [load, setLoad] = useState(false);
    if (!svg)
        return (
            <div>
                {load ? (
                    <object data={url} type={"image/svg+xml"} />
                ) : (
                    <div>
                        <Button onClick={(e) => setLoad(false)}>Load</Button>
                    </div>
                )}
                <p className="text-xs">{title}</p>
            </div>
        );
}
