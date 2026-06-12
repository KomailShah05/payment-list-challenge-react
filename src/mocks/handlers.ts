import { http, HttpResponse } from "msw";
import {
  mockPayments123,
  mockPayments000,
  mockPayments134,
  mockPayments205,
  mockPayments456,
  mockPayments789,
} from "./mockPaymentsData";
import { API_URL } from "../constants";
import { Payment, PaymentSearchResponse } from "../types";

const allPayments: Payment[] = [
  ...mockPayments134,
  ...mockPayments456,
  ...mockPayments789,
  ...mockPayments205,
  ...mockPayments123,
  ...mockPayments000,
];

export const handlers = [
  http.get(`*${API_URL}`, async ({ request }) => {
    const url      = new URL(request.url);
    const search   = url.searchParams.get("search")?.toLowerCase()   ?? "";
    const currency = url.searchParams.get("currency")                 ?? "";
    const page     = parseInt(url.searchParams.get("page")     ?? "1",  10);
    const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10", 10);

    if (search === "pay_404") {
      return HttpResponse.json({ message: "Payment not found" }, { status: 404 });
    }
    if (search === "401") {
      return HttpResponse.json({ message: "Unauthorized access" }, { status: 401 });
    }
    if (search === "pay_500") {
      return HttpResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }

    const filtered = allPayments.filter((pay) => {
      const matchesSearch =
        !search ||
        pay.id.toLowerCase().includes(search) ||
        pay.status?.toLowerCase().includes(search) ||
        pay.currency?.toLowerCase().includes(search) ||
        pay.customerName?.toLowerCase().includes(search);
      const matchesCurrency = !currency || pay.currency === currency;
      return matchesSearch && matchesCurrency;
    });

    if (filtered.length === 0) {
      return HttpResponse.json({ message: "Payment not found" }, { status: 404 });
    }

    const total  = filtered.length;
    const start  = (page - 1) * pageSize;
    const payload: PaymentSearchResponse = {
      payments: filtered.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    };

    return HttpResponse.json(payload);
  }),
];
