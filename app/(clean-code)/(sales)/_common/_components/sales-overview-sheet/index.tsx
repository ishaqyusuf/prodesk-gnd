import { _modal } from "@/components/common/modal/provider";
import { salesOverviewStore, SalesTabs, salesTabs } from "./store";
import Modal from "@/components/common/modal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { SalesInfoTab } from "./sales-info-tab";
import { useSalesOverview } from "./hook";
import { Footer } from "./footer";
import { SalesItemsTab } from "./sales-items-tab";

interface OpenSalesOverviewProps {
    salesId;
}
export function openSalesOverview(props: OpenSalesOverviewProps) {
    salesOverviewStore.getState().reset({
        salesId: props.salesId,
        tabs: salesTabs.admin,
        showTabs: true,
        // currentTab: "sales_info",
        showFooter: true,
        adminMode: true,
    });
    _modal.openSheet(<SalesOverviewModal />);
}
export function openSalesProductionModal(props: OpenSalesOverviewProps) {
    salesOverviewStore.getState().reset({
        salesId: props.salesId,
        tabs: salesTabs.admin,
        currentTab: "items",
        adminMode: true,
    });
    _modal.openSheet(<SalesOverviewModal />);
}
export function openSalesProductionTasksModal(props: OpenSalesOverviewProps) {
    salesOverviewStore.getState().reset({
        salesId: props.salesId,
        tabs: salesTabs.admin,
        currentTab: "items",
    });
    _modal.openSheet(<SalesOverviewModal />);
}

interface Props {}
export default function SalesOverviewModal({}: Props) {
    useSalesOverview();
    return (
        <Modal.MultiPane>
            <Modal.Pane>
                <PrimaryTab />
            </Modal.Pane>
        </Modal.MultiPane>
    );
    // return (
    //     <Modal.Content size="none" className="side-modal-rounded">
    //         <div className="flex-1 flex">
    //             {/* PRIMARY TAB */}
    //             <PrimaryTab />
    //             {/* <div className="w-[600px] flex flex-col side-modal-rounded-h-content">
    //                 <Modal.Header title="Title" />
    //                 <Modal.ScrollArea>
    //                     <div className="min-h-screen bg-red-50">abc</div>
    //                 </Modal.ScrollArea>
    //                 <Modal.Footer>
    //                     <div className="abc h-16 flex-1 bg-red-400">a</div>
    //                 </Modal.Footer>
    //             </div> */}
    //         </div>
    //     </Modal.Content>
    // );
}
function PrimaryTab({}) {
    const store = salesOverviewStore();
    // className = "w-[600px] flex flex-col side-modal-rounded-h-content";
    return (
        <>
            <Modal.Header
                title={
                    <span className="uppercase">
                        {store?.overview?.title || "Loading..."}
                    </span>
                }
                subtitle={store?.overview?.subtitle}
            />
            <Tabs
                value={store.currentTab}
                onValueChange={(e) => {
                    store.update("currentTab", e as any);
                }}
                className=""
            >
                <TabsList className={cn("w-full", !store.showTabs && "hidden")}>
                    {store.tabs?.map((tab) => (
                        <TabsTrigger
                            className="uppercase"
                            key={tab.name}
                            value={tab.name}
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            <Modal.ScrollArea className="my-2">
                <TabContent tabName="sales_info">
                    <SalesInfoTab />
                </TabContent>
                <TabContent tabName="items">
                    <SalesItemsTab />
                </TabContent>
            </Modal.ScrollArea>
            {store.showFooter && (
                <Modal.Footer>
                    <Footer />
                </Modal.Footer>
            )}
        </>
    );
}

function TabContent({ children, tabName }: { children?; tabName: SalesTabs }) {
    const store = salesOverviewStore();
    return store.currentTab == tabName ? children : null;
}
function SecondaryTab({}) {
    return (
        <div className="sm:w-[600px] flex flex-col side-modal-rounded-h-content">
            <Modal.Header title="Title" subtitle={"LOREM IPSUM"} />
            <Modal.ScrollArea>
                <div className="min-h-screen">abc</div>
            </Modal.ScrollArea>
            <Modal.Footer>
                <div className="abc p-4 border-t flex-1">a</div>
            </Modal.Footer>
        </div>
    );
}
