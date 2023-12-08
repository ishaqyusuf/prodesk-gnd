import { Inbox } from "@prisma/client";

export interface EmailProps extends Inbox {
    meta: {};
    reply_to?;
    data: any;
}
export interface EmailModalProps {
    email: {
        toName?;
        toEmail?;
        type;
        parentId;
        data;
        reply_to;
        from;
    };
    data?;
    order?;
}
