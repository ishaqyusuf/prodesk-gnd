import PagesTab from "../../_common/_components/pages-tab";

export default async function Layout({ children }) {
    return (
        <>
            <PagesTab />
            {children}
        </>
    );
}
