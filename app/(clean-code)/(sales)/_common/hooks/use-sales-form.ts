import { useFormContext } from "react-hook-form";
import { DykeForm } from "../data-access/sales-form-dta";
import { useContext } from "react";
import { DykeFormContext } from "@/app/(v2)/(loggedIn)/sales-v2/form/_hooks/form-context";

export const useDykeForm = () => useFormContext<DykeForm>();
export const useDykeCtx = () => useContext(DykeFormContext);
