import { _dbUser, user } from "@/app/_actions/utils";
import { Metadata } from "next";
import EmailPersolizeForm from "./email-personalize-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import { IUser } from "@/types/hrm";

export const metadata: Metadata = {
    title: "Email Settings",
};

export default async function EmailSettingsPage({}) {
    const _user: IUser = await _dbUser();
    if (!_user.meta) _user.meta = {} as any;
    if (!_user.meta.emailRespondTo) _user.meta.emailRespondTo = _user.email;
    delete (_user.meta as any).exception;
    // console.log(_user.meta);
    if (!_user.meta.emailTitle)
        _user.meta.emailTitle = `${
            _user.name?.split(" ")?.[0]
        } From Gnd Millwork`;
    if (!_user.meta.email) {
        const p1 = _user.username || _user.email?.split("@")[0];
        _user.meta.email = `${p1}@gndprodesk.com`;
    }
    return (
        <>
            <Breadcrumbs>
                <BreadLink isFirst title="Settings" />
                <BreadLink isLast title="Email" />
            </Breadcrumbs>
            <EmailPersolizeForm user={_user as any} />
        </>
    );
}
