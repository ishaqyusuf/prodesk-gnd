import Link from "next/link";

export default async function DebugLayout({ children }) {
    return (
        <div>
            <div className="p-4 flex gap-4">
                <Link href={"/debug/sheet"}>Sheet</Link>
                <Link href={"/debug/command-input"}>Command</Link>
            </div>
            {children}
        </div>
    );
}
