import { InventoryProducts, ProductVariants, Products } from "@prisma/client";

export interface IProduct extends InventoryProducts {
  variants: IProductVariant[];
}
export interface IProductVariant extends ProductVariants {
  meta: {
    componentTitle;
  };
  product: IProduct;
}
