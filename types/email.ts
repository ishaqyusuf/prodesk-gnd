import { Inbox } from "@prisma/client";

export interface EmailProps extends Inbox {
    meta: {};
    data: any;
}
export interface EmailModalProps {
    email: {
        toName?;
        toEmail?;
        type;
        parentId;
        data;
        from;
    };
    data?;
    order?;
}
