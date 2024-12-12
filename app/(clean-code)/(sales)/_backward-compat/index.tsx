"use client";
import Portal from "@/components/_v1/portal";
import { Menu } from "../../../../components/(clean-code)/menu";
import { Icons } from "@/components/_v1/icons";
import SalesStat from "./sales-stat";
import DevOnly from "@/_v2/components/common/dev-only";
import HtpDoors from "./hpt-doors";
import DoorPriceHarvest from "./door-price-harvest";
import Customers from "./customers";

export default function BackwardCompat({}) {
    return (
        <DevOnly>
            <Portal nodeId={"navRightSlot"}>
                <Menu Icon={Icons.X}>
                    <SalesStat />
                    <HtpDoors />
                    <DoorPriceHarvest />
                    <Customers />
                </Menu>
            </Portal>
        </DevOnly>
    );
}
