import { useFormContext } from "react-hook-form";
import { DykeFormData } from "../data-access/sales-form-dta";

export const useDykeForm = () => useFormContext<DykeFormData>();
