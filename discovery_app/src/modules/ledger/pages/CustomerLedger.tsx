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

  // Compute cumulative balance for all ledgers
  const ledgersWithBalance = useMemo(() => {
    if (!ledgers || ledgers.length === 0) return [];

    const cumulativeMap: Record<string, number> = {};

    // Sort by date to calculate running totals correctly
    const sortedLedgers = [...ledgers].sort(
      (a, b) => {
        const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return (a.id || 0) - (b.id || 0);
      }
    );

    // 1. Compute running balance for all transactions
    const withCumulative = sortedLedgers.map((ledger) => {
      const currency = ledger.currency || "UNKNOWN";
      const stockCurrency = ledger.stockCurrency || "UNKNOWN";

      // Money balance
      const moneyChange = Number(ledger.credit ?? 0) - Number(ledger.debit ?? 0);
      cumulativeMap[currency] = (cumulativeMap[currency] || 0) + moneyChange;

      // Stock balance
      const stockChange = Number(ledger.creditQty ?? 0) - Number(ledger.debitQty ?? 0);
      cumulativeMap[stockCurrency] = (cumulativeMap[stockCurrency] || 0) + stockChange;

      const cumulativeBalanceArray = Object.entries(cumulativeMap).map(([cur, amount]) => ({
        currency: cur,
        amount,
      }));

      return {
        ...ledger,
        cumulativeBalance: cumulativeBalanceArray,
      };
    });

    // 2. If no date selected, return full list with running balances
    if (!selectedDate) {
      return withCumulative.map((l, idx) => ({
        ...l,
        previousBalance: idx > 0 ? withCumulative[idx - 1].cumulativeBalance : [],
      }));
    }

    // 3. Compute previous balance before selectedDate
    const targetDate = new Date(selectedDate);
    const beforeSelected = withCumulative.filter(
      (l) => new Date(l.date) < targetDate
    );
    const onSelected = withCumulative.filter(
      (l) => new Date(l.date).toISOString().split("T")[0] === selectedDate
    );

    // Total previous balance up to the selected date
    const previousBalanceMap: Record<string, number> = {};
    beforeSelected.forEach((l) => {
      l.cumulativeBalance.forEach(({ currency, amount }) => {
        previousBalanceMap[currency] = amount;
      });
    });

    const previousBalanceArray = Object.entries(previousBalanceMap).map(([cur, amount]) => ({
      currency: cur,
      amount,
    }));

    // Apply previousBalance to the first ledger of that date
    const result = onSelected.map((ledger, idx) => ({
      ...ledger,
      previousBalance: idx === 0 ? previousBalanceArray : onSelected[idx - 1].cumulativeBalance,
    }));

    return result;
  }, [ledgers, selectedDate]);


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
              setSelectedDate(null);      // clear selected date state
              setPickerKey((prev) => prev + 1); // re-render DatePicker to clear input
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
                <h3>{party ? 'PARTY LEDGER' : ''}</h3>
                <h4>{party ? 'Name: ' + party.name : ''}</h4>
                <h4>{party ? 'Phone: ' + party.phoneCode + party.phoneNumber : ''}</h4>
              </div>
              
              <div className="max-w-full overflow-x-hidden">
                <Table> 
                  <TableHeader className="dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">

                    
                    <TableRow className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Sl</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Transaction</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Reference</TableCell>
                      {/* <TableCell isHeader className="text-center px-2 py-2">Date</TableCell> */}
                      {/* <TableCell isHeader className="text-center px-2 py-2">Party Name</TableCell> */}
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Description</TableCell>
                      
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Account</TableCell>
                      {/* <TableCell isHeader className="text-center px-2 py-2">Item/ Currency</TableCell> */}
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-2">Previous<br></br>Balance</TableCell>

                      <TableCell colSpan={1} className="border border-gray-500 text-center px-2 py-2 font-semibold">Payment (Debit)</TableCell>
                      <TableCell colSpan={1} className="border border-gray-500 text-center px-2 py-2 font-semibold">Payment (Credit)</TableCell>
                      {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                        <>
                        <TableCell colSpan={1} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Stock (Debit)</TableCell>
                        <TableCell colSpan={1} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Stock (Credit)</TableCell>
                        </>
                      )}
                      

                      <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Balance</TableCell>

                    </TableRow>
                    
                    
                  </TableHeader>

                  <TableBody>
                    {status === 'loading' ? (
                      <TableRow>
                        <TableCell colSpan={12} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                          Loading data...
                        </TableCell>
                      </TableRow>
                    ) : ledgersWithBalance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                          No data found.
                        </TableCell>
                      </TableRow>
                    ) : (
                    ledgersWithBalance.filter(l => l.transactionType !== "purchase_stock" && l.transactionType !== "sale_stock")
                    .map((ledger, index) => {
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
                                <span className="text-xs">{`${ledger.stock.invoice.prefix ?? ""} - ${String(ledger.stock.invoiceId ?? 0).padStart(6, '0')}`}</span>
                              </>
                            )}
                          </TableCell>

                          <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">
                            <div>
                              {(ledger.transactionType === "purchase" || ledger.transactionType === "sale" || ledger.transactionType === "clearance_bill") && ledger.description ? (
                                ledger.description.split('<br />').map((line, idx) => (
                                  <Fragment key={`${line}-${idx}`}>
                                    {line}
                                    <br />
                                  </Fragment>
                                ))
                              ) : (
                                ledger.description || ''
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {ledger.bank?.accountName ?? "---"}
                          </TableCell>

                          <TableCell className="border border-gray-500 text-center px-1 py-1">
                            {ledger.previousBalance.map((c, idx) => (
                              <div className={c.amount < 0 ? `text-red-500` : c.amount > 0 ? `text-green-700` : ``} key={idx}>{c.amount != 0 ? `${c.currency} : ${c.amount.toFixed(2)}` : ``}</div>
                            ))}
                          </TableCell>

                          <TableCell className="border border-gray-500 bg-gray-200 text-center px-1 py-1">
                              <div className="text-red-500">{ledger.debit > 0 ? `${ledger.currency} : ${ledger.debit}` : ``}</div>
                          </TableCell>

                          <TableCell className="border border-gray-500 bg-gray-200 text-center px-1 py-1">
                            <div className="text-green-700">{ledger.credit > 0 ? `${ledger.currency} : ${ledger.credit}` : ``}</div>
                          </TableCell>

                          {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                            <>
                            <TableCell className="border border-gray-500 bg-gray-50 text-center px-1 py-1">
                              <div className="text-red-500">{ledger.debitQty > 0 ? `${ledger.stockCurrency} : ${ledger.debitQty}` : ``}</div>
                            </TableCell>
                            <TableCell className="border border-gray-500 bg-gray-50 text-center px-1 py-1">
                              <div className="text-green-700">{ledger.creditQty > 0 ? `${ledger.stockCurrency} : ${ledger.creditQty}` : ``}</div>
                            </TableCell>
                            </>
                          )}

                          <TableCell className="border border-gray-500 text-center px-1 py-1">
                            {ledger.cumulativeBalance.map((c, idx) => {
                              const amount = Number(c.amount) || 0;
                              // Show only if not effectively zero (greater than ±0.0099)
                              if (Math.abs(amount) < 0.01) return null;

                              return (
                                <div
                                  key={idx}
                                  className={amount < 0 ? "text-red-500" : "text-green-700"}
                                >
                                  {`${c.currency} : ${amount.toFixed(2)}`}
                                </div>
                              );
                            })}
                          </TableCell>

                        </TableRow>
                      )})
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
