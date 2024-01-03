import { useStaticProjects } from "@/_v2/hooks/use-static-data";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { SubmitJobForm } from ".";
import useSubmitJob from "@/app/(v1)/(auth)/tasks/submit-job-modal/use-submit-job";
import AutoComplete from "@/components/_v1/common/auto-complete";
export default function ProjectFormSection() {
    const ctx = useSubmitJob();
    const projects = useStaticProjects();
    return (
        <div className="grid grid-cols-2 gap-2">
            <div className="">
                <FormField<SubmitJobForm>
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
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
