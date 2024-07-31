import { useModal } from "@/components/common/modal/provider";

interface Props {}
export function useDoorSizeModal() {
    const modal = useModal();
    return {
        open() {},
    };
}
export default function DoorSizeModal({}: Props) {}
