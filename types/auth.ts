export type IPermissions =
    | "viewProject"
    | "editProject"
    | "viewDashboard"
    | "editDashboard"
    | "viewInvoice"
    | "editInvoice"
    | "viewRole"
    | "editRole"
    | "viewEmployee"
    | "editEmployee"
    | "viewProduction"
    | "editProduction"
    | "viewPrehungProduction"
    | "editPrehungProduction"
    | "viewDelivery"
    | "editDelivery"
    | "viewCustomerService"
    | "editCustomerService"
    | "viewTech"
    | "editTech"
    | "viewInstallation"
    | "editInstallation"
    | "viewAssignInstaller"
    | "editAssignInstaller"
    | "viewBuilders"
    | "editBuilders"
    | "viewCost"
    | "editCost"
    | "viewOrders"
    | "editOrders"
    | "viewSalesCustomers"
    | "editSalesCustomers"
    | "viewEstimates"
    | "editEstimates"
    | "viewOrderProduction"
    | "editOrderProduction"
    | "viewPriceList"
    | "editPriceList";
export interface ICan {
    viewProject?: Boolean;
    editProject?: Boolean;
    viewDashboard?: Boolean;
    editDashboard?: Boolean;
    viewInvoice?: Boolean;
    editInvoice?: Boolean;
    viewRole?: Boolean;
    editRole?: Boolean;
    viewEmployee?: Boolean;
    editEmployee?: Boolean;
    viewProduction?: Boolean;
    editProduction?: Boolean;
    viewPrehungProduction?: Boolean;
    editPrehungProduction?: Boolean;
    viewDelivery?: Boolean;
    editDelivery?: Boolean;
    viewCustomerService?: Boolean;
    editCustomerService?: Boolean;
    viewTech?: Boolean;
    editTech?: Boolean;
    viewInstallation?: Boolean;
    editInstallation?: Boolean;
    viewAssignInstaller?: Boolean;
    editAssignInstaller?: Boolean;
    viewBuilders?: Boolean;
    editBuilders?: Boolean;
    viewCost?: Boolean;
    editCost?: Boolean;

    viewOrders?: Boolean;
    editOrders?: Boolean;
    viewSalesCustomers?: Boolean;
    editSalesCustomers?: Boolean;
    viewEstimates?: Boolean;
    editEstimates?: Boolean;
    viewOrderProduction?: Boolean;
    editOrderProduction?: Boolean;
    viewOrderPayment?: Boolean;
    editOrderPayment?: Boolean;

    viewPriceList?: Boolean;
    editPriceList?: Boolean;

    viewCommunity?: Boolean;
    viewHrm?: Boolean;
    viewSales?: Boolean;

    viewInboundOrder?: Boolean;
    editInboundOrder?: Boolean;
    viewPutaway?: Boolean;
    editPutaway?: Boolean;

    viewDecoShutterInstall?: Boolean;
    editDecoShutterInstall?: Boolean;
}
