import { Badge } from "@/components/ui/badge";
import { getOpenItem } from "../helper";

export function ItemAssignments({}) {
    const itemView = getOpenItem();
    const assignments = itemView.assignments;
    if (!itemView.produceable) return null;
    if (!assignments.length) return <div className="">No Assignment</div>;
    return (
        <div className="py-2 font-mono">
            <div className="border-b flex items-center">
                <span>Assignments</span>
                <div className=""></div>
            </div>
            {assignments.map((assignment, index) => (
                <div key={assignment.id} className="">
                    <div className="flex gap-4">
                        <span>{index + 1}.</span>
                        <span>{assignment?.assignedTo || "Not Assigned"}</span>
                        {assignment.pills.map((pill, pillId) => (
                            <Badge className="uppercase" key={pillId}>
                                {pill}
                            </Badge>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
