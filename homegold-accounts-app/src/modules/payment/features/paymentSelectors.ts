import { Payment } from './paymentTypes.ts';
import { RootState } from "../../../store/store.ts";
import { createSelector } from 'reselect';

export const selectPaymentStatus = (state: RootState) => state.payment.status;
export const selectPaymentError = (state: RootState) => state.payment.error;

export const selectAllPayment = (state: RootState): Payment[] => state.payment.data || [];

export const selectTotalPages = (state: RootState) => state.payment.totalPages;

export const selectAllPayments = (state: RootState): Payment[] =>
  state.payment.data.filter(p => p.system === 1) || [];

export const selectAllPaymentPaginated = (state: RootState): Payment[] =>
  state.payment.dataPaginated || [];

export const selectInPayments = (state: RootState): Payment[] =>
  state.payment.data.filter(
    p => p.paymentType === "payment_in" && p.system === 1
  ) || [];

export const selectAllPayments_Sys2 = (state: RootState): Payment[] =>
  state.payment.data.filter(
    p => p.paymentType === "payment_in" && (p.system === 2 || p.invoice?.isVat === true)
  ) || [];

export const selectAllSalePayments = (state: RootState): Payment[] =>
  state.payment.data.filter(
    p => p.paymentType === "payment_in"
  ) || [];

export const selectSaleCollectionReport = (fromDate?: string, toDate?: string) =>
  createSelector([selectAllPayment], (payments: Payment[]) => {
    const incomingPayments = payments.filter((p) => p.paymentType === "payment_in");

    // --- Default to current month if no date is passed ---
    const now = new Date();
    let from = fromDate
      ? new Date(fromDate)
      : new Date(now.getFullYear(), now.getMonth(), 1); // first day of month
    let to = toDate
      ? new Date(toDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of month

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    // --- Split into previous and current ---
    const previous = incomingPayments.filter((p) => {
      const date = new Date(p?.paymentDate ?? "");
      return !isNaN(date.getTime()) && date < from;
    });

    const current = incomingPayments.filter((p) => {
      const date = new Date(p?.paymentDate ?? "");
      return !isNaN(date.getTime()) && date >= from && date <= to;
    });

    // --- Sort current by ascending date ---
    const sortedCurrent = [...current].sort((a, b) => {
      const da = new Date(a?.paymentDate ?? "").getTime();
      const db = new Date(b?.paymentDate ?? "").getTime();
      return da - db;
    });

    // --- Helper: sum by currency and return array ---
    const sumByCurrency = (list: Payment[]) => {
      const grouped: Record<string, number> = {};

      list.forEach((p) => {
        const currency = p.currency || "N/A";
        const amount = Number(p.amountPaid) || 0;
        grouped[currency] = (grouped[currency] || 0) + amount;
      });

      return Object.entries(grouped).map(([currency, amount]) => ({
        currency,
        amount,
      }));
    };

    // --- Merge two totals ---
    const mergeTotals = (prev: { currency: string; amount: number }[], curr: { currency: string; amount: number }[]) => {
      const grouped: Record<string, number> = {};

      [...prev, ...curr].forEach((entry) => {
        grouped[entry.currency] = (grouped[entry.currency] || 0) + entry.amount;
      });

      return Object.entries(grouped).map(([currency, amount]) => ({
        currency,
        amount,
      }));
    };

    const previousTotal = sumByCurrency(previous);
    const currentTotal = sumByCurrency(current);
    const total = mergeTotals(currentTotal, previousTotal);

    return {
      payments: sortedCurrent,
      previousTotal,
      currentTotal,
      total,
    };
  });

export const selectPurchaseCashPaymentReport = (fromDate?: string, toDate?: string) =>
  createSelector([selectAllPayment], (payments: Payment[]) => {
    const incomingPayments = payments.filter((p) => p.paymentType === "payment_out");

    // --- Default to current month if no date is passed ---
    const now = new Date();
    let from = fromDate
      ? new Date(fromDate)
      : new Date(now.getFullYear(), now.getMonth(), 1); // first day of month
    let to = toDate
      ? new Date(toDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of month

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    // --- Split into previous and current ---
    const previous = incomingPayments.filter((p) => {
      const date = new Date(p?.paymentDate ?? "");
      return !isNaN(date.getTime()) && date < from;
    });

    const current = incomingPayments.filter((p) => {
      const date = new Date(p?.paymentDate ?? "");
      return !isNaN(date.getTime()) && date >= from && date <= to;
    });

    // --- Sort current by ascending date ---
    const sortedCurrent = [...current].sort((a, b) => {
      const da = new Date(a?.paymentDate ?? "").getTime();
      const db = new Date(b?.paymentDate ?? "").getTime();
      return da - db;
    });

    // --- Helper: sum by currency and return array ---
    const sumByCurrency = (list: Payment[]) => {
      const grouped: Record<string, number> = {};

      list.forEach((p) => {
        const currency = p.currency || "N/A";
        const amount = Number(p.amountPaid) || 0;
        grouped[currency] = (grouped[currency] || 0) + amount;
      });

      return Object.entries(grouped).map(([currency, amount]) => ({
        currency,
        amount,
      }));
    };

    // --- Merge two totals ---
    const mergeTotals = (prev: { currency: string; amount: number }[], curr: { currency: string; amount: number }[]) => {
      const grouped: Record<string, number> = {};

      [...prev, ...curr].forEach((entry) => {
        grouped[entry.currency] = (grouped[entry.currency] || 0) + entry.amount;
      });

      return Object.entries(grouped).map(([currency, amount]) => ({
        currency,
        amount,
      }));
    };

    const previousTotal = sumByCurrency(previous);
    const currentTotal = sumByCurrency(current);
    const total = mergeTotals(currentTotal, previousTotal);

    return {
      payments: sortedCurrent,
      previousTotal,
      currentTotal,
      total,
    };
  });





export const selectAllExpense = (state: RootState): Payment[] =>
  state.payment.data.filter(
    p => p.paymentType === "office_expense"
  ) || [];







export const selectPaymentById = (id: number) => (state: RootState) => state.payment.data.find(payment => payment.id === id);

export const selectTotalPaymentByDate = (date: string) => (state: RootState) => {
  const payments = state.payment.data.filter(
    (payment) => payment.paymentDate.split("T")[0] === date
  );

  const paidSum = payments.reduce(
    (acc, p) => acc + Number(p.amountPaid ?? 0),
    0
  );

  return {
    date,
    paidSum,
  };
};




