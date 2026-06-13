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
    const sortBy   = url.searchParams.get("sortBy")  ?? "date";
    const sortDir  = url.searchParams.get("sortDir") ?? "desc";

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

    const dir = sortDir === "asc" ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "amount":      return (a.amount - b.amount) * dir;
        case "id":          return a.id.localeCompare(b.id) * dir;
        case "customerName": return (a.customerName ?? "").localeCompare(b.customerName ?? "") * dir;
        case "currency":    return a.currency.localeCompare(b.currency) * dir;
        case "status":      return a.status.localeCompare(b.status) * dir;
        default:            return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
      }
    });

    const total  = sorted.length;
    const start  = (page - 1) * pageSize;
    const payload: PaymentSearchResponse = {
      payments: sorted.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    };

    return HttpResponse.json(payload);
  }),
];
