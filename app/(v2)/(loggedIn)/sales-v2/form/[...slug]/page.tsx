import { Metadata } from "next";
import SalesFormComponent from "../components";

export const metadata: Metadata = {
    title: "Sales Form",
};
export default async function SalesForm({ searchParams, params }) {
    return (
        <div>
            <SalesFormComponent />
        </div>
    );
}
