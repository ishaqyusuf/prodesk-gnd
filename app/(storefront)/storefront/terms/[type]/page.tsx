import { userId } from "@/app/(v1)/_actions/utils";
import MDX from "@/components/common/mdx";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function TermsPage({ params }) {
    const term = await prisma.blogs.findUnique({
        where: {
            slug: params.type,
        },
    });
    if (!term) {
        await prisma.blogs.create({
            data: {
                authorId: 1,
                slug: params.type,
                title: params.type,
                content: `---
      title: RSC Frontmatter Example
      ---
      # Hello World
      This is from Server Components!
    `,
                meta: {},
                type: "terms",
            },
        });
        revalidatePath("/terms/[type]");
        redirect(`/terms/${params.type}`);
    }
    return (
        <div>
            <MDX
                source={`---
      title: RSC Frontmatter Example
      ---
      # Hello World
      This is from Server Components!
    `}
            />
        </div>
    );
}
