import { Fragment, useEffect, useMemo, useState } from "react";
import Select from "react-select";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "../../../components/ui/table/index.tsx";
import DatePicker from "../../../components/form/date-picker.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { fetchAll } from "../../ledger/features/ledgerThunks.ts";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";
import { selectAllLedger, selectLedgerStatus } from "../../ledger/features/ledgerSelectors.ts";
import { selectAllAccountByBusiness } from "../../account/features/accountSelectors.ts";
import { selectAuth } from "../../auth/features/authSelectors.ts";
import { selectUserById } from "../../user/features/userSelectors.ts";
import { Ledger } from "../../ledger/features/ledgerTypes.ts";
import { selectStyles } from "../../types.ts";

const compareLedgerAscending = (a: Ledger, b: Ledger) => {
  const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
  if (dateDiff !== 0) return dateDiff;

  const stableReferenceA =
    Number(a.invoiceId) || Number(a.paymentId) || Number(a.stockId) || Number(a.id) || 0;
  const stableReferenceB =
    Number(b.invoiceId) || Number(b.paymentId) || Number(b.stockId) || Number(b.id) || 0;
  const referenceDiff = stableReferenceA - stableReferenceB;
  if (referenceDiff !== 0) return referenceDiff;

  const createdAtDiff =
    new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
  if (createdAtDiff !== 0) return createdAtDiff;

  return (a.id || 0) - (b.id || 0);
};

const getCashbookDelta = (ledger: Pick<Ledger, "debit" | "credit">) =>
  (Number(ledger.debit) || 0) - (Number(ledger.credit) || 0);

const formatSignedValueClass = (value: number) =>
  value < 0 ? "text-red-600" : value > 0 ? "text-green-700" : "";

const formatAmount = (value: number | null | undefined, showDashForZero = true) => {
  const amount = Number(value) || 0;
  if (showDashForZero && amount === 0) {
    return "-";
  }

  return amount.toFixed(2);
};

type CurrencySummaryEntry = {
  label: string;
  debit: number;
  credit: number;
  balance: number;
};

const CURRENCY_BALANCE_VISIBILITY_EPSILON = 0.01;

const getLedgerCurrency = (ledger: Pick<Ledger, "currency" | "invoice">) =>
  ledger.currency || ledger.invoice?.currency || "UNKNOWN";

const buildCurrencySummaryEntries = (
  ledgers: Array<Pick<Ledger, "debit" | "credit" | "currency" | "invoice">>
): CurrencySummaryEntry[] =>
  Object.entries(
    ledgers.reduce<Record<string, Omit<CurrencySummaryEntry, "label">>>((totals, ledger) => {
      const currency = getLedgerCurrency(ledger);
      const debit = Number(ledger.debit) || 0;
      const credit = Number(ledger.credit) || 0;

      if (!totals[currency]) {
        totals[currency] = { debit: 0, credit: 0, balance: 0 };
      }

      totals[currency].debit += debit;
      totals[currency].credit += credit;
      totals[currency].balance += getCashbookDelta(ledger);

      return totals;
    }, {})
  )
    .map(([label, summary]) => ({
      label,
      ...summary,
    }))
    .filter(({ debit, credit, balance }) =>
      Math.abs(debit) >= CURRENCY_BALANCE_VISIBILITY_EPSILON ||
      Math.abs(credit) >= CURRENCY_BALANCE_VISIBILITY_EPSILON ||
      Math.abs(balance) >= CURRENCY_BALANCE_VISIBILITY_EPSILON
    )
    .sort((a, b) => a.label.localeCompare(b.label));

const buildCurrencyBalanceSummaryEntries = (balances: Record<string, number>): CurrencySummaryEntry[] =>
  Object.entries(balances)
    .map(([label, balance]) => ({
      label,
      debit: 0,
      credit: 0,
      balance: Number(balance) || 0,
    }))
    .filter(({ balance }) => Math.abs(balance) >= CURRENCY_BALANCE_VISIBILITY_EPSILON)
    .sort((a, b) => a.label.localeCompare(b.label));

const renderCurrencySummaryLines = (
  entries: CurrencySummaryEntry[],
  valueKey: "debit" | "credit" | "balance"
) => {
  const visibleEntries = entries.filter(
    (entry) => Math.abs(Number(entry[valueKey]) || 0) >= CURRENCY_BALANCE_VISIBILITY_EPSILON
  );

  if (visibleEntries.length === 0) {
    return "-";
  }

  return (
    <div className="space-y-1 text-xs leading-4">
      {visibleEntries.map((entry) => {
        const value = Number(entry[valueKey]) || 0;

        return (
        <div key={`${entry.label}-${valueKey}`} className={formatSignedValueClass(value)}>
          {`${entry.label} : ${formatAmount(value, false)}`}
        </div>
      )})}
    </div>
  );
};

const getLedgerReference = (ledger: Ledger) => {
  const references = [
    ledger.paymentId === null && ledger.stockId === null ? ledger.invoiceRefNo : "",
    ledger.paymentRefNo,
    ledger.stockRefNo,
  ].filter(Boolean);

  if (ledger.paymentId !== null && ledger.payment?.invoice) {
    references.push(
      `${ledger.payment.invoice.prefix ?? ""}-${String(ledger.payment.invoiceId ?? 0).padStart(6, "0")}`
    );
  }

  if (ledger.stockId !== null && ledger.stock?.invoice) {
    references.push(
      `${ledger.stock.invoice.prefix ?? ""}-${String(ledger.stock.invoiceId ?? 0).padStart(6, "0")}`
    );
  }

  return references;
};

export default function CashBookReport() {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const businessID = Number(user?.business?.id) ?? 0;

  const [bankId, setBankId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterPickerKey, setFilterPickerKey] = useState(0);

  useEffect(() => {
    dispatch(fetchAll());
    dispatch(fetchAllAccount());
  }, [dispatch]);

  const status = useSelector(selectLedgerStatus);
  const ledgers = useSelector(selectAllLedger);
  const paymentAccounts = useSelector(selectAllAccountByBusiness(businessID));
  const paymentAccountOptions = useMemo(
    () => [
      { label: "All", value: 0 },
      ...paymentAccounts.map((account) => ({
        label: account.accountName,
        value: Number(account.id),
      })),
    ],
    [paymentAccounts]
  );

  const accountLedgers = useMemo(() => {
    if (!(businessID > 0) || bankId === null) {
      return [] as Ledger[];
    }

    return ledgers
      .filter((ledger) => {
        if (Number(ledger.businessId) !== businessID) return false;
        if (bankId === 0) {
          if (!(Number(ledger.bankId) > 0)) return false;
        } else if (Number(ledger.bankId) !== bankId) {
          return false;
        }

        const debit = Number(ledger.debit) || 0;
        const credit = Number(ledger.credit) || 0;

        return debit !== 0 || credit !== 0;
      })
      .sort(compareLedgerAscending);
  }, [bankId, businessID, ledgers]);

  const openingLedgers = useMemo(() => {
    if (!fromDate) {
      return [] as Ledger[];
    }

    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);

    return accountLedgers.filter((ledger) => new Date(ledger.date) < from);
  }, [accountLedgers, fromDate]);

  const filteredLedgers = useMemo(() => {
    return accountLedgers.filter((ledger) => {
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
  }, [accountLedgers, fromDate, toDate]);

  const openingSummaryEntries = useMemo(
    () => buildCurrencySummaryEntries(openingLedgers),
    [openingLedgers]
  );

  const openingBalanceMap = useMemo(
    () =>
      openingSummaryEntries.reduce<Record<string, number>>((balances, entry) => {
        balances[entry.label] = entry.balance;
        return balances;
      }, {}),
    [openingSummaryEntries]
  );

  const closingLedgers = useMemo(() => {
    if (!toDate) {
      return accountLedgers;
    }

    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    return accountLedgers.filter((ledger) => new Date(ledger.date) <= to);
  }, [accountLedgers, toDate]);

  const closingSummaryEntries = useMemo(
    () => buildCurrencySummaryEntries(closingLedgers),
    [closingLedgers]
  );

  const ledgersWithBalance = useMemo(() => {
    const runningBalancesByCurrency: Record<string, number> = { ...openingBalanceMap };

    return filteredLedgers.map((ledger) => {
      const currency = getLedgerCurrency(ledger);
      runningBalancesByCurrency[currency] =
        (runningBalancesByCurrency[currency] || 0) + getCashbookDelta(ledger);

      return {
        ...ledger,
        cashbookBalance: runningBalancesByCurrency[currency],
        cashbookBalanceEntries: buildCurrencyBalanceSummaryEntries(runningBalancesByCurrency),
      };
    });
  }, [filteredLedgers, openingBalanceMap]);

  const periodSummaryEntries = useMemo(
    () => buildCurrencySummaryEntries(filteredLedgers),
    [filteredLedgers]
  );

  const selectedPaymentAccount =
    paymentAccounts.find((account) => Number(account.id) === bankId) ?? null;
  const selectedPaymentAccountLabel =
    bankId === 0 ? "All Payment Accounts" : selectedPaymentAccount?.accountName ?? "";
  const hasDateRangeFilter = Boolean(fromDate || toDate);

  const clearFilters = () => {
    setBankId(null);
    setFromDate("");
    setToDate("");
    setFilterPickerKey((prev) => prev + 1);
  };

  return (
    <>
      <PageMeta title="Cashbook Report" description="Cashbook report based on payment account ledger data" />
      <PageBreadcrumb pageTitle="Cashbook Report" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 print:hidden mb-4">
        <div>
          <p className="mb-1 text-sm font-medium text-gray-700">Payment Account</p>
          <Select
            options={paymentAccountOptions}
            placeholder="Select payment account"
            value={
              paymentAccountOptions.find((account) => account.value === bankId) || null
            }
            onChange={(selectedOption) => setBankId(selectedOption ? Number(selectedOption.value) : null)}
            isClearable
            styles={selectStyles}
            classNamePrefix="react-select"
          />
        </div>

        <div>
          <DatePicker
            key={`cashbook-from-${filterPickerKey}`}
            id="cashbook-from-date"
            label="From Date"
            placeholder="Select from date"
            defaultDate={fromDate}
            onChange={(_, currentDateString) => setFromDate(currentDateString || "")}
          />
        </div>

        <div>
          <DatePicker
            key={`cashbook-to-${filterPickerKey}`}
            id="cashbook-to-date"
            label="To Date"
            placeholder="Select to date"
            defaultDate={toDate}
            onChange={(_, currentDateString) => setToDate(currentDateString || "")}
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={clearFilters}
            className="w-full rounded bg-fuchsia-500 px-3 py-2 text-white hover:bg-fuchsia-700"
          >
            Clear Filters
          </button>
          <button
            onClick={() => window.print()}
            className="w-full rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
          >
            Print Report
          </button>
        </div>
      </div>

      <div id="print-section" className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="p-5 rounded-2xl lg:p-6">
            <div className="flex flex-row items-center text-center gap-5 xl:flex-row xl:justify-between">
              <div className="flex flex-col items-center w-full gap-1">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {user?.business?.businessName}
                </h4>
                {user?.business?.trnNo && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    TRN No: {user.business.trnNo}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Address: {user?.business?.address} , Email: {user?.business?.email} , Phone: {(user?.business?.phoneCode ?? "") + user?.business?.phoneNumber}
                </p>
                <h6 className="border border-gray-500 p-1 rounded text-sm font-semibold text-gray-800 dark:text-white/90 mt-5">
                  Cashbook Report
                </h6>
                <h6 className="text-sm font-semibold text-gray-800 dark:text-white/90 mt-2">
                  {selectedPaymentAccountLabel ? `Account Name: ${selectedPaymentAccountLabel}` : ""}
                </h6>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {fromDate || toDate
                    ? `Period: ${fromDate || "Beginning"} to ${toDate || "Today"}`
                    : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-full overflow-x-hidden">
            <Table>
              <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                <TableRow>
                  <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Sl</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Date</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Transaction</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Reference</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Party Name</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Description</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Payment Account</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Currency</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Debit</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Credit</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Balance</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {status === "loading" ? (
                  <TableRow>
                    <TableCell colSpan={11} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : bankId === null ? (
                  <TableRow>
                    <TableCell colSpan={11} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                      Select a payment account to view the cashbook.
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    <TableRow className="border-b border-gray-100 bg-amber-50 dark:border-white/[0.05]">
                      <TableCell colSpan={8} className="border border-gray-500 text-center px-2 py-2 font-semibold text-gray-700 dark:text-gray-300">
                        Opening Balance
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">
                        {renderCurrencySummaryLines(openingSummaryEntries, "debit")}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">
                        {renderCurrencySummaryLines(openingSummaryEntries, "credit")}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">
                        {renderCurrencySummaryLines(openingSummaryEntries, "balance")}
                      </TableCell>
                    </TableRow>

                    {ledgersWithBalance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                          No data found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      ledgersWithBalance.map((ledger, index) => (
                        <TableRow key={`cashbook-${ledger.id}`} className="border-b border-gray-100 dark:border-white/[0.05]">
                          <TableCell className="border border-gray-500 text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {index + 1}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {ledger.date}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {ledger.transactionType}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {getLedgerReference(ledger).map((reference, referenceIndex) => (
                              <Fragment key={`${reference}-${referenceIndex}`}>
                                {reference}
                                {referenceIndex < getLedgerReference(ledger).length - 1 && <br />}
                              </Fragment>
                            ))}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {ledger.party?.name ?? "---"}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            <div>
                              {(ledger.transactionType === "purchase" ||
                                ledger.transactionType === "sale" ||
                                ledger.transactionType === "clearance_bill") &&
                              ledger.description
                                ? ledger.description.split("<br />").map((line, lineIndex) => (
                                    <Fragment key={`${line}-${lineIndex}`}>
                                      {line}
                                      <br />
                                    </Fragment>
                                  ))
                                : ledger.description || ""}
                            </div>
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {ledger.bank?.accountName ?? selectedPaymentAccountLabel ?? "---"}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {getLedgerCurrency(ledger)}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-2">
                            {formatAmount(Number(ledger.debit) || 0)}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-2">
                            {formatAmount(Number(ledger.credit) || 0)}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">
                            {renderCurrencySummaryLines(ledger.cashbookBalanceEntries ?? [], "balance")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </>
                )}
              </TableBody>

              {bankId !== null && (
                <TableFooter className="border-separate border-spacing-y-2 text-black text-sm dark:bg-gray-800 mt-4">
                  {hasDateRangeFilter && (
                    <TableRow>
                      <TableCell colSpan={8} className="border border-gray-500 text-center px-2 py-2 font-semibold text-gray-700 dark:text-gray-300">
                        Period Total
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">
                        {renderCurrencySummaryLines(periodSummaryEntries, "debit")}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">
                        {renderCurrencySummaryLines(periodSummaryEntries, "credit")}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">
                        {renderCurrencySummaryLines(periodSummaryEntries, "balance")}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={8} className="border border-gray-500 text-center px-2 py-2 font-semibold text-gray-700 dark:text-gray-300">
                      Closing Balance
                    </TableCell>
                    <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">
                      {renderCurrencySummaryLines(closingSummaryEntries, "debit")}
                    </TableCell>
                    <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">
                      {renderCurrencySummaryLines(closingSummaryEntries, "credit")}
                    </TableCell>
                    <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">
                      {renderCurrencySummaryLines(closingSummaryEntries, "balance")}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
