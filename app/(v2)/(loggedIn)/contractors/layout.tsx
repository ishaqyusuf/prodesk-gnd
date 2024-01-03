import ContractorModals from "./_modals";

export default function CommunityLayout({ children }) {
    return (
        <>
            {children}
            <ContractorModals />
        </>
    );
}
