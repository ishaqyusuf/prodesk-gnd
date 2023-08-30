export type Any<T> = Partial<T> & any;

export type OmitMeta<T> = Omit<T, "meta">;
