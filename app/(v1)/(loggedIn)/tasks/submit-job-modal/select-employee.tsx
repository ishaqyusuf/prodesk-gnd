import { useContext } from "react";
import { SubmitModalContext } from "./context";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SelectEmployee({ data }) {
    const {
        isPunchout,
        resetFields,
        form,
        prevTab,
        setTab,
        setPrevTab,
        tab,
        techEmployees,
        search,
        _changeWorker,
        _setTab,
    } = useContext(SubmitModalContext);
    // const {resetFields} = form;
    return (
        <ScrollArea className="h-[350px] pr-4">
            <div className="flex flex-col divide-y">
                {search(techEmployees, "name")?.map((user) => (
                    <Button
                        onClick={async () => {
                            if (data?.changeWorker) {
                                await _changeWorker(
                                    data?.data?.id,
                                    data?.data?.userId,
                                    user?.id
                                );
                                toast.success("Worker changed!");
                                closeModal();
                                return;
                            }
                            form.setValue("userId", user.id as any);

                            _setTab("tasks");
                        }}
                        variant={"ghost"}
                        key={user.id}
                        className=""
                    >
                        <p className="flex w-full">{user.name}</p>
                    </Button>
                ))}
            </div>
        </ScrollArea>
    );
}
