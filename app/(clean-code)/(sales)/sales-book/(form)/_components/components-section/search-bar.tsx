import { Input } from "@/components/ui/input";
import { UseStepContext } from "./ctx";

interface Props {
    ctx: UseStepContext;
}
export default function SearchBar({ ctx }: Props) {
    // console.log(ctx.tabComponents);

    if (ctx.tabComponents?.length < 2) return null;
    return (
        <div>
            <Input
                className="h-8"
                placeholder="Search"
                defaultValue={ctx.q}
                onChange={(e) => ctx.setQ(e.target.value)}
            />
        </div>
    );
}
