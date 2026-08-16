import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table/index.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { selectReceivablePayable, selectPartyStatus } from "../../party/features/partySelectors.ts";
import { fetchReceivablePayable } from "../../party/features/partyThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { BalanceByCurrency } from "../../party/features/partyTypes.ts";

const convertBalanceToDh = (currency: string, balance: number, rate: number) =>
  ["gold-920", "gold-999"].includes(currency.trim().toLowerCase())
    ? balance * rate
    : balance / rate;

export default function ReceivableReport() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [convertDhValues, setConvertDhValues] = useState<Record<string, string>>({});
  
  useEffect(() => {
    dispatch(fetchReceivablePayable());
  }, [dispatch]);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const data = useSelector(selectReceivablePayable);
  const status = useSelector(selectPartyStatus);

  const partiesWithBalance = useMemo(
    () =>
      (data?.parties || []).filter((party) =>
        (party.summaryByCurrency || []).some(
          (summary) =>
            Number(summary.receivable || 0) >= 0.005 ||
            Number(summary.payable || 0) >= 0.005
        )
      ),
    [data]
  );

  const reportSummary = useMemo(() => {
    if (data?.summary) {
      return data.summary;
    }

    const totals = data?.totals || [];
    return {
      partyCount: data?.parties?.length || 0,
      partiesWithBalance: partiesWithBalance.length,
      receivablePartyCount: partiesWithBalance.filter(
        (party) => (party.receivableByCurrency || []).length > 0
      ).length,
      payablePartyCount: partiesWithBalance.filter(
        (party) => (party.payableByCurrency || []).length > 0
      ).length,
      currencies: totals.length,
      totalReceivableByCurrency: totals
        .filter((total) => Number(total.receivable || 0) >= 0.005)
        .map((total) => ({ currency: total.currency, amount: Number(total.receivable) || 0 })),
      totalPayableByCurrency: totals
        .filter((total) => Number(total.payable || 0) >= 0.005)
        .map((total) => ({ currency: total.currency, amount: Number(total.payable) || 0 })),
    };
  }, [data, partiesWithBalance]);

  const currencySummaryRows = useMemo(
    () =>
      (data?.totals || [])
        .map((total) => ({
          currency: total.currency,
          receivable: Number(total.receivable) || 0,
          payable: Number(total.payable) || 0,
          balance: Number(total.netBalance) || 0,
        }))
        .filter((row) => Math.abs(row.receivable) >= 0.005 || Math.abs(row.payable) >= 0.005 || Math.abs(row.balance) >= 0.005)
        .sort((a, b) => String(a.currency).localeCompare(String(b.currency))),
    [data]
  );

  const convertedDhTotal = (currency: string, balance: number) => {
    const rawRate = convertDhValues[currency];
    const rate = Number(rawRate);
    if (!rawRate || !Number.isFinite(rate) || rate === 0) return "--";
    return Math.abs(convertBalanceToDh(currency, balance, rate)).toFixed(2);
  };

  const convertedRows = currencySummaryRows.filter((row) => {
    const rate = Number(convertDhValues[row.currency]);
    return Boolean(convertDhValues[row.currency]) && Number.isFinite(rate) && rate !== 0;
  });
  const totalClosingBalanceDh = convertedRows.length === 0
    ? "--"
    : Math.abs(convertedRows.reduce((total, row) => total + convertBalanceToDh(row.currency, row.balance, Number(convertDhValues[row.currency])), 0)).toFixed(2);

  const renderBalanceEntries = (
    entries: BalanceByCurrency[],
    emptyLabel = "--"
  ) => {
    if (!entries || entries.length === 0) {
      return emptyLabel;
    }

    return (
      <div className="space-y-1">
        {entries.map((entry) => (
          <div key={`${entry.currency}-${entry.amount}`}>
            {`${entry.currency}: ${Number(entry.amount || 0).toFixed(2)}`}
          </div>
        ))}
      </div>
    );
  };

  const receivableColumnLabels = useMemo(() => {
    const labels = new Set<string>();

    partiesWithBalance.forEach((party) => {
      (party.receivableByCurrency || []).forEach((entry) => {
        if (entry.currency) {
          labels.add(entry.currency);
        }
      });
    });

    (reportSummary.totalReceivableByCurrency || []).forEach((entry) => {
      if (entry.currency) {
        labels.add(entry.currency);
      }
    });

    const sortedLabels = Array.from(labels).sort((a, b) => a.localeCompare(b));
    return sortedLabels.length > 0 ? sortedLabels : ["--"];
  }, [partiesWithBalance, reportSummary]);

  const payableColumnLabels = useMemo(() => {
    const labels = new Set<string>();

    partiesWithBalance.forEach((party) => {
      (party.payableByCurrency || []).forEach((entry) => {
        if (entry.currency) {
          labels.add(entry.currency);
        }
      });
    });

    (reportSummary.totalPayableByCurrency || []).forEach((entry) => {
      if (entry.currency) {
        labels.add(entry.currency);
      }
    });

    const sortedLabels = Array.from(labels).sort((a, b) => a.localeCompare(b));
    return sortedLabels.length > 0 ? sortedLabels : ["--"];
  }, [partiesWithBalance, reportSummary]);

  const getBalanceAmountByLabel = (
    entries: BalanceByCurrency[] | undefined,
    label: string
  ) => {
    if (label === "--") {
      return "--";
    }

    const matchedEntry = (entries || []).find((entry) => entry.currency === label);
    return matchedEntry ? Number(matchedEntry.amount || 0).toFixed(2) : "--";
  };

  const totalColumnCount = 2 + receivableColumnLabels.length + payableColumnLabels.length;

  return (
    <>
      <PageMeta
        title="Receivable & Payable Report"
        description="Customers Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Receivable & Payable Report" />

      {/* Print Button */}
      <div className="mb-4 flex justify-end print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="bg-red-400 text-white px-2 py-1 rounded-full hover:bg-red-700 mr-4"
        >
          Back
        </button>

        <button
          onClick={() => window.print()}
          className="bg-purple-600 text-white px-2 py-1 rounded-full hover:bg-purple-900"
        >
          Print Report
        </button>
      </div>

      <div id="print-section">
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full p-4">

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
                        Address: {user?.business?.address} , Email: {user?.business?.email} , Phone: {(user?.business?.phoneCode ?? '') + user?.business?.phoneNumber}
                    </p>
                    <h6 className="border border-gray-500 p-1 rounded text-sm font-semibold text-gray-800 dark:text-white/90 mt-5">
                        Receivable & Payable Report
                    </h6>
                  </div>
                </div>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Total Parties</div>
                  <div className="mt-2 text-2xl font-semibold text-gray-900">{reportSummary.partyCount}</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500">With Balance</div>
                  <div className="mt-2 text-2xl font-semibold text-gray-900">{reportSummary.partiesWithBalance}</div>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-red-600">Receivable Parties</div>
                  <div className="mt-2 text-2xl font-semibold text-red-600">{reportSummary.receivablePartyCount}</div>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-green-700">Payable Parties</div>
                  <div className="mt-2 text-2xl font-semibold text-green-700">{reportSummary.payablePartyCount}</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Currencies</div>
                  <div className="mt-2 text-2xl font-semibold text-gray-900">{reportSummary.currencies}</div>
                </div>
              </div>

              <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="mb-2 text-sm font-semibold text-red-600">Total Receivable</div>
                  <div className="text-sm text-red-600">
                    {renderBalanceEntries(reportSummary.totalReceivableByCurrency || [])}
                  </div>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="mb-2 text-sm font-semibold text-green-700">Total Payable</div>
                  <div className="text-sm text-green-700">
                    {renderBalanceEntries(reportSummary.totalPayableByCurrency || [])}
                  </div>
                </div>
              </div>

              <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                    <TableRow>
                    <TableCell isHeader rowSpan={2} className="border border-gray-500 text-center px-2 py-1">SL</TableCell>
                    <TableCell isHeader rowSpan={2} className="border border-gray-500 text-center px-2 py-1">PARTY NAME</TableCell>

                    <TableCell isHeader colSpan={receivableColumnLabels.length} className="border border-gray-500 text-center px-2 py-1">RECEIVABLE</TableCell>
                    <TableCell isHeader colSpan={payableColumnLabels.length} className="border border-gray-500 text-center px-2 py-1">PAYABLE</TableCell>
                    </TableRow>
                    <TableRow>
                      {receivableColumnLabels.map((label) => (
                        <TableCell
                          key={`receivable-header-${label}`}
                          isHeader
                          className="border border-gray-500 text-center px-2 py-1"
                        >
                          {label}
                        </TableCell>
                      ))}
                      {payableColumnLabels.map((label) => (
                        <TableCell
                          key={`payable-header-${label}`}
                          isHeader
                          className="border border-gray-500 text-center px-2 py-1"
                        >
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {status === "loading" ? (
                        <TableRow>
                        <TableCell colSpan={totalColumnCount} className="text-center py-4 text-gray-500 dark:text-gray-300">
                            Loading data...
                        </TableCell>
                        </TableRow>
                    ) : (
                      <>
                        {partiesWithBalance.map((party, index) => (
                            <TableRow
                              key={party.id || index}
                              className="border-b border-gray-100 dark:border-white/[0.05]"
                            >
                              <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {index + 1}
                              </TableCell>

                              <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {party.name}
                              </TableCell>

                              {receivableColumnLabels.map((label) => (
                                <TableCell
                                  key={`party-${party.id || index}-receivable-${label}`}
                                  className="border border-gray-500 px-2 py-1 text-sm text-red-500 text-right align-top"
                                >
                                  {getBalanceAmountByLabel(party.receivableByCurrency, label)}
                                </TableCell>
                              ))}

                              {payableColumnLabels.map((label) => (
                                <TableCell
                                  key={`party-${party.id || index}-payable-${label}`}
                                  className="border border-gray-500 px-2 py-1 text-sm text-green-700 text-right align-top"
                                >
                                  {getBalanceAmountByLabel(party.payableByCurrency, label)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}

                        <TableRow>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            --
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm font-bold text-gray-700 dark:text-gray-300">
                            TOTAL
                          </TableCell>
                          {receivableColumnLabels.map((label) => (
                            <TableCell
                              key={`total-receivable-${label}`}
                              className="border border-gray-500 px-2 py-1 text-sm text-red-500 text-right align-top font-bold"
                            >
                              {getBalanceAmountByLabel(reportSummary.totalReceivableByCurrency, label)}
                            </TableCell>
                          ))}
                          {payableColumnLabels.map((label) => (
                            <TableCell
                              key={`total-payable-${label}`}
                              className="border border-gray-500 px-2 py-1 text-sm text-green-700 text-right align-top font-bold"
                            >
                              {getBalanceAmountByLabel(reportSummary.totalPayableByCurrency, label)}
                            </TableCell>
                          ))}
                        </TableRow>
                      </>
                    )}
                </TableBody>
              </Table>
              </div>

              <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">Currency Summary</div>
                <div className="max-w-full overflow-x-auto">
                  <Table>
                    <TableHeader className="border border-gray-500 bg-slate-100 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                      <TableRow>
                        {["Currency", "Receivable", "Payable", "Balance", "Convert (DH)", "Total (DH)"].map((label) => <TableCell key={label} isHeader className="border border-gray-500 text-center px-2 py-1">{label}</TableCell>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {status === "loading" ? <TableRow><TableCell colSpan={6} className="border border-gray-500 text-center py-4">Loading data...</TableCell></TableRow>
                        : currencySummaryRows.length === 0 ? <TableRow><TableCell colSpan={6} className="border border-gray-500 text-center py-4 text-gray-500">No summary data found.</TableCell></TableRow>
                        : <>
                          {currencySummaryRows.map((row) => <TableRow key={`currency-summary-${row.currency}`}>
                            <TableCell className="border border-gray-500 px-2 py-1 text-center font-medium">{row.currency}</TableCell>
                            <TableCell className="border border-gray-500 px-2 py-1 text-right text-red-500">{row.receivable === 0 ? "--" : row.receivable.toFixed(2)}</TableCell>
                            <TableCell className="border border-gray-500 px-2 py-1 text-right text-green-700">{row.payable === 0 ? "--" : row.payable.toFixed(2)}</TableCell>
                            <TableCell className={`border border-gray-500 px-2 py-1 text-right ${row.balance < 0 ? "text-red-500" : row.balance > 0 ? "text-green-700" : "text-gray-500"}`}>{row.balance === 0 ? "--" : `${row.balance < 0 ? "-" : ""}${Math.abs(row.balance).toFixed(2)}`}</TableCell>
                            <TableCell className="border border-gray-500 px-2 py-1 text-center"><input type="number" step="any" value={convertDhValues[row.currency] ?? ""} onChange={(event) => setConvertDhValues((prev) => ({ ...prev, [row.currency]: event.target.value }))} className="w-24 rounded border border-gray-300 px-2 py-1 text-right dark:border-gray-600 dark:bg-gray-800 dark:text-white" /></TableCell>
                            <TableCell className="border border-gray-500 px-2 py-1 text-right font-medium text-sky-700">{convertedDhTotal(row.currency, row.balance)}</TableCell>
                          </TableRow>)}
                          <TableRow><TableCell colSpan={5} className="border border-gray-500 px-2 py-2 text-right font-bold">TOTAL CLOSING BALANCE (DH)</TableCell><TableCell className="border border-gray-500 px-2 py-2 text-right font-bold text-sky-700">{totalClosingBalanceDh}</TableCell></TableRow>
                        </>}
                    </TableBody>
                  </Table>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
