import { Metadata } from "next";
import { CarouselSection } from "./_components/carousel-section";
import WhyUsSection from "./_components/why-use";

export const metadata: Metadata = {
    title: "GND Millwork - Storefront",
};
export default function StoreFrontPage({}) {
    return (
        <div>
            <CarouselSection />
            <WhyUsSection />
        </div>
    );
}
