import { Ledger } from './ledgerTypes.ts';
import { RootState } from "../../../store/store.ts";
import { createSelector } from 'reselect';

const compareLedgerAscending = (a: Ledger, b: Ledger) => {
  const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
  if (dateDiff !== 0) return dateDiff;
  return (a.id || 0) - (b.id || 0);
};

const getLedgerPaymentBalanceDelta = (
  ledger: Pick<Ledger, "transactionType" | "debit" | "credit">
) => {
  const transactionType = String(ledger.transactionType || "").toLowerCase();
  const debit = Number(ledger.debit || 0);
  const credit = Number(ledger.credit || 0);

  if (["payment_in", "payment_out", "payable", "receivable"].includes(transactionType)) {
    return debit - credit;
  }

  return credit - debit;
};

const getLedgerRunningBalance = (
  ledger: Pick<Ledger, "transactionType" | "debit" | "credit" | "debitQty" | "creditQty">
) => {
  const debitQty = Number(ledger.debitQty || 0);
  const creditQty = Number(ledger.creditQty || 0);

  return getLedgerPaymentBalanceDelta(ledger) + (creditQty - debitQty);
};

export const selectLedgerStatus = (state: RootState) => state.ledger.status;
export const selectLedgerError = (state: RootState) => state.ledger.error;
export const selectAllLedger = (state: RootState): Ledger[] => state.ledger.data || [];

export const selectLedgers = (
  businessId: number = 0,
  partyId: number = 0,
  categoryId: number = 0
) => {
  return createSelector([selectAllLedger], (ledgers) => {
    let filteredLedgers = ledgers.filter((l) => {
      if (businessId > 0 && l.businessId !== businessId) return false;
      if (partyId > 0 && l.partyId !== partyId) return false;
      if (categoryId > 0 && l.categoryId !== categoryId) return false;
      return true;
    });

    // Step 2: Sort by date (optional but important for running balance)
    filteredLedgers = filteredLedgers.sort(compareLedgerAscending);

    return filteredLedgers;
  });
};


export const selectAccountLedgers = (
  businessId: number = 0,
  partyId: number = 0,
  categoryId: number = 0,
  bankId: number = 0
) => {
  return createSelector([selectAllLedger], (ledgers) => {
    // Step 1: Filter ledgers
    const filteredLedgers = ledgers
      .filter((l) => {
        const type = l.transactionType?.toLowerCase() ?? "";

        // Exclude purchase and sale transactions
        if (type === "purchase" || type === "sale") return false;

        // Apply filters only if values are provided
        if (businessId > 0 && l.businessId !== businessId) return false;
        if (partyId > 0 && l.partyId !== partyId) return false;
        if (categoryId > 0 && l.categoryId !== categoryId) return false;
        if (bankId > 0 && l.bankId !== bankId) return false;

        return true;
      })

    // Step 2: Compute running balance
    const sortedLedgers = [...filteredLedgers].sort(compareLedgerAscending);

    const withBalance = sortedLedgers.map((l) => {
      return {
        ...l,
        runningBalance: getLedgerRunningBalance(l),
      };
    });

    return withBalance;
  });
};





const SALE_TYPES = [
  "sale", "wholesale_sale", "fix_sale", "unfix_sale", "stock_out", "payment_in", 
  "capital_in", "capital_out", "advance_received", "advance_payment_deduct", "advance_payment", 
  "advance_received_deduct", "discount_sale"
];
const PURCHASE_TYPES = [
  "purchase", "clearance_bill", "wholesale_purchase", "fix_purchase", "unfix_purchase", "stock_in", "payment_out", 
  "capital_in", "capital_out", "advance_received", "advance_payment_deduct", "advance_payment", 
  "advance_received_deduct", "discount_purchase"
];
const All_TYPES = [
  "purchase", "clearance_bill", "wholesale_purchase", "fix_purchase", "unfix_purchase", "stock_in", "payment_out", 
  "sale", "wholesale_sale", "fix_sale", "unfix_sale", "stock_out", "payment_in", "capital_in", "capital_out", 
  "stock_transfer", "stock_transfer_return",
  "advance_received", "advance_payment_deduct", "advance_payment", "advance_received_deduct", "discount_sale", 
  "discount_purchase", "premium_received", "premium_paid", "deposit", "withdraw", "payable", "receivable", "bill_out"
];

export const selectLedgerByPartyType = (
  businessId: number = 0,
  ledgerType?: string,
  partyId?: number
) =>
  createSelector([selectAllLedger], (ledgers) => {
    // Choose allowed transaction types
    const typeList = ledgerType === "sale" ? SALE_TYPES : ledgerType === "purchase" ? PURCHASE_TYPES : All_TYPES;

    const typeListNormalized = typeList.map((t) => t.toLowerCase());

    // Step 1: Apply filters
    let filteredLedgers = ledgers.filter((ledger) => {
      const txType = ledger.transactionType?.toLowerCase() ?? "";

      // Must match allowed type list
      if (!typeListNormalized.includes(txType)) return false;

      // Filter by business
      if (businessId > 0 && ledger.businessId !== businessId) return false;

      // Filter by party if provided
      if (partyId && Number(partyId) > 0 && ledger.partyId !== partyId)
        return false;

      return true;
    });

    // Step 2: Sort by date (optional but important for running balance)
    filteredLedgers = filteredLedgers.sort(compareLedgerAscending);

    // Step 3: Calculate cumulative running balance
    const withBalance = filteredLedgers.map((l) => {
      return {
        ...l,
        runningBalance: getLedgerRunningBalance(l),
      };
    });

    return withBalance;
  });

