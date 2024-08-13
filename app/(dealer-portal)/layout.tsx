import ContactHeader from "../(storefront)/_components/contact-header";
import SiteFooter from "../(storefront)/_components/footer";
import SiteHeader from "../(storefront)/_components/site-header";
import DealerHeader from "./_components/header";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col">
            <div>
                <ContactHeader />
                <DealerHeader />
            </div>
            <div className="min-h-[80vh]">{children}</div>
            <div>
                <SiteFooter />
            </div>
        </div>
    );
}
