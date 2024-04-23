import SalesModals from "@/app/(v2)/(loggedIn)/sales/_modals";

export default function SalesLayout({ children }) {
    return (
        <>
            {children}
            <SalesModals legacy />
        </>
    );
}
