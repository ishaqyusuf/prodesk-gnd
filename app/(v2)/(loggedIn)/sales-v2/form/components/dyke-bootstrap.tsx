import { Button } from "@/components/ui/button";
import {
    dykeImages,
    dykeInteriors,
    dykeStepValues,
} from "@/lib/data/dyke-interiors";
import { toast } from "sonner";
import { uploadFile } from "@/lib/upload-file";
import { dykeExteriorBootstrap } from "../_action/dyke-exterior-bootstrap";
import { bootstrapShelfItems } from "../_action/bootstraps/shelf-items";

export default function DykeBootstrap() {
    return <></>;
    return (
        <>
            <Button
                onClick={async () => {
                    console.log(await bootstrapShelfItems());
                }}
            >
                Dyke Shelfs
            </Button>
        </>
    );
    return (
        <div className="flex space-x-3">
            <Button
                onClick={async () => {
                    const data = await dykeExteriorBootstrap();
                    console.log(data);

                    toast.success("DONE");
                }}
            >
                Exterior Bootstrap
            </Button>
            <Button
                onClick={async () => {
                    toast.success("DONE");
                }}
            >
                Dyke Bootstraps
            </Button>
            <Button
                onClick={async () => {
                    const prods = dykeInteriors.stepProducts.filter(
                        (p, i) =>
                            i ==
                            dykeInteriors.stepProducts.findIndex(
                                (a, b) =>
                                    p.productId == a.productId &&
                                    p.stepId == a.stepId
                            )
                    );
                    console.log(prods);
                }}
            >
                Fix Duplicate Step products
            </Button>
            <Button
                onClick={async () => {
                    // const imgs = dykeImages();
                    const imgs = [
                        {
                            src: "https://s3.us-east-2.amazonaws.com/dyke-site-assets/resources/doorparts/900aa0675330001688671392.jpg",
                            src0: "res/900aa0675330001688671392.jpg",
                        },
                    ];

                    const replace = {};

                    // console.log(imgs);
                    // return;
                    // const test = imgs.filter((_, i) => i < 5);
                    await Promise.all(
                        imgs.map(async ({ src, src0 }, index) => {
                            // if (index > 2) return;
                            const u = await uploadFile(src, "dyke");
                            // console.log(u);
                            if (u && u.secure_url)
                                replace[src0] = u.secure_url.split("dyke/")[1];
                            else {
                                console.log("error", u);
                            }
                        })
                    );
                    const prods = dykeInteriors.products.map((p) => {
                        if (p.img) {
                            let newImg = replace[p.img as any];
                            if (newImg) p.img = newImg;
                        }
                        return p;
                    });
                    console.log(prods);
                }}
            >
                Dyke Imgs
            </Button>
        </div>
    );
}
