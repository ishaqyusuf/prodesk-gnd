import Button from "@/components/common/button";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import ControlledInput from "@/components/common/controls/controlled-input";
import ControlledSelect from "@/components/common/controls/controlled-select";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useSalesOverview } from "../overview-provider";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import MailBox from "../../mail-box";

export default function NotificationTab() {
    const ctx = useSalesOverview();
    return <MailBox type="sales" id={ctx.item?.id} />;
    // return (
    //     <div>
    //         <EmailHeader />
    //         <EmailFooterForm />
    //     </div>
    // );
}
