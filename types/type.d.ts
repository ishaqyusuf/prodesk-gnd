declare module "cloudinary";

export type Any<T> = Partial<T> & any;

export type OmitMeta<T> = Omit<T, "meta">;

export interface IDataPage<T> {
    id;
    data: T;
}
export type MakeArray<T> = {
    [P in keyof T]: T[P][];
};

