import { cn, sum, toNumber } from "@/lib/utils";

import { createContext, useContext, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { _modal } from "@/components/common/modal/provider";
import { ComponentHelperClass } from "../../../_utils/helpers/zus/zus-helper-class";
import DoorSizeSelectModal from ".";

export const useCtx = () => useContext(DoorSizeSelectContext);
export const DoorSizeSelectContext =
    createContext<ReturnType<typeof useInitContext>>(null);

export function useInitContext(cls: ComponentHelperClass) {
    const memoied = useMemo(() => {
        const priceModel = cls.getDoorPriceModel();

        const sizeList = priceModel.sizeList.filter(
            (s) => s.height == priceModel.height
        );
        let groupItem = cls.getItemForm().groupItem;
        const routeConfig = cls.getRouteConfig();

        const componentUid = cls.componentUid;
        const selections: {
            [id in string]: {
                salesPrice: number | string;
                basePrice: number;
                swing: string;
                qty: {
                    lh: number | string;
                    rh: number | string;
                    total: number | string;
                };
            };
        } = {};
        const sList = sizeList.map((sl) => {
            const path = `${componentUid}-${sl.size}`;
            const sizeData = groupItem?.form?.[path];
            const basePrice =
                priceModel?.formData?.priceVariants?.[sl.size]?.price;
            let salesPrice = basePrice;
            selections[path] = {
                salesPrice,
                basePrice,
                swing: sizeData?.swing || "",
                qty: {
                    lh: sizeData?.qty?.lh || "",
                    rh: sizeData?.qty?.rh || "",
                    total: sizeData?.qty?.total || "",
                },
            };
            return {
                path,
                ...sl,
            };
        });
        return { selections, sList, priceModel, routeConfig };
    }, [cls]);
    const { selections, sList, priceModel, routeConfig } = memoied;
    const form = useForm({
        defaultValues: {
            selections,
        },
    });
    function updateDoorForm(clear = false) {
        const data = form.getValues();
        let groupItem = cls.getItemForm().groupItem;
        if (!groupItem && !clear) {
            // if (clear) return;
            groupItem = {
                form: {},
                itemIds: [],
                stepUid: cls.stepUid,
                pricing: {},
                qty: {
                    lh: 0,
                    rh: 0,
                    total: 0,
                },
            };
        }
        if (clear) groupItem = null as any;
        else {
            const _uids = Object.keys(data.selections);
            groupItem.itemIds = groupItem.itemIds.filter(
                (id) => !_uids.includes(id)
            );
            Object.entries(data.selections).map(([uid, data]) => {
                const s = sum([data.qty.lh, data.qty.rh]);
                if (!data.qty.total && s) {
                    data.qty.total = s;
                }
                console.log(data);
                const selected = !data.qty.total == false;
                if (selected && !clear) {
                    //selected
                    groupItem.itemIds.push(uid);
                    groupItem.form[uid] = {
                        addon: "",
                        meta: {
                            description: "",
                            produceable: false,
                            taxxable: false,
                        },
                        ...(groupItem.form[uid] || {}),
                        swing: data.swing,
                        qty: data.qty,
                        selected: true,
                    };
                } else {
                    delete groupItem.form[uid];
                }
            });
            groupItem.qty = {
                lh: 0,
                rh: 0,
                total: 0,
            };
            Object.entries(groupItem.form).map(([k, v]) => {
                groupItem.qty.lh += toNumber(v.qty.lh);
                groupItem.qty.rh += toNumber(v.qty.rh);
                groupItem.qty.total += toNumber(v.qty.total);
            });
        }
        cls.dotUpdateItemForm("groupItem", groupItem);
        console.log(groupItem);
        return groupItem;
    }
    function removeSelection() {
        updateDoorForm(true);
        _modal.close();
    }
    function pickMore() {
        updateDoorForm();
        _modal.close();
    }
    const [openPriceForm, setOpenPriceForm] = useState({});

    function nextStep() {
        updateDoorForm();
        cls.nextStep();
        _modal.close();
    }
    function priceChanged(size, price) {
        form.setValue(
            `selections.${cls.componentUid}-${size}.basePrice`,
            price
        );
        form.setValue(
            `selections.${cls.componentUid}-${size}.salesPrice`,
            price
        );
    }

    return {
        form,
        priceChanged,
        removeSelection,
        // priceModel: memoied.priceModel,
        cls,
        priceModel,
        nextStep,
        pickMore,
        sizeList: sList,
        routeConfig,
        openPriceForm,
        togglePriceForm(uid) {
            setOpenPriceForm((prev) => {
                console.log({ prev });
                const newState = {
                    [uid]: !prev?.[uid],
                };
                Object.entries({ ...prev }).map(([k, v]) => {
                    if (k != uid) newState[k] = false;
                });

                return newState;
            });
        },
    };
}