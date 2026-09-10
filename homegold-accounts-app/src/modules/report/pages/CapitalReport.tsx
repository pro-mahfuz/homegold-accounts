import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import axiosInstance from "../../../api/axios";

type Summary = { currency: string; cashBankBalance: number; receivable: number; payable: number; stockValue: number; overallCapital: number };
const formatNumber = (value: number) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const convertToDh = (currency: string, amount: number, rate: number) =>
  ["usd", "gold-920", "gold-999"].includes(currency.trim().toLowerCase())
    ? amount * rate
    : amount / rate;

export default function CapitalReport() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [convertDhValues, setConvertDhValues] = useState<Record<string, string>>({});

  const getBalance = (row: Summary) => Number(row.payable || 0) - Number(row.receivable || 0);

  const convertedCapital = (row: Summary) => {
    const rawRate = convertDhValues[row.currency];
    const rate = Number(rawRate);
    if (!rawRate || !Number.isFinite(rate) || rate === 0) return "--";
    return formatNumber(Math.abs(convertToDh(row.currency, getBalance(row), rate)));
  };

  const totalCapitalDh = summary.reduce((total, row) => {
    const rawRate = convertDhValues[row.currency];
    const rate = Number(rawRate);
    return !rawRate || !Number.isFinite(rate) || rate === 0
      ? total
      : total + convertToDh(row.currency, getBalance(row), rate);
  }, 0);
  const hasConvertedCapital = summary.some((row) => {
    const rate = Number(convertDhValues[row.currency]);
    return Boolean(convertDhValues[row.currency]) && Number.isFinite(rate) && rate !== 0;
  });

  useEffect(() => {
    axiosInstance.post("protected/stock/getCapitalReport")
      .then(({ data }) => { setSummary(data.data?.summary ?? []); })
      .catch((err) => setError(err.response?.data?.message || "Unable to load capital report."))
      .finally(() => setLoading(false));
  }, []);

  return <>
    <PageMeta title="Capital Report" description="Overall business capital and stock value" />
    <PageBreadcrumb pageTitle="Capital Report" />
    <div className="mb-3 flex justify-end gap-3 print:hidden">
      <button onClick={() => navigate(-1)} className="rounded-full bg-red-400 px-3 py-1 text-white hover:bg-red-700">Back</button>
      <button onClick={() => window.print()} className="rounded-full bg-purple-600 px-3 py-1 text-white hover:bg-purple-900">Print Report</button>
    </div>
    <div id="print-section" className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Capital Report</h1>
        </div>
        <Table>
          <TableHeader className="bg-gray-200 text-black dark:bg-gray-800 dark:text-gray-300"><TableRow>
            {["Currency", "Receivable", "Payable", "Balance", "Convert (DH)", "Total (DH)"].map(label => <TableCell key={label} isHeader className="border border-gray-400 px-2 py-2 text-center">{label}</TableCell>)}
          </TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={6} className="py-5 text-center">Loading data...</TableCell></TableRow>
              : error ? <TableRow><TableCell colSpan={6} className="py-5 text-center text-red-600">{error}</TableCell></TableRow>
              : summary.length === 0 ? <TableRow><TableCell colSpan={6} className="py-5 text-center">No currency summary found.</TableCell></TableRow> : <>
              {summary.map(row => {
                const balance = getBalance(row);
                return <TableRow key={`currency-${row.currency}`}>
                <TableCell className="border border-gray-400 px-2 py-2 text-center font-semibold">{row.currency}</TableCell>
                <TableCell className="border border-gray-400 px-2 py-2 text-right text-red-500">{row.receivable === 0 ? "--" : formatNumber(row.receivable)}</TableCell>
                <TableCell className="border border-gray-400 px-2 py-2 text-right text-green-700">{row.payable === 0 ? "--" : formatNumber(row.payable)}</TableCell>
                <TableCell className={`border border-gray-400 px-2 py-2 text-right ${balance < 0 ? "text-red-500" : balance > 0 ? "text-green-700" : "text-gray-500"}`}>{balance === 0 ? "--" : `${balance < 0 ? "-" : ""}${formatNumber(Math.abs(balance))}`}</TableCell>
                <TableCell className="border border-gray-400 px-2 py-2 text-center">
                  <input type="number" step="any" value={convertDhValues[row.currency] ?? ""} onChange={(event) => setConvertDhValues(prev => ({ ...prev, [row.currency]: event.target.value }))} className="w-24 rounded border border-gray-300 px-2 py-1 text-right dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                </TableCell>
                <TableCell className="border border-gray-400 px-2 py-2 text-right font-medium text-sky-700">{convertedCapital(row)}</TableCell>
              </TableRow>})}
              <TableRow><TableCell colSpan={5} className="border border-gray-400 px-2 py-2 text-right font-bold">TOTAL CLOSING BALANCE (DH)</TableCell><TableCell className="border border-gray-400 px-2 py-2 text-right font-bold text-sky-700">{hasConvertedCapital ? formatNumber(Math.abs(totalCapitalDh)) : "--"}</TableCell></TableRow>
            </>}
          </TableBody>
        </Table>
      </section>
    </div>
  </>;
}
