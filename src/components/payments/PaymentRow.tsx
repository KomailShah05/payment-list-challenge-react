import { memo, useMemo } from "react";
import { Payment } from "../../types";
import { I18N } from "../../constants";
import { formatAmount, formatDate } from "../../utils/format";
import Badge from "../ui/Badge";

interface PaymentRowProps {
  payment: Payment;
  index?: number;
}

const PaymentRow = memo(({ payment, index = 0 }: PaymentRowProps) => {
  const formattedAmount = useMemo(
    () => formatAmount(payment.amount, payment.currency),
    [payment.amount, payment.currency]
  );

  const formattedDate = useMemo(
    () => formatDate(payment.date),
    [payment.date]
  );

  return (
    <tr
      className="border-b border-gray-100 hover:bg-slate-50 transition-colors duration-150 animate-fade-slide-in"
      style={{ animationDelay: `${Math.min(index, 8) * 20}ms` }}
    >
      <td className="px-4 py-3 text-sm font-mono text-gray-900">{payment.id}</td>
      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{formattedDate}</td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900 tabular-nums">{formattedAmount}</td>
      <td className="px-4 py-3 text-sm text-gray-700 max-w-[160px] truncate">
        {payment.customerName ?? I18N.EMPTY_CUSTOMER}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{payment.currency || I18N.EMPTY_CURRENCY}</td>
      <td className="px-4 py-3">
        <Badge status={payment.status} />
      </td>
    </tr>
  );
});

export default PaymentRow;
