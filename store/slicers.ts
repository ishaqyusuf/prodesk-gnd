// import { ISalesOrder, ISalesOrderItem } from "@/types/ISales";
import { deepCopy } from "@/lib/deep-copy";
import { formatDate } from "@/lib/use-day";
import {
  Builders,
  CustomerTypes,
  Customers,
  EmployeeProfile,
  HomeTemplates,
  Projects,
  Roles,
  Users,
} from "@prisma/client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { store } from ".";
import { IOrderPrintMode, ISalesOrder, ISalesOrderItem } from "@/types/sales";
import { IProduct } from "@/types/product";
import { INotification } from "@/app/_actions/notifications";
import { ExtendedHome, IHome } from "@/types/community";
// import { IOrderPrintMode } from "@/app/(auth)/sales/orders/components/row-action/print-order-menu";

export interface ISlicer {
  order: ISalesOrder;
  productionUsers: Users[];
  assignProduction: ISalesOrder;
  orderProdView: Boolean;
  orderTimeline: ISalesOrder;
  prodItemUpdate: {
    item: ISalesOrderItem;
    action: "Complete" | "Cancel";
  };
  applyPayment: ISalesOrder[];
  notifications: INotification[];
  printHomes: {
    homes: ExtendedHome[];
    design: {
      [id in string]: string;
    };
  };
  printOrders: {
    mode: IOrderPrintMode;
    ids: number[];
    isClient;
    mockup?: Boolean;
    pdf?: Boolean;
  };
  printUnits: string[];
  modal: {
    name: ModalName;
    data: any;
  };
  dataPage: {
    id;
    data;
  };
  products: IProduct[];
  // staticList: IStaticList;
  staticCustomerProfiles: CustomerTypes[];
  staticBuilders: Builders[];
  staticProjects: Projects[];
  staticModels: HomeTemplates[];
  staticRoles: Roles[];
  staticEmployeeProfiles: EmployeeProfile[];
  staticPayableEmployees: Users[];
  staticTechEmployees: Users[];
  staticSalesCustomers: Customers[];
  refreshToken: string | undefined;
}

export type ModalName =
  | "assignProduction"
  | "salesComponent"
  | "salesPayment"
  | "salesTimeline"
  | "prodItemUpdate"
  | "email"
  | "catalog"
  | "customerForm"
  | "project"
  | "home"
  | "builder"
  | "modelTemplate"
  | "communityTemplate"
  | "modelCost"
  | "editInvoice"
  | "installCost"
  | "employee"
  | "jobOverview"
  | "editJob"
  | "submitJob"
  | "employeeProfile"
  | "customerProfile"
  | "activateProduction"
  | "customerServices"
  | undefined;
const initialState: ISlicer = ({
  modal: {
    name: undefined,
    data: null,
    staticList: {},
  },
} as Partial<ISlicer>) as any;
const headerNavSlice = createSlice({
  name: "slicers",
  initialState,
  reducers: {
    updateSlice(state, action: PayloadAction<{ key: keyof ISlicer; data }>) {
      const { key, data } = action.payload;
      // Object.entries(data).map(([k, v]) => {
      //         //   if (v instanceof Date) data[k] = formatDate(v);
      //   if (typeof v == "object") data[k] = transformObject(v);
      // });
      const d = transformObject(data);
      state[key] = d;
    },
  },
});
function transformObject(data) {
  if (!data) return;

  try {
    if (data)
      Object.entries(data).map(([k, v]) => {
        if (v instanceof Date) data[k] = formatDate(v);
        else if (typeof v == "object" && v != null) {
          data[k] = transformObject(v);
        }
      });
  } catch (error) {}
  return data;
}
export default headerNavSlice.reducer;
export const { updateSlice } = headerNavSlice.actions;
export function dispatchSlice(key: keyof ISlicer, data: any = null) {
  // if (data) data = deepCopy(data);
  store.dispatch(
    updateSlice({
      key,
      data: deepCopy(data),
    })
  );
}

export async function loadStaticList(key: keyof ISlicer, list, _loader) {
  if (!list) {
    const data = await _loader();
    console.log();
    dispatchSlice(key, deepCopy(data));
  }
}
