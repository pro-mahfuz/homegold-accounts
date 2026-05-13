import { useMemo, useEffect, Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table/index.tsx";
import DatePicker from "../../../components/form/date-picker.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { fetchAll } from "../features/ledgerThunks.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { selectUser } from "../../auth/features/authSelectors.ts";
import { selectLedgers, selectLedgerStatus } from "../features/ledgerSelectors.ts";
import { selectPartyById } from "../../party/features/partySelectors.ts";
import { selectAllCategory } from "../../category/features/categorySelectors.ts";
import { fetchParty } from "../../party/features/partyThunks.ts";
import { useParams } from "react-router";

type GroupedBalanceEntry = {
  label: string;
  amount: number;
};

export default function CustomerLedger() {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector(selectUser);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [pickerKey, setPickerKey] = useState(0);

  const partyID = Number(partyId) ?? 0;
  const businessID = Number(authUser?.business?.id) ?? 0;

  useEffect(() => {
    dispatch(fetchAll());
    dispatch(fetchAllCategory());
    dispatch(fetchParty({ type: "all" }));
  }, [dispatch]);

  const status = useSelector(selectLedgerStatus);
  const ledgers = useSelector(selectLedgers(businessID, partyID, 0));
  const party = useSelector(selectPartyById(partyID));
  const categories = useSelector(selectAllCategory);
  const hasStockCategory = categories.some((c) =>
    ["currency", "gold"].includes(c.name.toLowerCase())
  );

  const getPaymentBalanceKey = (ledger: {
    currency?: string | null;
  }) => ledger.currency || "UNKNOWN";

  const getStockBalanceKey = (ledger: {
    stockCurrency?: string | null;
    stock?: { unit?: string | null } | null;
  }) => {
    const itemName = ledger.stockCurrency || "UNKNOWN";
    const normalizedUnit = String(ledger.stock?.unit || "").trim().toLowerCase();
    const isGoldGramLabel =
      itemName.toLowerCase().includes("gold") && ["gram", "gm", "g"].includes(normalizedUnit);
    const unitLabel = ledger.stock?.unit && !isGoldGramLabel ? ` (${ledger.stock.unit})` : "";
    return `${itemName}${unitLabel}`;
  };

  const buildGroupedBalances = (balances: Record<string, number>): GroupedBalanceEntry[] =>
    Object.entries(balances)
      .map(([label, amount]) => ({
        label,
        amount: Number(amount) || 0,
      }))
      .filter(({ amount }) => Math.abs(amount) >= 0.01)
      .sort((a, b) => a.label.localeCompare(b.label));


  const getPartyLedgerStockBalanceDelta = (ledger: {
    debitQty?: number | null;
    creditQty?: number | null;
  }) => {
    return (Number(ledger.creditQty) || 0) - (Number(ledger.debitQty) || 0);
  };

  const getPartyLedgerMoneyBalanceDelta = (ledger: {
    debit?: number | null;
    credit?: number | null;
  }) => {
    const debit = Number(ledger.debit) || 0;
    const credit = Number(ledger.credit) || 0;

    return debit - credit;
  };

  const ledgersWithBalance = useMemo(() => {
    if (!ledgers || ledgers.length === 0) return [];

    const paymentBalanceMap: Record<string, number> = {};
    const stockBalanceMap: Record<string, number> = {};

    const sortedLedgers = [...ledgers].sort((a, b) => {
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (a.id || 0) - (b.id || 0);
    });

    const withCumulative = sortedLedgers.map((ledger) => {
      const hasPaymentEntry =
        (Number(ledger.debit) || 0) !== 0 || (Number(ledger.credit) || 0) !== 0;
      const hasStockEntry =
        (Number(ledger.debitQty) || 0) !== 0 || (Number(ledger.creditQty) || 0) !== 0;

      if (hasPaymentEntry) {
        const paymentKey = getPaymentBalanceKey(ledger);
        paymentBalanceMap[paymentKey] =
          (paymentBalanceMap[paymentKey] || 0) + getPartyLedgerMoneyBalanceDelta(ledger);
      }

      if (hasStockEntry) {
        const stockKey = getStockBalanceKey(ledger);
        stockBalanceMap[stockKey] =
          (stockBalanceMap[stockKey] || 0) + getPartyLedgerStockBalanceDelta(ledger);
      }

      return {
        ...ledger,
        cumulativePaymentBalances: buildGroupedBalances(paymentBalanceMap),
        cumulativeStockBalances: buildGroupedBalances(stockBalanceMap),
      };
    });

    if (!selectedDate) {
      return withCumulative.map((ledger, idx) => ({
        ...ledger,
        previousPaymentBalances: idx > 0 ? withCumulative[idx - 1].cumulativePaymentBalances : [],
        previousStockBalances: idx > 0 ? withCumulative[idx - 1].cumulativeStockBalances : [],
      }));
    }

    const targetDate = new Date(selectedDate);
    const beforeSelected = withCumulative.filter((ledger) => new Date(ledger.date) < targetDate);
    const onSelected = withCumulative.filter(
      (ledger) => new Date(ledger.date).toISOString().split("T")[0] === selectedDate
    );

    const previousPaymentBalanceMap: Record<string, number> = {};
    const previousStockBalanceMap: Record<string, number> = {};

    beforeSelected.forEach((ledger) => {
      ledger.cumulativePaymentBalances.forEach(({ label, amount }) => {
        previousPaymentBalanceMap[label] = amount;
      });
      ledger.cumulativeStockBalances.forEach(({ label, amount }) => {
        previousStockBalanceMap[label] = amount;
      });
    });

    const previousPaymentBalances = buildGroupedBalances(previousPaymentBalanceMap);
    const previousStockBalances = buildGroupedBalances(previousStockBalanceMap);

    return onSelected.map((ledger, idx) => ({
      ...ledger,
      previousPaymentBalances:
        idx === 0 ? previousPaymentBalances : onSelected[idx - 1].cumulativePaymentBalances,
      previousStockBalances:
        idx === 0 ? previousStockBalances : onSelected[idx - 1].cumulativeStockBalances,
    }));
  }, [ledgers, selectedDate]);

  const visibleLedgers = useMemo(
    () =>
      ledgersWithBalance.filter(
        (ledger) => ledger.transactionType !== "purchase_stock" && ledger.transactionType !== "sale_stock"
      ),
    [ledgersWithBalance]
  );

  const renderBalanceLines = (entries: GroupedBalanceEntry[]) => {
    if (entries.length === 0) {
      return "--";
    }

    return (
      <div className="space-y-1">
        {entries.map((entry) => (
          <div
            key={entry.label}
            className={entry.amount < 0 ? "font-medium text-red-500" : entry.amount > 0 ? "font-medium text-green-700" : ""}
          >
            {`${entry.label} : ${entry.amount.toFixed(2)}`}
          </div>
        ))}
      </div>
    );
  };

  const columnCount = hasStockCategory ? 12 : 9;

  return (
    <>
      <PageMeta
        title="Ledger Summary"
        description="Ledger Summary with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle={`Ledger Summary`} />

      <div className="flex justify-between print:hidden mb-2">
        <div className="flex">
          <div>
            <DatePicker
              id="from-date"
              key={pickerKey}
              label=""
              placeholder="Select Date"
              onChange={(dates, currentDateString) => {
                console.log({ dates, currentDateString });
                setSelectedDate(currentDateString || null);
              }}
            />
          </div>
        </div>

        <div>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-400 text-white px-2 py-1 rounded-full hover:bg-red-700 mr-4"
          >
            Back
          </button>

          <button
            onClick={() => {
              setSelectedDate(null);
              setPickerKey((prev) => prev + 1);
            }}
            className="bg-fuchsia-400 text-white px-2 py-1 rounded-full hover:bg-fuchsia-700 mr-4"
          >
            Refresh
          </button>

          <button
            onClick={() => window.print()}
            className="bg-purple-600 text-white px-2 py-1 rounded-full hover:bg-purple-900"
          >
            Print Report
          </button>
        </div>
      </div>

      <div>
        <div id="print-section">
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-3">
              <div className="space-y-1 mb-3 text-center font-semibold">
                <h3>{party ? "PARTY LEDGER" : ""}</h3>
                <h4>{party ? "Name: " + party.name : ""}</h4>
                <h4>{party ? "Phone: " + party.phoneCode + party.phoneNumber : ""}</h4>
              </div>

              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                    <TableRow className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Sl</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Transaction</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Reference</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Description</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Account</TableCell>
                      {/* <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Previous<br></br>Balance</TableCell> */}
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-2 font-semibold">Payment<br></br>(Debit)</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-2 font-semibold">Payment<br></br>(Credit)</TableCell>
                      <TableCell isHeader className="border border-gray-500 bg-sky-100 text-center px-2 py-2 font-semibold">Payment<br></br>Balance</TableCell>
                      {hasStockCategory && (
                        <>
                          <TableCell isHeader className="border border-gray-500 text-center px-2 py-2 font-semibold">Stock<br></br>(Debit)</TableCell>
                          <TableCell isHeader className="border border-gray-500 text-center px-2 py-2 font-semibold">Stock<br></br>(Credit)</TableCell>
                          <TableCell isHeader className="border border-gray-500 bg-fuchsia-100 text-center px-2 py-2 font-semibold">Stock<br></br>Balance</TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {status === "loading" ? (
                      <TableRow>
                        <TableCell colSpan={columnCount} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                          Loading data...
                        </TableCell>
                      </TableRow>
                    ) : visibleLedgers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={columnCount} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                          No data found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleLedgers.map((ledger, index) => {
                        
                        const cumulativePaymentBalances = Array.isArray(ledger.cumulativePaymentBalances)
                          ? ledger.cumulativePaymentBalances
                          : [];
                        const cumulativeStockBalances = Array.isArray(ledger.cumulativeStockBalances)
                          ? ledger.cumulativeStockBalances
                          : [];

                        return (
                          <TableRow key={`primary-${ledger.id}`} className="dark:border-white/[0.05]">
                            <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </TableCell>

                            <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                              <div>{ledger.date}</div>
                              <div>{ledger.transactionType}</div>
                            </TableCell>

                            <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
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
                                  <span className="text-xs">{`${ledger.stock.invoice.prefix ?? ""} - ${String(ledger.stock.invoiceId ?? 0).padStart(6, "0")}`}</span>
                                </>
                              )}
                            </TableCell>

                            <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">
                              <div>
                                {(ledger.transactionType === "purchase" || ledger.transactionType === "sale" || ledger.transactionType === "clearance_bill") && ledger.description ? (
                                  ledger.description.split("<br />").map((line, idx) => (
                                    <Fragment key={`${line}-${idx}`}>
                                      {line}
                                      <br />
                                    </Fragment>
                                  ))
                                ) : (
                                  ledger.description || ""
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {ledger.bank?.accountName ?? "---"}
                            </TableCell>

                            {/* <TableCell className="border border-gray-500 text-center px-1 py-1">
                              {renderPreviousBalance(previousPaymentBalances, previousStockBalances)}
                            </TableCell> */}

                            <TableCell className="border border-gray-500 text-center px-1 py-1">
                              <div>{ledger.debit > 0 ? `${ledger.currency} : ${ledger.debit}` : ""}</div>
                            </TableCell>

                            <TableCell className="border border-gray-500 text-center px-1 py-1">
                              <div>{ledger.credit > 0 ? `${ledger.currency} : ${ledger.credit}` : ""}</div>
                            </TableCell>

                            <TableCell className="border border-gray-500 bg-sky-100 text-center px-1 py-1">
                              {renderBalanceLines(cumulativePaymentBalances)}
                            </TableCell>

                            {hasStockCategory && (
                              <>
                                <TableCell className="border border-gray-500 text-center px-1 py-1">
                                  <div>{ledger.debitQty > 0 ? `${ledger.stockCurrency} : ${ledger.debitQty}` : ""}</div>
                                </TableCell>
                                <TableCell className="border border-gray-500 text-center px-1 py-1">
                                  <div>{ledger.creditQty > 0 ? `${ledger.stockCurrency} : ${ledger.creditQty}` : ""}</div>
                                </TableCell>
                                <TableCell className="border border-gray-500 bg-fuchsia-100 text-center px-1 py-1">
                                  {renderBalanceLines(cumulativeStockBalances)}
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
