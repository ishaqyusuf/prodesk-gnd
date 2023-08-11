import { InventoryProducts, ProductVariants, Products } from "@prisma/client";

export interface IProduct extends InventoryProducts {
  variants: IProductVariants[];
}
export interface IProductVariants extends ProductVariants {
  meta: {
    componentTitle;
  };
}
