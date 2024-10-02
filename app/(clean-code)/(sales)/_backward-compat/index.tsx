"use client";
import Portal from "@/components/_v1/portal";
import { Menu } from "../../../../components/(clean-code)/menu";
import { Icons } from "@/components/_v1/icons";
import SalesStat from "./sales-stat";

export default function BackwardCompat({}) {
    return (
        <Portal nodeId={"navRightSlot"}>
            <Menu Icon={Icons.X}>
                <SalesStat />
            </Menu>
        </Portal>
    );
}
