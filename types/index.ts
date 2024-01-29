import { Icons } from "@/components/_v1/icons";

export interface PageProps<T = {}> {
    params: T;
    searchParams: SearchParams;
}
export interface NavItem {
    title: string;
    href?: string;
    disabled?: boolean;
    external?: boolean;
    icon?: keyof typeof Icons;
    label?: string;
    description?: string;
}

export interface NavItemWithChildren extends NavItem {
    items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
    items?: NavItemWithChildren[];
}

export interface FooterItem {
    title: string;
    items: {
        title: string;
        href: string;
        external?: boolean;
    }[];
}

export type MainNavItem = NavItemWithOptionalChildren;
export interface SearchParams {
    [key: string]: string | string[] | undefined;
}

export interface DataTableSearchableColumn<TData> {
    id: keyof TData;
    title: string;
}
export interface Option {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
}
export interface DataTableFilterableColumn<TData>
    extends DataTableSearchableColumn<TData> {
    options: Option[];
}
// type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;
export type DataTableType<T extends (...args: any) => any> = Awaited<
    ReturnType<T>
> extends { data: infer U }
    ? U extends Record<number, any>
        ? U[0]
        : never
    : never;
export type PromiseDataTable<T extends (...args: any) => any> = Promise<
    Awaited<ReturnType<T>>
>;
