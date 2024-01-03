import ContractorModals from "@/app/(v2)/(loggedIn)/contractors/_modals";

export default function ContractorLayout({ children }) {
    return (
        <>
            {children}
            <ContractorModals />
        </>
    );
}
