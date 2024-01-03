import { useStaticProjects } from "@/_v2/hooks/use-static-data";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { SubmitJobForm } from ".";
import AutoComplete from "@/components/_v1/common/auto-complete";
import useSubmitJob from "./use-submit-job";
export default function ProjectFormSection() {
    const ctx = useSubmitJob();
    const projects = useStaticProjects();
    async function projectSelected(e) {
        console.log(e);
    }
    return (
        <div className="grid grid-cols-2 gap-2">
            <div className="">
                <FormField
                    name="job.projectId"
                    control={ctx.form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Project</FormLabel>
                            <FormControl>
                                <AutoComplete
                                    {...field}
                                    itemText={"title"}
                                    itemValue={"id"}
                                    options={projects.data}
                                    onSelect={projectSelected}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    name="job.homeId"
                    control={ctx.form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <FormControl>
                                <AutoComplete
                                    {...field}
                                    itemText={"title"}
                                    itemValue={"id"}
                                    options={projects.data}
                                    onSelect={projectSelected}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
