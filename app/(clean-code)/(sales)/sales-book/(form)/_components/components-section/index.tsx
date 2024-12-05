import { Label } from "@/components/ui/label";
import {
    useFormDataStore,
    ZusComponent,
} from "../../_common/_stores/form-data-store";
import {
    zhLoadStepComponents,
    zusDeleteComponents,
    zusFilterStepComponents,
} from "../../_utils/helpers/zus/zus-step-helper";
import { useEffectAfterMount } from "@/hooks/use-effect-after-mount";
import { Menu } from "@/components/(clean-code)/menu";
import { Icons } from "@/components/_v1/icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
    CheckCircle,
    ExternalLink,
    Filter,
    Info,
    Variable,
} from "lucide-react";
import { DeleteRowAction } from "@/components/_v1/data-table/data-table-row-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { zhEditPricing } from "../../_utils/helpers/zus/zus-component-helper";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ComponentImg } from "../component-img";
import {
    ComponentHelperClass,
    StepHelperClass,
} from "../../_utils/helpers/zus/zus-helper-class";
import { openEditComponentPrice } from "../modals/component-price-modal";
import { Badge } from "@/components/ui/badge";
import DoorSizeModal from "../modals/door-size-modal";
import { _modal } from "@/components/common/modal/provider";
import { openDoorPriceModal } from "../modals/door-price-modal";
import { openComponentVariantModal } from "../modals/component-visibility-modal";
import { useStepContext } from "./ctx";

interface Props {
    stepUid;
}

function Component({ stepUid }: Props) {
    const ctx = useStepContext(stepUid);
    // const { items, containerRef, cls, props } = ctx;
    return <></>;
}

export const ComponentsSection = memo(
    Component,
    (p, n) => p.stepUid != n.stepUid
);
