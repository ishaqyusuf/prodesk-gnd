import {
  ISalesOrder,
  ISalesOrderForm,
  InventoryComponentCategory,
  WizardKvForm,
} from "@/types/sales";
import BaseModal from "./base-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ISalesWizardForm } from "@/types/post";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useTransition,
} from "react";
import Combobox from "../combo-box";
import { OrderInventory } from "@prisma/client";
import { UseFormReturn, useForm } from "react-hook-form";
import { searchOrderInventoryAction } from "@/app/_actions/inventory";
import { Input } from "../ui/input";
import { convertToNumber, toFixed } from "@/lib/use-number";
import { Label } from "../ui/label";
import { ComponentPriceHistory } from "../sales/component-price-history-pop";
import { ToolTip } from "../tool-tip";
import { Button } from "../ui/button";
import { Eraser } from "lucide-react";
import { SalesFormCtx } from "@/app/_actions/sales-form";
import { ISalesComponentModal } from "@/types/modal";
import Btn from "../btn";
import { deepCopy } from "@/lib/deep-copy";
import { saveSalesComponentAction } from "@/app/_actions/sales-components";
import { composeItemDescription } from "@/lib/sales/sales-invoice-form";
import { closeModal } from "@/lib/modal";
import { store } from "@/store";
import { itemQuoteUpdated } from "@/store/invoice-item-component-slice";

export interface IComponentForm {
  components: WizardKvForm;
}
export default function SalesComponentModal({
  form,
  ctx,
}: {
  ctx: SalesFormCtx;
  form: ISalesOrderForm;
}) {
  const [wizardForm, setWizardForm] = useState<ISalesWizardForm[]>([]);
  const frm = useForm<IComponentForm>({
    defaultValues: {},
  });
  const [isSaving, startTransition] = useTransition();
  const settings = ctx.settings;

  const [wFields, setWFields] = useState<string[]>([]);
  const watchSums = frm.watch(wFields as any);
  const [total, setTotal] = useState<number>();
  useEffect(() => {
    console.log(watchSums, "...");
    let totals = 0;
    watchSums.map((c) => (totals += convertToNumber(c)));
    setTotal(totals?.toFixed(2) as any);
  }, [watchSums]);
  function _init({ item, components, rowIndex }: ISalesComponentModal) {
    setWizardForm([]);
    const wizard = settings.wizard.form;
    const _componentWizard: ISalesWizardForm[] | undefined = [];
    const _wizardForm: WizardKvForm = {};
    setWFields([]);
    const wFields: string[] = [];

    wizard.map((w) => {
      const _wizardComponent = components?.[w.uuid];
      if (w.deleted) {
        if (_wizardComponent?.price > 0 || _wizardComponent?.title) {
          _componentWizard.push({ ...w });
          wFields.push(`components.${w.uuid}.total`);
          _wizardForm[w.uuid] = _wizardComponent;
        }
      } else {
        _componentWizard.push({ ...w });
        wFields.push(`components.${w.uuid}.total`);
        if (_wizardComponent) _wizardForm[w.uuid] = _wizardComponent;
      }
    });
    console.log(">>>>");
    // console.log(wFields);
    setWFields(wFields);
    console.log(_componentWizard);
    setWizardForm(_componentWizard);

    frm.setValue("components", _wizardForm);
    return;
  }
  function save({ rowIndex }: ISalesComponentModal) {
    startTransition(async () => {
      const kvForm = frm.getValues("components");
      const components = deepCopy<WizardKvForm>(kvForm);
      let total = 0;
      Object.entries(kvForm).map(([k, v]) => {
        if (!v) return;
        const { qty, price } = v;
        let _total = (v.total = convertToNumber(qty) * convertToNumber(price));
        // console.log(qty, price, _total);
        // console.log(qty, price, _total);
        components[k] = v;
        total += convertToNumber(_total);
        // console.log(total);
      });
      const response = await saveSalesComponentAction(
        components,
        settings.wizard.form
      );

      let value = "";
      let tCost = 0;
      let qty = form.getValues(`items.${rowIndex}.qty`);
      let description = composeItemDescription({
        wizard: settings.wizard,
        kvForm: kvForm,
      });
      settings.wizard.form.map((f) => {
        const frmVal = kvForm[f.uuid];
        tCost += convertToNumber(frmVal?.total);
      });

      const itemK = `items.${rowIndex}`;
      form.setValue(`items.${rowIndex}.description`, description);
      // console.log(description);
      // console.log(_fields);
      form.setValue(`items.${rowIndex}.meta.components`, components);
      form.setValue(`items.${rowIndex}.meta.isComponent`, true);
      console.log(total);
      form.setValue(`items.${rowIndex}.price`, convertToNumber(total, 0));
      const validQty = (qty || 0) > 0;
      console.log([qty, validQty]);
      if (!validQty) {
        // console.log(form.getValues(`items.${slice.rowIndex}.qty`));
        qty = 1;
        // form.setValue(`items.${slice.rowIndex}.qty`, 1);
      }
      closeModal("salesComponent");
      store.dispatch(
        itemQuoteUpdated({
          rowIndex,
          qty,
          price: tCost,
        })
      );
    });
  }
  return (
    <BaseModal<ISalesComponentModal>
      className="sm:max-w-[600px] lg:max-w-[700px]"
      modalName="salesComponent"
      onOpen={(data) => _init(data)}
      Title={({ data }) => <span>Door Component</span>}
      Content={({ data }) => (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 px-1"></TableHead>
                <TableHead className="px-1">Item</TableHead>
                <TableHead className="w-20 px-1">Cost($)</TableHead>
                <TableHead className="w-16 px-1">QTY</TableHead>
                {/* <TableHead className="w-16 px-1">Total ($)</TableHead> */}
                <TableHead className="w-16 px-1"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wizardForm.map((field, i) => (
                <ComponentRow
                  form={form}
                  frm={frm}
                  field={field}
                  key={field.uuid}
                />
              ))}
            </TableBody>
            <TableFooter className="">
              <TableRow className="hover:bg-inherit">
                <TableCell></TableCell>
                <TableCell></TableCell>
                {/* <TableCell></TableCell> */}
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="whitespace-nowrap text-center">
                  {/* $ {total} */}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </>
      )}
      Footer={({ data }) => (
        <>
          <Btn
            isLoading={isSaving}
            onClick={() => save(data as any)}
            size="sm"
            type="submit"
          >
            Save
          </Btn>
        </>
      )}
    />
  );
}
function ComponentRow({ field, form, frm }: { field; form; frm }) {
  const [watchReady, setWatchReady] = useState(false);
  const watchTotal = frm.watch(`components.${field.uuid}.total`);
  const props = {
    orderForm: form,
    watchReady,
    setWatchReady,
    form: frm,
    field,
  };
  // const watchCost = frm.watch(`components.${field.uuid}.price`);
  // const watchQty = frm.watch(`components.${field.uuid}.qty`);
  // useEffect(() => {
  //   return;
  //   if (!watchReady) return;
  //   if (watchCost > 0 && !watchQty) {
  //     frm.setValue(`components.${field.uuid}.qty`, 1);
  //     return;
  //   }
  //   frm.setValue(
  //     `components.${field.uuid}.total`,
  //     toFixed(convertToNumber(watchCost) * convertToNumber(watchQty))
  //   );
  // }, [watchCost, watchQty, watchReady]);
  return (
    <TableRow className="">
      <TableHead className="">{field.label}</TableHead>
      <TableCell id="Name" className="p-0 px-1">
        <ComponentInput
          {...props}
          keyName={`components.${field.uuid}.title`}
          label={field.category}
        />
      </TableCell>
      {/* <CostQtyCell {...props} /> */}
      <TableCell id="Cost" className="p-0 px-1">
        {field.hasCost && (
          <Input
            type="number"
            // onChange={(e) => {
            //   setWatchReady(true);
            // }}
            className="h-8 w-full p-1 text-right font-medium"
            {...frm.register(`components.${field.uuid}.price`)}
          />
        )}
      </TableCell>
      <TableCell id="Qty" className="p-0 px-1">
        {field.hasQty && (
          <Input
            type="number"
            // onFocus={() => setWatchReady(true)}
            className="h-8 w-full p-1 text-center font-medium"
            {...frm.register(`components.${field.uuid}.qty`)}
          />
        )}
      </TableCell>
      {/* <TableCell id="Total" className="p-0 px-1">
        {watchTotal > 0 && <Label>${watchTotal}</Label>}
      </TableCell> */}
      <TableCell align="right" className="p-0 px-1">
        <div className="space-x-2s flex">
          <ComponentPriceHistory
            rowIndex={field.uuid}
            form={frm}
            field={field}
          />
          <ToolTip info="Clear Component">
            <Button
              onClick={() => {
                // update(i, {
                //   type: fields[i]?.type,
                // } as any);
              }}
              variant="ghost"
              className="flex h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </ToolTip>
        </div>
      </TableCell>
    </TableRow>
  );
}
interface CellProps {
  watchReady: Boolean;
  setWatchReady: Dispatch<SetStateAction<boolean>>;
  field: ISalesWizardForm;
  label?: InventoryComponentCategory;
  keyName?;
  form: UseFormReturn<IComponentForm, any>;
  orderForm: ISalesOrderForm;
}
function ComponentInput({
  form,
  setWatchReady,
  orderForm,
  field,
  label,
  keyName,
}: CellProps) {
  // const [history]
  async function searchFn(q) {
    // 628.45 1071.6
    console.log("SEACHING", field.category);
    const query = {
      category: field.category,
      q,
    };
    const products = await searchOrderInventoryAction(query);

    return {
      items: products,
      // items: products,
    };
  }
  // return <AutoComplete />;
  return (
    <Combobox<OrderInventory>
      allowCreate
      selected={(product) => {
        // console.log(product);
      }}
      labelKey="name"
      valueKey="name"
      align="start"
      searchFn={searchFn}
      // onFocus={() => {
      //   setWatchReady(true);
      // }}
      placeholder="Type Here"
      form={form}
      keyName={keyName}
    ></Combobox>
  );
}
