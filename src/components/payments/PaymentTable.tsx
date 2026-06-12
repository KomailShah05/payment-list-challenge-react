import { memo } from "react";
import { Payment } from "../../types/payment";
import { I18N } from "../../constants/i18n";
import PaymentRow from "./PaymentRow";
import SkeletonRow from "../ui/Skeleton";

const PAGE_SIZE = 5;

const COLUMNS = [
  { key: "id",       label: I18N.TABLE_HEADER_PAYMENT_ID },
  { key: "date",     label: I18N.TABLE_HEADER_DATE },
  { key: "amount",   label: I18N.TABLE_HEADER_AMOUNT },
  { key: "customer", label: I18N.TABLE_HEADER_CUSTOMER },
  { key: "currency", label: I18N.TABLE_HEADER_CURRENCY },
  { key: "status",   label: I18N.TABLE_HEADER_STATUS },
] as const;

interface PaymentTableProps {
  payments: Payment[];
  isLoading: boolean;
}

const PaymentTable = memo(({ payments, isLoading }: PaymentTableProps) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
    <table
      role="table"
      aria-busy={isLoading}
      aria-label={I18N.PAGE_TITLE}
      className="min-w-full text-left text-sm"
    >
      <caption className="sr-only">{I18N.PAGE_TITLE}</caption>
      <thead className="bg-gray-50 border-b-2 border-gray-200">
        <tr>
          {COLUMNS.map(({ key, label }) => (
            <th
              key={key}
              scope="col"
              role="columnheader"
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {isLoading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
