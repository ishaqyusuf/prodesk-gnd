import { Icons } from "@/components/_v1/icons";
import { User2 } from "lucide-react";

export default function AcccountHeader() {
    return (
        <button className="flex space-x-2 items-center">
            <User2 className="w-4 h-4" />
            <span>My Account</span>
        </button>
    );
}
