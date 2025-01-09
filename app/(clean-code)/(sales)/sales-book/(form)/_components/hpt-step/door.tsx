import Button from "@/components/common/button";
import { ComponentImg } from "../component-img";
import { HptContext } from "./ctx";

interface DoorProps {
    door: HptContext["doors"][number];
}
export function Door({ door }: DoorProps) {
    return (
        <div className="flex gap-4s flex-col h-full items-center">
            <div className="">
                <Button>Change Door</Button>
            </div>
            <div className="w-2/3">
                <ComponentImg noHover aspectRatio={1 / 2} src={door.img} />
            </div>
        </div>
    );
}
