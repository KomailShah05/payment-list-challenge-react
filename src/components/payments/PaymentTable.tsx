import { memo } from "react";
import { Payment, SortDirection, SortField } from "../../types";
import { I18N, PAYMENT_TABLE_COLUMNS, SORTABLE_COLUMNS } from "../../constants";
import PaymentRow from "./PaymentRow";
import SkeletonRow from "../ui/Skeleton";
import SortIcon from "../ui/SortIcon";

interface PaymentTableProps {
  payments: Payment[];
  isLoading: boolean;
  isFetching: boolean;
  pageSize: number;
  sortBy: SortField;
  sortDir: SortDirection;
  hasCurrencyFilter: boolean;
  onSort: (field: SortField) => void;
}

const PaymentTable = memo(
  ({
    payments,
    isLoading,
    isFetching,
    pageSize,
    sortBy,
    sortDir,
    hasCurrencyFilter,
    onSort,
  }: PaymentTableProps) => (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table
        data-testid="payments-table"
        role="table"
        aria-busy={isLoading || isFetching}
        aria-label={I18N.PAGE_TITLE}
        className="min-w-full text-left text-sm"
      >
        <caption className="sr-only">{I18N.PAGE_TITLE}</caption>
        <thead className="border-b-2 border-gray-200 bg-gray-50">
          <tr>
            {PAYMENT_TABLE_COLUMNS.map(({ key, label }) => {
              // Amount sorting only makes sense within a single currency
              const sortField = key === "amount" && !hasCurrencyFilter
                ? undefined
                : SORTABLE_COLUMNS[key];
              const isActive = sortField === sortBy;
              return (
                <th
                  key={key}
                  scope="col"
                  role="columnheader"
                  aria-sort={
                    sortField
                      ? isActive
                        ? sortDir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                      : undefined
                  }
                  onClick={sortField ? () => onSort(sortField) : undefined}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 ${
                    sortField
                      ? "cursor-pointer select-none hover:bg-gray-100 active:bg-gray-200"
                      : ""
                  }`}
                >
                  {label}
                  {sortField && <SortIcon active={isActive} dir={sortDir} />}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody
          className={`divide-y divide-gray-100 bg-white transition-opacity duration-300 ${
            isFetching && !isLoading ? "opacity-50" : "opacity-100"
          }`}
        >
          {isLoading ? (
            Array.from({ length: pageSize }).map((_, i) => (
              <SkeletonRow key={i} columns={6} />
            ))
          ) : payments.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-sm font-medium text-gray-700"
                role="status"
                aria-live="polite"
              >
                {I18N.NO_PAYMENTS_FOUND}
              </td>
            </tr>
          ) : (
            payments.map((payment, i) => (
              <PaymentRow key={payment.id} payment={payment} index={i} />
            ))
          )}
        </tbody>
      </table>
    </div>
  ),
);

export default PaymentTable;
