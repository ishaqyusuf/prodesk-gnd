import { SalesFormFeatureSwitch } from "@/components/sales-form-feature-switch";

export default function Layout({ children }) {
    return (
        <>
            <SalesFormFeatureSwitch />
            {children}
        </>
    );
}
