"use client";

import { useEffect, useState } from "react";

export default function DoorSvgsPage() {
    const [doors, setDoors] = useState([]);
    useEffect(() => {
        console.log(doors);
    }, [doors]);

    return <div></div>;
}

function Door({ title, svg, localSvg, index }) {}
