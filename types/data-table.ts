 
import { type z } from "zod"
 
 
import { type Icons } from "@/components/icons"

 
export interface Option {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}
  

export interface DataTableDateFilterColumn<TData> {
  id: keyof TData
  title: string
   rangeSwitch?: Boolean;
  range?: Boolean;
  filter?: DataTableFilterableColumn<TData>
}
export interface DataTableSearchableColumn<TData> {
  id: keyof TData
  title: string, 
}

export interface DataTableFilterableColumn<TData>
  extends DataTableSearchableColumn<TData> {
  options: Option[]
  single?: Boolean;
  
}
 
 
export interface TableShellProps<T> {
    data: T[]
    pageInfo: TablePageInfo
}
export interface TablePageInfo {
    pageIndex?: number | undefined;
    currentPage?: number | undefined;
    from?: number | undefined;
    to?: number | undefined; 
    pageCount?: number | undefined;
    totalItems?: number | undefined;
    hasPreviousPage?: Boolean;
}