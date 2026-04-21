import { useMemo, useState, useEffect, Fragment } from "react";

import {
  PaginationControl,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableFooter,
  TableRow,
} from "../../../components/ui/table/index.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import DatePicker from "../../../components/form/date-picker.tsx";
import Select from "react-select";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { fetchAll } from "../features/ledgerThunks.ts";
import { selectUser } from "../../auth/features/authSelectors.ts";
import { selectLedgerByPartyType, selectLedgerStatus } from "../features/ledgerSelectors.ts";
import { selectAllCategory } from "../../category/features/categorySelectors.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { selectParties, selectPartyById } from "../../party/features/partySelectors.ts";
import { fetchParty } from "../../party/features/partyThunks.ts";
import { useParams } from "react-router";
import { selectStyles } from "../../types.ts";
// import { useNavigate } from "react-router-dom";


export default function LedgerList() {
  const { ledgerType, partyId } = useParams();
  
  // const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectUser);
  const categories = useSelector(selectAllCategory);
  const hasStockCategory = categories.some((c) => ["currency", "gold"].includes(c.name.toLowerCase()));
  const normalizedLedgerType = String(ledgerType ?? "").toLowerCase();
  const isAllLedger = normalizedLedgerType === "all";
  const isPurchaseLedger = normalizedLedgerType === "purchase";
  const isSaleLedger = normalizedLedgerType === "sale";

  const partyID = Number(partyId) ?? 0;
  const businessID = Number(authUser?.business?.id) ?? 0;

  const [selectedPartyId, setSelectedPartyId] = useState(partyID > 0 ? partyID : 0);
  const [selectedTransactionType, setSelectedTransactionType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterPickerKey, setFilterPickerKey] = useState(0);

  const routedParty = useSelector(selectPartyById(partyID));
  const selectedParty = useSelector(selectPartyById(selectedPartyId));
  const parties = useSelector(selectParties(businessID, "all"));
  const status = useSelector(selectLedgerStatus);
  const ledgers = useSelector(selectLedgerByPartyType(businessID, String(ledgerType), 0));
  

  useEffect(() => {
    dispatch(fetchAll());
    dispatch(fetchAllCategory());
    dispatch(fetchParty({ type: "all" }));
  }, [dispatch]);

  useEffect(() => {
    setSelectedPartyId(partyID > 0 ? partyID : 0);
  }, [partyID]);

  const transactionTypeOptions = useMemo(() => {
    const uniqueTypes = Array.from(
      new Set(
        ledgers
          .map((ledger) => ledger.transactionType)
          .filter((type): type is string => Boolean(type))
      )
    ).sort((a, b) => a.localeCompare(b));

    return uniqueTypes.map((type) => ({
      value: type,
      label: type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }));
  }, [ledgers]);

  // Apply ledger filters
  const filteredLedgers = useMemo(() => {
    return ledgers.filter((ledger) => {
      if (selectedPartyId > 0 && Number(ledger.partyId) !== selectedPartyId) {
        return false;
      }

      if (selectedTransactionType && ledger.transactionType !== selectedTransactionType) {
        return false;
      }

      const ledgerDate = new Date(ledger.date);
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (ledgerDate < from) return false;
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (ledgerDate > to) return false;
      }

      return true;
    });
  }, [ledgers, selectedPartyId, selectedTransactionType, fromDate, toDate]);

  const getPaymentBalanceKey = (ledger: {
    currency?: string | null;
    invoice?: { currency?: string | null } | null;
  }) => ledger.currency || ledger.invoice?.currency || "UNKNOWN";

  const getStockBalanceKey = (ledger: {
    stockCurrency?: string | null;
    stock?: { unit?: string | null } | null;
  }) => {
    const itemName = ledger.stockCurrency || "UNKNOWN";
    const normalizedUnit = String(ledger.stock?.unit || "").trim().toLowerCase();
    const isGoldGramLabel = itemName.toLowerCase().includes("gold") && ["gram", "gm", "g"].includes(normalizedUnit);
    const unitLabel = ledger.stock?.unit && !isGoldGramLabel ? ` (${ledger.stock.unit})` : "";
    return `${itemName}${unitLabel}`;
  };

  const getItemOrCurrencyLabel = (ledger: {
    debit?: number | null;
    credit?: number | null;
    debitQty?: number | null;
    creditQty?: number | null;
    currency?: string | null;
    stockCurrency?: string | null;
    invoice?: { currency?: string | null } | null;
    stock?: { unit?: string | null } | null;
  }) => {
    const hasStockEntry = (Number(ledger.debitQty) || 0) !== 0 || (Number(ledger.creditQty) || 0) !== 0;
    const hasPaymentEntry = (Number(ledger.debit) || 0) !== 0 || (Number(ledger.credit) || 0) !== 0;

    if (hasStockEntry) {
      return getStockBalanceKey(ledger);
    }

    if (hasPaymentEntry) {
      return getPaymentBalanceKey(ledger);
    }

    return ledger.currency || ledger.stockCurrency || "UNKNOWN";
  };

  const formatBalanceValue = (value: number | null | undefined) =>
    value === null || value === undefined ? "-" : Number(value).toFixed(2);

  type GroupedBalanceEntry = {
    label: string;
    amount: number;
  };

  const buildGroupedBalances = (balances: Record<string, number>): GroupedBalanceEntry[] =>
    Object.entries(balances)
      .map(([label, amount]) => ({
        label,
        amount: Number(amount) || 0,
      }))
      .filter(({ amount }) => Math.abs(amount) >= 0.01)
      .sort((a, b) => a.label.localeCompare(b.label));


  // Compute cumulative balance for all ledgers
  const ledgersWithBalance = useMemo(() => {
    const paymentBalancesByCurrency: Record<string, number> = {};
    const stockBalancesByItem: Record<string, number> = {};
    let cumulative = 0;

    return filteredLedgers.map((ledger) => {
      const debit = Number(ledger.debit) || 0;
      const credit = Number(ledger.credit) || 0;
      const debitQty = Number(ledger.debitQty) || 0;
      const creditQty = Number(ledger.creditQty) || 0;
      const hasPaymentEntry = debit !== 0 || credit !== 0;
      const hasStockEntry = debitQty !== 0 || creditQty !== 0;

      let cumulativePaymentBalance: number | null = null;
      let cumulativeStockBalance: number | null = null;

      if (hasPaymentEntry) {
        const paymentKey = getPaymentBalanceKey(ledger);
        paymentBalancesByCurrency[paymentKey] = (paymentBalancesByCurrency[paymentKey] || 0) + (credit - debit);
        cumulativePaymentBalance = paymentBalancesByCurrency[paymentKey];
      }

      if (hasStockEntry) {
        const stockKey = getStockBalanceKey(ledger);
        stockBalancesByItem[stockKey] = (stockBalancesByItem[stockKey] || 0) + (creditQty - debitQty);
        cumulativeStockBalance = stockBalancesByItem[stockKey];
      }

      cumulative += Number(ledger.runningBalance ?? 0);

      const cumulativePaymentBalances = buildGroupedBalances(paymentBalancesByCurrency);
      const cumulativeStockBalances = buildGroupedBalances(stockBalancesByItem);

      return {
        ...ledger,
        cumulativePaymentBalance,
        cumulativeStockBalance,
        cumulativePaymentBalances,
        cumulativeStockBalances,
        cumulativeBalance: cumulative,
      };
    });
  }, [filteredLedgers]);

  // Pagination
  const totalPages = Math.ceil(ledgersWithBalance.length / itemsPerPage) || 1;
  const paginatedLedgers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return ledgersWithBalance.slice(start, start + itemsPerPage);
  }, [ledgersWithBalance, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(totalPages);
  }, [selectedPartyId, selectedTransactionType, fromDate, toDate, totalPages]);

  type CurrencyTotals = {
    purchaseDebit: number;
    purchaseCredit: number;
    purchaseStockDebit: number;
    purchaseStockCredit: number;
    saleDebit: number;
    saleCredit: number;
    saleStockDebit: number;
    saleStockCredit: number;
    advanceDebit: number;
    advanceCredit: number;
    purchaseBalance: number;
    saleBalance: number;
    advanceBalance: number;
    purchaseStockBalance: number;
    saleStockBalance: number;
    closeBalance: number;
    purchageMargin: number;
    saleMargin: number;
  };

  type AllLedgerAmountTotals = {
    debit: number;
    credit: number;
    balance: number;
  };

  const ledgerTotalsByCurrency = useMemo(() => {
    return ledgersWithBalance.reduce<Record<string, CurrencyTotals>>((totals, ledger) => {
      const currency = ledger.currency || ledger.invoice?.currency || 'UNKNOWN';
      const debit = Number(ledger.debit) || 0;
      const credit = Number(ledger.credit) || 0;
      const debitQty = Number(ledger.debitQty) || 0;
      const creditQty = Number(ledger.creditQty) || 0;

      if (!totals[currency]) {
        totals[currency] = {
          purchaseDebit: 0,
          purchaseCredit: 0,
          purchaseStockDebit: 0,
          purchaseStockCredit: 0,
          saleDebit: 0,
          saleCredit: 0,
          saleStockDebit: 0,
          saleStockCredit: 0,
          purchaseBalance: 0,
          saleBalance: 0,
          advanceDebit: 0,
          advanceCredit: 0,
          purchaseStockBalance: 0,
          saleStockBalance: 0,
          advanceBalance: 0,
          closeBalance: 0,
          purchageMargin: 0,
          saleMargin: 0,
        };
      }

      const current = totals[currency];

      if (
        ["purchase", "fix_purchase", "unfix_purchase", "wholesale_purchase","clearance_bill", "payment_out", "stock_in", "discount_purchase"].includes(ledger.transactionType)
      ) {
        current.purchaseDebit += debit;
        current.purchaseCredit += credit;
        current.purchaseStockDebit += debitQty;
        current.purchaseStockCredit += creditQty;
      }

      if (
        ["sale", "fix_sale", "unfix_sale", "wholesale_sale","payment_in", "stock_out", "discount_sale"].includes(ledger.transactionType)
      ) {
        current.saleDebit += debit;
        current.saleCredit += credit;
        current.saleStockDebit += debitQty;
        current.saleStockCredit += creditQty;
      }

      if (
        ["capital_in","advance_received", "advance_payment_deduct", "premium_received", "deposit"].includes(ledger.transactionType)
      ) {
        current.advanceCredit += credit;
      }

      if (
        ["capital_out", "advance_payment", "advance_received_deduct", "premium_paid", "withdraw"].includes(ledger.transactionType)
      ) {
        current.advanceDebit += debit;
      }

      current.purchaseBalance = current.purchaseCredit - current.purchaseDebit;
      current.purchaseStockBalance = current.purchaseStockCredit - current.purchaseStockDebit;
      current.saleBalance = current.saleCredit - current.saleDebit;
      current.saleStockBalance = current.saleStockCredit - current.saleStockDebit;
      current.advanceBalance = current.advanceCredit - current.advanceDebit;
      current.closeBalance = current.purchaseBalance + current.saleBalance;

      return totals;
    }, {});
  }, [ledgersWithBalance]);

  const allLedgerPaymentSummary = useMemo(() => {
    if (!isAllLedger) return [] as Array<[string, AllLedgerAmountTotals]>;

    const totals = ledgersWithBalance.reduce<Record<string, AllLedgerAmountTotals>>((acc, ledger) => {
      const currency = getPaymentBalanceKey(ledger);
      const debit = Number(ledger.debit) || 0;
      const credit = Number(ledger.credit) || 0;

      if (debit === 0 && credit === 0) return acc;

      if (!acc[currency]) {
        acc[currency] = { debit: 0, credit: 0, balance: 0 };
      }

      acc[currency].debit += debit;
      acc[currency].credit += credit;
      acc[currency].balance = acc[currency].credit - acc[currency].debit;

      return acc;
    }, {});

    return Object.entries(totals).sort(([currencyA], [currencyB]) => currencyA.localeCompare(currencyB));
  }, [isAllLedger, ledgersWithBalance]);

  const allLedgerStockSummary = useMemo(() => {
    if (!isAllLedger) return [] as Array<[string, AllLedgerAmountTotals]>;

    const totals = ledgersWithBalance.reduce<Record<string, AllLedgerAmountTotals>>((acc, ledger) => {
      const itemLabel = getStockBalanceKey(ledger);
      const debit = Number(ledger.debitQty) || 0;
      const credit = Number(ledger.creditQty) || 0;

      if (debit === 0 && credit === 0) return acc;

      if (!acc[itemLabel]) {
        acc[itemLabel] = { debit: 0, credit: 0, balance: 0 };
      }

      acc[itemLabel].debit += debit;
      acc[itemLabel].credit += credit;
      acc[itemLabel].balance = acc[itemLabel].credit - acc[itemLabel].debit;

      return acc;
    }, {});

    return Object.entries(totals).sort(([itemA], [itemB]) => itemA.localeCompare(itemB));
  }, [isAllLedger, ledgersWithBalance]);

  const ledgerTableColumnCount = isAllLedger
    ? 13
    : 7 +
      (isPurchaseLedger ? 2 : 0) +
      (isPurchaseLedger && hasStockCategory ? 2 : 0) +
      (isSaleLedger ? 2 : 0) +
      (isSaleLedger && hasStockCategory ? 2 : 0) +
      (hasStockCategory ? 2 : 0) +
      1;

  const renderAmountGroupHeaders = () => {
    if (isAllLedger) {
      return (
        <>
          <TableCell colSpan={2} className="border border-gray-500 text-center px-2 py-2 font-semibold">
            Payment
          </TableCell>
          <TableCell colSpan={2} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">
            Stock
          </TableCell>
          <TableCell colSpan={2} className="border border-gray-500 text-center px-2 py-2 font-semibold">
            Balance
          </TableCell>
        </>
      );
    }

    return (
      <>
        {isPurchaseLedger && (
          <>
            <TableCell colSpan={2} className="border border-gray-500 text-center px-2 py-2 font-semibold">Purchase</TableCell>
            {hasStockCategory && (
              <TableCell colSpan={2} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Purchase Stock Money</TableCell>
            )}
          </>
        )}

        {isSaleLedger && (
          <>
            <TableCell colSpan={2} className="border border-gray-500 text-center px-2 py-2 font-semibold">Sale</TableCell>
            {hasStockCategory && (
              <TableCell colSpan={2} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Sale Stock Money</TableCell>
            )}
          </>
        )}

        {hasStockCategory && (
          <TableCell colSpan={2} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Advance</TableCell>
        )}
      </>
    );
  };

  const renderBalanceGroupHeader = () => {
    if (isAllLedger) {
      return null;
    }

    return <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">{""}</TableCell>;
  };

  const renderBalanceColumnHeader = () => {
    if (isAllLedger) {
      return null;
    }

    return <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Balance</TableCell>;
  };

  const renderAmountColumnHeaders = () => {
    if (isAllLedger) {
      return (
        <>
          <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">Payment Debit</TableCell>
          <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">Payment Credit</TableCell>
          <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Stock Debit</TableCell>
          <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Stock Credit</TableCell>
          <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">Payment Balance</TableCell>
          <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">Stock Balance</TableCell>
        </>
      );
    }

    return (
      <>
        {isPurchaseLedger && (
          <>
            <TableCell colSpan={1} className="border border-gray-500 text-center px-2 py-2 font-semibold">Debit</TableCell>
            <TableCell colSpan={1} className="border border-gray-500 text-center px-2 py-2 font-semibold">Credit</TableCell>
            {hasStockCategory && (
              <>
                <TableCell colSpan={1} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Debit</TableCell>
                <TableCell colSpan={1} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Credit</TableCell>
              </>
            )}
          </>
        )}

        {isSaleLedger && (
          <>
            <TableCell colSpan={1} className="border border-gray-500 text-center px-2 py-2 font-semibold">Debit</TableCell>
            <TableCell colSpan={1} className="border border-gray-500 text-center px-2 py-2 font-semibold">Credit</TableCell>

            {hasStockCategory && (
              <>
                <TableCell colSpan={1} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Debit</TableCell>
                <TableCell colSpan={1} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Credit</TableCell>
              </>
            )}
          </>
        )}

        {hasStockCategory && (
          <>
            <TableCell colSpan={1} className="border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold">Debit</TableCell>
            <TableCell colSpan={1} className="border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold">Credit</TableCell>
          </>
        )}
      </>
    );
  };

  const renderBalanceCells = (ledger: any) => {
    if (isAllLedger) {
      const paymentBalances: GroupedBalanceEntry[] = Array.isArray(ledger.cumulativePaymentBalances)
        ? ledger.cumulativePaymentBalances
        : [];
      const stockBalances: GroupedBalanceEntry[] = Array.isArray(ledger.cumulativeStockBalances)
        ? ledger.cumulativeStockBalances
        : [];

      const renderGroupedBalanceLines = (entries: GroupedBalanceEntry[]) => {
        if (entries.length === 0) {
          return "-";
        }

        return (
          <div className="space-y-1 text-xs leading-4">
            {entries.map((entry) => (
              <div
                key={entry.label}
                className={entry.amount < 0 ? "text-red-500" : entry.amount > 0 ? "text-green-700" : ""}
              >
                {`${entry.label} : ${formatBalanceValue(entry.amount)}`}
              </div>
            ))}
          </div>
        );
      };

      return (
        <>
          <TableCell className="border border-gray-300 text-center px-2 py-2">
            {renderGroupedBalanceLines(paymentBalances)}
          </TableCell>
          <TableCell className="border border-gray-300 text-center px-2 py-2">
            {renderGroupedBalanceLines(stockBalances)}
          </TableCell>
        </>
      );
    }

    return (
      <TableCell className="border border-gray-300 text-center px-2 py-2">
        {Number(ledger.cumulativeBalance || 0).toFixed(2)}
      </TableCell>
    );
  };

  const renderAmountCells = (ledger: any) => {
    if (isAllLedger) {
      return (
        <>
          <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
            {ledger.debit > 0 ? ledger.debit : "-"}
          </TableCell>
          <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
            {ledger.credit > 0 ? ledger.credit : "-"}
          </TableCell>
          <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
            {ledger.debitQty > 0 ? ledger.debitQty : "-"}
          </TableCell>
          <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
            {ledger.creditQty > 0 ? ledger.creditQty : "-"}
          </TableCell>
        </>
      );
    }

    return (
      <>
        {isPurchaseLedger && (
          <>
            <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
              {
                ledger.transactionType === "purchase" ||
                ledger.transactionType === "clearance_bill" ||
                ledger.transactionType === "wholesale_purchase" ||
                ledger.transactionType === "fix_purchase" ||
                ledger.transactionType === "unfix_purchase" ||
                ledger.transactionType === "payment_out" ||
                ledger.transactionType === "discount_purchase"
                  ? ledger.debit > 0 ? ledger.debit : "-"
                  : "-"
              }
            </TableCell>
            <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
              {
                ledger.transactionType === "purchase" ||
                ledger.transactionType === "clearance_bill" ||
                ledger.transactionType === "wholesale_purchase" ||
                ledger.transactionType === "fix_purchase" ||
                ledger.transactionType === "unfix_purchase" ||
                ledger.transactionType === "discount_purchase"
                  ? ledger.credit > 0 ? ledger.credit : "-"
                  : "-"
              }
            </TableCell>

            {hasStockCategory && (
              <>
                <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                  {
                    ledger.transactionType === "purchase" ||
                    ledger.transactionType === "clearance_bill" ||
                    ledger.transactionType === "wholesale_purchase" ||
                    ledger.transactionType === "fix_purchase" ||
                    ledger.transactionType === "unfix_purchase" ||
                    ledger.transactionType === "stock_in"
                      ? ledger.debitQty > 0 ? ledger.debitQty : "-"
                      : "-"
                  }
                </TableCell>
                <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                  {
                    ledger.transactionType === "purchase" ||
                    ledger.transactionType === "clearance_bill" ||
                    ledger.transactionType === "wholesale_purchase" ||
                    ledger.transactionType === "fix_purchase" ||
                    ledger.transactionType === "unfix_purchase" ||
                    ledger.transactionType === "stock_in"
                      ? ledger.creditQty > 0 ? ledger.creditQty : "-"
                      : "-"
                  }
                </TableCell>
              </>
            )}
          </>
        )}

        {isSaleLedger && (
          <>
            <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
              {
                ledger.transactionType === "sale" ||
                ledger.transactionType === "wholesale_sale" ||
                ledger.transactionType === "fix_sale" ||
                ledger.transactionType === "unfix_sale" ||
                ledger.transactionType === "discount_sale"
                  ? ledger.debit > 0 ? ledger.debit : "-"
                  : "-"
              }
            </TableCell>
            <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
              {
                ledger.transactionType === "sale" ||
                ledger.transactionType === "wholesale_sale" ||
                ledger.transactionType === "fix_sale" ||
                ledger.transactionType === "unfix_sale" ||
                ledger.transactionType === "payment_in" ||
                ledger.transactionType === "discount_sale"
                  ? ledger.credit > 0 ? ledger.credit : "-"
                  : "-"
              }
            </TableCell>

            {hasStockCategory && (
              <>
                <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                  {
                    ledger.transactionType === "sale" ||
                    ledger.transactionType === "wholesale_sale" ||
                    ledger.transactionType === "fix_sale" ||
                    ledger.transactionType === "unfix_sale" ||
                    ledger.transactionType === "stock_out"
                      ? ledger.debitQty > 0 ? ledger.debitQty : "-"
                      : "-"
                  }
                </TableCell>
                <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                  {
                    ledger.transactionType === "sale" ||
                    ledger.transactionType === "wholesale_sale" ||
                    ledger.transactionType === "fix_sale" ||
                    ledger.transactionType === "unfix_sale" ||
                    ledger.transactionType === "stock_out"
                      ? ledger.creditQty > 0 ? ledger.creditQty : "-"
                      : "-"
                  }
                </TableCell>
              </>
            )}
          </>
        )}

        {hasStockCategory && (
          <>
            <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
              {
                ledger.transactionType === "capital_out" ||
                ledger.transactionType === "advance_payment" ||
                ledger.transactionType === "advance_received_deduct" ||
                ledger.transactionType === "withdraw" ||
                ledger.transactionType === "premium_paid"
                  ? ledger.debit > 0 ? ledger.debit : "-"
                  : "-"
              }
            </TableCell>
            <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
              {
                ledger.transactionType === "capital_in" ||
                ledger.transactionType === "advance_received" ||
                ledger.transactionType === "advance_payment_deduct" ||
                ledger.transactionType === "deposit" ||
                ledger.transactionType === "premium_received"
                  ? ledger.credit > 0 ? ledger.credit : "-"
                  : "-"
              }
            </TableCell>
          </>
        )}
      </>
    );
  };

  const renderLedgerFooter = () => {
    if (isAllLedger) {
      if (allLedgerPaymentSummary.length === 0 && allLedgerStockSummary.length === 0) {
        return null;
      }

      return (
        <TableFooter className="border-separate border-spacing-y-2 text-black text-sm dark:bg-gray-800 mt-4">
          {allLedgerPaymentSummary.length > 0 && (
            <>
              <TableRow>
                <TableCell colSpan={ledgerTableColumnCount} className="text-center px-2 py-2 font-semibold">
                  Payment Summary
                </TableCell>
              </TableRow>

              {allLedgerPaymentSummary.map(([currency, totals]) => (
                <TableRow key={`payment-summary-${currency}`}>
                  <TableCell colSpan={5} className="text-center px-2 py-2">{""}</TableCell>
                  <TableCell className="border border-gray-500 text-center px-2 py-2">{currency}</TableCell>
                  <TableCell className="border border-gray-500 text-center px-2 py-2">Total</TableCell>
                  <TableCell className="border border-gray-500 bg-gray-200 text-center px-2 py-2">{totals.debit.toFixed(2)}</TableCell>
                  <TableCell className="border border-gray-500 bg-gray-200 text-center px-2 py-2">{totals.credit.toFixed(2)}</TableCell>
                  <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2">-</TableCell>
                  <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2">-</TableCell>
                  <TableCell className={`border border-gray-500 text-center px-2 py-2 font-semibold ${totals.balance < 0 ? "text-red-600" : totals.balance > 0 ? "text-green-700" : ""}`}>
                    {totals.balance.toFixed(2)}
                  </TableCell>
                  <TableCell className={`border border-gray-500 text-center px-2 py-2 font-semibold ${totals.balance < 0 ? "text-red-600" : totals.balance > 0 ? "text-green-700" : ""}`}>
                    -
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}

          {allLedgerStockSummary.length > 0 && (
            <>
              <TableRow>
                <TableCell colSpan={ledgerTableColumnCount} className="text-center px-2 py-2 font-semibold">
                  Stock Summary
                </TableCell>
              </TableRow>

              {allLedgerStockSummary.map(([currency, totals]) => (
                <TableRow key={`stock-summary-${currency}`}>
                  <TableCell colSpan={5} className="text-center px-2 py-2">{""}</TableCell>
                  <TableCell className="border border-gray-500 text-center px-2 py-2">{currency}</TableCell>
                  <TableCell className="border border-gray-500 text-center px-2 py-2">Total</TableCell>
                  <TableCell className="border border-gray-500 bg-gray-200 text-center px-2 py-2">-</TableCell>
                  <TableCell className="border border-gray-500 bg-gray-200 text-center px-2 py-2">-</TableCell>
                  <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2">{totals.debit.toFixed(2)}</TableCell>
                  <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2">{totals.credit.toFixed(2)}</TableCell>
                  <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">
                    -
                  </TableCell>
                  <TableCell className={`border border-gray-500 text-center px-2 py-2 font-semibold ${totals.balance < 0 ? "text-red-600" : totals.balance > 0 ? "text-green-700" : ""}`}>
                    {totals.balance.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableFooter>
      );
    }

    return (
      <TableFooter className="border-separate border-spacing-y-2 text-black text-sm dark:bg-gray-800 mt-4">
        {Object.entries(ledgerTotalsByCurrency).map(([currency, totals]) => (
          <Fragment key={currency}>
            <TableRow>
              <TableCell className="text-center px-2 py-2">{""}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
              <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
              <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
              <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
              <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
              <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>

              <TableCell isHeader className="text-center px-2 py-2">{currency}</TableCell>

              <TableCell className="border border-gray-500 text-center">
                Total:
              </TableCell>

              {isPurchaseLedger && (
                <>
                  <TableCell className="border border-gray-500 bg-gray-200 text-center px-2 py-2">{totals.purchaseDebit.toFixed(2)}</TableCell>
                  <TableCell className="border border-gray-500 bg-gray-200 text-center border-l border-gray-500 px-2 py-2">{totals.purchaseCredit.toFixed(2)}</TableCell>
                  {hasStockCategory && (
                    <>
                      <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2">{totals.purchaseStockDebit.toFixed(2)}</TableCell>
                      <TableCell className="border border-gray-500 bg-gray-50 text-center border-l border-gray-500 px-2 py-2">{totals.purchaseStockCredit.toFixed(2)}</TableCell>
                    </>
                  )}
                </>
              )}

              {isSaleLedger && (
                <>
                  <TableCell className="border border-gray-500 bg-gray-200 text-center px-2 py-2">{totals.saleDebit.toFixed(2)}</TableCell>
                  <TableCell className="border border-gray-500 bg-gray-200 text-center border-l border-gray-500 px-2 py-2">{totals.saleCredit.toFixed(2)}</TableCell>
                  {hasStockCategory && (
                    <>
                      <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2">{totals.saleStockDebit.toFixed(2)}</TableCell>
                      <TableCell className="border border-gray-500 bg-gray-50 text-center border-l border-gray-500 px-2 py-2">{totals.saleStockCredit.toFixed(2)}</TableCell>
                    </>
                  )}
                </>
              )}

              {hasStockCategory && (
                <>
                  <TableCell className="border border-gray-500 bg-gray-200 text-center px-2 py-2">{totals.advanceDebit.toFixed(2)}</TableCell>
                  <TableCell className="border border-gray-500 bg-gray-200 text-center border-l border-gray-500 px-2 py-2">{totals.advanceCredit.toFixed(2)}</TableCell>
                </>
              )}

              <TableCell className="border border-gray-500 text-center border-l border-gray-500 px-2 py-2">{totals.closeBalance.toFixed(2)}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell isHeader colSpan={6} className="text-center px-2 py-2">{""}</TableCell>
              <TableCell className="border border-gray-500 text-center">Balance:</TableCell>

              {isPurchaseLedger && (
                <>
                  <TableCell colSpan={2} className={`border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold ${totals.purchaseBalance > 0 ? "text-green-700" : totals.purchaseBalance < 0 ? "text-red-600" : ""}`}>{totals.purchaseBalance.toFixed(2)}</TableCell>
                  {hasStockCategory && (
                    <TableCell colSpan={2} className={`border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold ${totals.purchaseStockBalance < 0 ? "text-red-600" : totals.purchaseStockBalance > 0 ? "text-green-700" : ""}`}>{totals.purchaseStockBalance.toFixed(2)}</TableCell>
                  )}
                </>
              )}

              {isSaleLedger && (
                <>
                  <TableCell colSpan={2} className={`border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold ${totals.saleBalance < 0 ? "text-red-600" : totals.saleBalance > 0 ? "text-green-700" : ""}`}>{totals.saleBalance.toFixed(2)}</TableCell>
                  {hasStockCategory && (
                    <TableCell colSpan={2} className={`border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold ${totals.saleStockBalance > 0 ? "text-green-700" : totals.saleStockBalance < 0 ? "text-red-600" : ""}`}>{totals.saleStockBalance.toFixed(2)}</TableCell>
                  )}
                </>
              )}

              {hasStockCategory && (
                <TableCell colSpan={2} className={`border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold ${totals.advanceBalance < 0 ? "text-red-600" : totals.advanceBalance > 0 ? "text-green-700" : ""}`}>{totals.advanceBalance.toFixed(2)}</TableCell>
              )}

              <TableCell colSpan={2} className={`border border-gray-500 text-center px-2 py-2 font-semibold ${totals.closeBalance < 0 ? "text-red-600" : totals.closeBalance > 0 ? "text-green-700" : ""}`}>{totals.closeBalance.toFixed(2)}</TableCell>
            </TableRow>
          </Fragment>
        ))}
      </TableFooter>
    );
  };

  const clearFilters = () => {
    setSelectedPartyId(partyID > 0 ? partyID : 0);
    setSelectedTransactionType("");
    setFromDate("");
    setToDate("");
    setCurrentPage(totalPages);
    setFilterPickerKey((prev) => prev + 1);
  };

  const filterControls = (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5 print:hidden mb-4">
      <div>
        <p className="mb-1 text-sm font-medium text-gray-700">Party</p>
        <Select
          options={parties.map((p) => ({
            label: p.name,
            value: p.id,
          }))}
          placeholder="Filter by party"
          value={
            parties
              .filter((p) => p.id === selectedPartyId)
              .map((p) => ({ label: p.name, value: p.id }))[0] || null
          }
          onChange={(selectedOption) => setSelectedPartyId(selectedOption?.value ?? 0)}
          isClearable
          styles={selectStyles}
          classNamePrefix="react-select"
        />
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-gray-700">Transaction Type</p>
        <Select
          options={transactionTypeOptions}
          placeholder="Filter by transaction"
          value={transactionTypeOptions.find((option) => option.value === selectedTransactionType) || null}
          onChange={(selectedOption) => setSelectedTransactionType(selectedOption?.value ?? "")}
          isClearable
          styles={selectStyles}
          classNamePrefix="react-select"
        />
      </div>

      <div>
        <DatePicker
          key={`ledger-from-${filterPickerKey}`}
          id="ledger-from-date"
          label="From Date"
          placeholder="Select from date"
          defaultDate={fromDate}
          onChange={(_, currentDateString) => {
            setFromDate(currentDateString || "");
          }}
        />
      </div>

      <div>
        <DatePicker
          key={`ledger-to-${filterPickerKey}`}
          id="ledger-to-date"
          label="To Date"
          placeholder="Select to date"
          defaultDate={toDate}
          onChange={(_, currentDateString) => {
            setToDate(currentDateString || "");
          }}
        />
      </div>

      <div className="flex items-end">
        <button
          onClick={clearFilters}
          className="w-full rounded bg-fuchsia-500 px-3 py-2 text-white hover:bg-fuchsia-700"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      <PageMeta
        title={`${ledgerType ? ledgerType.charAt(0).toUpperCase() + ledgerType.slice(1).toLowerCase() : ''} Ledger`}
        description="Voucher & Ledger with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle={`${ledgerType ? ledgerType.charAt(0).toUpperCase() + ledgerType.slice(1).toLowerCase() : ''} Ledger`} />

      {routedParty ? 
        <div>
          {/* Print Button */}
          <div className="flex justify-between print:hidden mb-2">
            <div className="flex">
              
            </div>
    
            <div>
              <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              >
              Print Report
              </button>
            </div>
          </div>

          {filterControls}

          <div id="print-section">

            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-3">
                <div className="space-y-1 mb-3 text-center font-semibold">
                  <h3>{selectedParty ? 'LEDGER' : ''}</h3>
                  {
                    selectedParty && (<h4>of</h4>)
                  }
                  
                  <h4>{selectedParty ? '' + selectedParty.name : ''}</h4>
                  <h4>{selectedParty && selectedParty.phoneNumber ? 'Phone: ' + selectedParty.phoneCode + selectedParty.phoneNumber : ''}</h4>
                </div>
                
                <div className="max-w-full overflow-x-hidden">
                  <Table>
                    <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                      <TableRow>
                        <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                        
                        {renderAmountGroupHeaders()}

                        {renderBalanceGroupHeader()}

                        {/* <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell> */}
                      </TableRow>

                      <TableRow>
                        <TableCell isHeader className="text-center px-2 py-2">Sl</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">Transaction</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">Reference</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">Party Name</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">Description</TableCell>
                        
                        <TableCell isHeader className="text-center px-2 py-2">Account</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">{isAllLedger ? "Item / Currency" : "Currency"}</TableCell>

                        {renderAmountColumnHeaders()}

                        {renderBalanceColumnHeader()}

                        {/* <TableCell isHeader className="text-center px-2 py-2">Created</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">Updated</TableCell> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {status === 'loading' ? (
                        <TableRow>
                          <TableCell colSpan={ledgerTableColumnCount} className="text-center py-4 text-gray-500 dark:text-gray-300">
                            Loading data...
                          </TableCell>
                        </TableRow>
                      ) : paginatedLedgers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={ledgerTableColumnCount} className="text-center py-4 text-gray-500 dark:text-gray-300">
                            No data found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedLedgers.map((ledger, index) => (
                          <TableRow key={`primary-${ledger.id}`} className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </TableCell>

                            <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                              <div>
                                <div>{ledger.transactionType}</div>
                                <div className="text-xs">{ledger.date}</div>
                              </div>
                            </TableCell>

                            <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {ledger.paymentId === null && ledger.stockId === null ? ledger.invoiceRefNo : ""}
                              {ledger.paymentRefNo}
                              {ledger.stockRefNo}
                              {ledger.paymentId !== null && ledger?.payment?.invoice && (
                                <>
                                  <br />
                                  <span className="text-xs">
                                    {`${ledger.payment.invoice.prefix ?? ""}-${String(ledger.payment.invoiceId ?? 0).padStart(6, "0")}`}
                                  </span>
                                </>
                              )}
                              {ledger.stockId !== null && ledger?.stock?.invoice && (
                                <>
                                  <br />
                                  <span className="text-xs">{`${ledger.stock.invoice.prefix ?? ""} - ${String(ledger.stock.invoiceId ?? 0).padStart(6, '0')}`}</span>
                                </>
                              )}
                            </TableCell>

                            <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {ledger.party?.name}
                            </TableCell>
                            
                            <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                              <div>
                                {(ledger.transactionType === "purchase" || ledger.transactionType === "sale" || ledger.transactionType === "clearance_bill") && ledger.description ? (
                                  ledger.description.split('<br />').map((line, idx) => (
                                    <Fragment key={`${line}-${idx}`}>
                                      {line}
                                      <br />
                                    </Fragment>
                                  ))
                                ) : ledger.description || ''
                                }
                              </div>
                            </TableCell>

                            <TableCell className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                              {ledger.bank?.accountName ?? "---"}
                            </TableCell>

                            <TableCell className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                              {isAllLedger ? getItemOrCurrencyLabel(ledger) : ledger.currency ?? ledger.stockCurrency ?? "---"}
                            </TableCell>

                            {renderAmountCells(ledger)}

                            {renderBalanceCells(ledger)}
                            
                          </TableRow>
                        ))
                      )}
                    </TableBody>

                    {renderLedgerFooter()}
                  
                  </Table>
                
                </div>
              </div>
            </div>
          </div>
        </div>
      :
        <div>
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-3">
              {filterControls}
              
              <div className="max-w-full overflow-x-hidden">
                <Table>
                  <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                    <TableRow>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      
                      {renderAmountGroupHeaders()}

                      {renderBalanceGroupHeader()}

                      {/* <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell> */}
                    </TableRow>

                    <TableRow>
                      <TableCell isHeader className="text-center px-2 py-2">Sl</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">Transaction</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">Reference</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">Party Name</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">Description</TableCell>
                      
                      <TableCell isHeader className="text-center px-2 py-2">Account</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">{isAllLedger ? "Item / Currency" : "Currency"}</TableCell>

                      {renderAmountColumnHeaders()}

                      {renderBalanceColumnHeader()}

                      {/* <TableCell isHeader className="text-center px-2 py-2">Created</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">Updated</TableCell> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {status === 'loading' ? (
                      <TableRow>
                        <TableCell colSpan={ledgerTableColumnCount} className="text-center py-4 text-gray-500 dark:text-gray-300">
                          Loading data...
                        </TableCell>
                      </TableRow>
                    ) : paginatedLedgers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={ledgerTableColumnCount} className="text-center py-4 text-gray-500 dark:text-gray-300">
                          No data found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedLedgers.map((ledger, index) => (
                        <TableRow key={`primary-${ledger.id}`} className="border-b border-gray-100 dark:border-white/[0.05]">
                          <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {index + 1}
                          </TableCell>

                          <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            <div>
                              <div>{ledger.transactionType}</div>
                              <div className="text-xs">{ledger.date}</div>
                            </div>
                          </TableCell>

                          <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {ledger.paymentId === null && ledger.stockId === null ? ledger.invoiceRefNo : ""}
                            {ledger.paymentRefNo}
                            {ledger.stockRefNo}
                            {ledger.paymentId !== null && ledger?.payment?.invoice && (
                              <>
                                <br />
                                <span className="text-xs">
                                  {`${ledger.payment.invoice.prefix ?? ""}-${String(ledger.payment.invoiceId ?? 0).padStart(6, "0")}`}
                                </span>
                              </>
                            )}
                            {ledger.stockId !== null && ledger?.stock?.invoice && (
                              <>
                                <br />
                                <span className="text-xs">{`${ledger.stock.invoice.prefix ?? ""} - ${String(ledger.stock.invoiceId ?? 0).padStart(6, '0')}`}</span>
                              </>
                            )}
                          </TableCell>

                          <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {ledger.party?.name}
                          </TableCell>

                          <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            <div>
                              {(ledger.transactionType === "purchase" || ledger.transactionType === "sale" || ledger.transactionType === "clearance_bill") && ledger.description ? (
                                ledger.description.split('<br />').map((line, idx) => (
                                  <Fragment key={`${line}-${idx}`}>
                                    {line}
                                    <br />
                                  </Fragment>
                                ))
                              ) : ledger.description || ''
                              }
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                            {ledger.bank?.accountName ?? "---"}
                          </TableCell>

                          <TableCell className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                            {isAllLedger ? getItemOrCurrencyLabel(ledger) : ledger.currency ?? ledger.stockCurrency ?? "---"}
                          </TableCell>

                          {renderAmountCells(ledger)}

                          {renderBalanceCells(ledger)}
                          
                        </TableRow>
                      ))
                    )}
                  </TableBody>

                  {renderLedgerFooter()}
                  
                </Table>
              
              </div>

              {/* Pagination Controls */}
              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          </div>
        </div>
      }
    </>
  );
}
