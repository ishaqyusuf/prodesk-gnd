"use client";

import { Icons } from "@/components/_v1/icons";
import { Button } from "@/components/ui/button";
import { dykeDoorsSvg } from "@/lib/data/dyke-doors-svg";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import SVG from "react-inlinesvg";

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
    function save() {
        const _svg = document.querySelectorAll(`div#door-${index} svg`);
        console.log(svg);
        // setDoors((doors) => {
        //     let d = [
        //         ...doors.map((door, i) => {
        //             if (i == index) door.svg = _svg;
        //             return door;
        //         }),
        //     ];
        //     return d;
        // });
    }
    return (
        <div className={cn("border rounded-lg p-1")} id={`door-${index}`}>
            {!svg ? (
                <>
                    {load ? (
                        <div className="relative">
                            <div className="absolute top-0 right-0 -m-4">
                                {load && (
                                    <Button
                                        onClick={save}
                                        className="w-8 h-8"
                                        size={"icon"}
                                    >
                                        <Icons.copy className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            <div id="object" className="">
                                <object data={url} type={"image/svg+xml"} />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <Button size={"sm"} onClick={(e) => setLoad(true)}>
                                Load
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div>
                    <SVG src={svg} />
                </div>
            )}
            <p className="text-xs">{title}</p>
        </div>
    );
}
