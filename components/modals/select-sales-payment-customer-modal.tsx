"use client";

import React, { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal, openModal } from "@/lib/modal";

import { getSalesPaymentCustomers } from "@/app/_actions/sales-payment/get-sales-payment-customer";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import {
  PrimaryCellContent,
  SecondaryCellContent,
} from "../columns/base-columns";
import Money from "../money";
import { sum } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { ICustomer } from "@/types/customers";

export default function SelectSalesPaymentCustomerModal() {
  const [salesPaymentCustomers, setSalesPaymentCustomers] = useState<
    ICustomer[]
  >([]);

  return (
    <BaseModal
      className="sm:max-w-[550px]"
      onOpen={async (data) => {
        setSalesPaymentCustomers((await getSalesPaymentCustomers()) as any);
      }}
      onClose={() => {}}
      modalName="salesPaymentCustomer"
      Title={({ data }) => <div>Select Customer</div>}
      Content={({ data }) => (
        <div>
          <ScrollArea className="h-[250px] max-h-[350px] pr-4">
            <Table>
              <TableBody>
                {salesPaymentCustomers?.map((customer) => (
                  <TableRow
                    onClick={() => {
                      console.log(customer);
                      openModal("salesPayment", customer);
                    }}
                    className="cursor-pointer"
                    key={customer.id}
                  >
                    <TableCell className="p-1">
                      <div className="flex justify-between items-center">
                        <div className="">
                          <PrimaryCellContent>
                            {customer.businessName || customer.name}
                          </PrimaryCellContent>
                          <SecondaryCellContent>
                            {customer.phoneNo}
                          </SecondaryCellContent>
                        </div>
                        <SecondaryCellContent>
                          <Money
                            value={sum(customer.salesOrders, "amountDue")}
                          />
                        </SecondaryCellContent>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}
    />
  );
}
