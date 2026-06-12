import { memo } from "react";
import { Payment } from "../../types";
import { I18N, PAYMENT_TABLE_COLUMNS } from "../../constants";
import PaymentRow from "./PaymentRow";
import SkeletonRow from "../ui/Skeleton";

interface PaymentTableProps {
  payments: Payment[];
  isLoading: boolean;
  pageSize: number;
}

const PaymentTable = memo(({ payments, isLoading, pageSize }: PaymentTableProps) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
    <table
      role="table"
      aria-busy={isLoading}
      aria-label={I18N.PAGE_TITLE}
      className="min-w-full text-left text-sm"
    >
      <caption className="sr-only">{I18N.PAGE_TITLE}</caption>
      <thead className="border-b-2 border-gray-200 bg-gray-50">
        <tr>
          {PAYMENT_TABLE_COLUMNS.map(({ key, label }) => (
            <th
              key={key}
              scope="col"
              role="columnheader"
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700"
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {isLoading
          ? Array.from({ length: pageSize }).map((_, i) => (
              <SkeletonRow key={i} columns={6} />
            ))
          : payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
      </tbody>
    </table>
  </div>
));

export default PaymentTable;
