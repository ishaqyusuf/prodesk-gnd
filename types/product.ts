import { InventoryProducts, ProductVariants, Products } from "@prisma/client";

export interface IProduct extends InventoryProducts {
  variants: IProductVariant[];
}
export type IProductVariant = ProductVariants & {
  meta: IProductVariantMeta;
  product: IProduct;
};
export interface IProductVariantMeta {
  componentTitle;
}
