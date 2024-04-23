import ContractorModals from "@/app/(v2)/(loggedIn)/contractors/_modals";

export default async function SalesLayout({ children }) {
    return (
        <div className="px-8 lg:px-16">
            {children}
            <ContractorModals />
        </div>
    );
}
