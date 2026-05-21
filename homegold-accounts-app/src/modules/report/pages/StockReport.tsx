import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "../../../components/ui/table/index.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import {
  selectStockStatus,
  selectStockReport
} from "../../stock/features/stockSelectors.ts";
import { getStockReport } from "../../stock/features/stockThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";

export default function StockReport() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [summaryTab, setSummaryTab] = useState<"stock" | "purchase" | "sale">("stock");

  useEffect(() => {
    dispatch(getStockReport());
    dispatch(fetchAllCategory());
  }, [dispatch]);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const status = useSelector(selectStockStatus);
  const stockReports = useSelector(selectStockReport);
  const itemSummaryColumnCount = 8;
  const purchaseSummaryColumnCount = 7;
  const saleSummaryColumnCount = 7;
  const overall = stockReports.reduce(
    (acc, stock) => {
      acc.totalUnfixPurchase += Number(stock.totalUnfixPurchase) || 0;
      acc.totalFixPurchase += Number(stock.totalFixPurchase) || 0;
      acc.totalUnfixSale += Number(stock.totalUnfixSale) || 0;
      acc.totalFixSale += Number(stock.totalFixSale) || 0;
      acc.totalStockIn += Number(stock.totalStockIn) || 0;
      acc.totalStockOut += Number(stock.totalStockOut) || 0;
      acc.totalTransferOut += Number(stock.totalTransferOut) || 0;
      acc.totalTransferReturn += Number(stock.totalTransferReturn) || 0;
      acc.totalIn += Number(stock.totalIn) || 0;
      acc.totalOut += Number(stock.totalOut) || 0;
      acc.totalDamaged += Number(stock.totalDamaged) || 0;
      acc.currentStock += Number(stock.currentStock) || 0;
      acc.transferStock += Number(stock.transferStock) || 0;
      acc.totalStock += Number(stock.totalStock) || 0;
      return acc;
    },
    {
      totalUnfixPurchase: 0,
      totalFixPurchase: 0,
      totalUnfixSale: 0,
      totalFixSale: 0,
      totalStockIn: 0,
      totalStockOut: 0,
      totalTransferOut: 0,
      totalTransferReturn: 0,
      totalIn: 0,
      totalOut: 0,
      totalDamaged: 0,
      currentStock: 0,
      transferStock: 0,
      totalStock: 0
    }
  );


  const purchasePartySummary = useMemo(() => {
    const grouped = new Map<
      string,
      {
        partyId: number;
        partyName: string;
        itemId: number;
        itemName: string;
        unit: string;
        totalUnfixPurchase: number;
        totalFixPurchase: number;
        currentPurchaseStock: number;
      }
    >();

    stockReports.forEach((stock) => {
        const partyId = Number(stock.partyId) || 0;
        const itemId = Number(stock.itemId) || 0;
        const unit = stock.unit ?? "";
        const key = [partyId, itemId, unit].join("|");
        const existing = grouped.get(key) ?? {
          partyId,
          partyName: stock.party?.name ?? "-",
          itemId,
          itemName: stock.item?.name ?? "-",
          unit,
          totalUnfixPurchase: 0,
          totalFixPurchase: 0,
          currentPurchaseStock: 0,
        };

        existing.totalUnfixPurchase += Number(stock.totalUnfixPurchase) || 0;
        existing.totalFixPurchase += Number(stock.totalFixPurchase) || 0;

        existing.currentPurchaseStock =
          existing.totalFixPurchase - existing.totalUnfixPurchase;

        grouped.set(key, existing);
      });

    return Array.from(grouped.values())
      .filter((row) => row.totalUnfixPurchase > 0 || row.totalFixPurchase > 0)
      .sort((a, b) => {
        const partyCompare = a.partyName.localeCompare(b.partyName);
        if (partyCompare !== 0) return partyCompare;
        const itemCompare = a.itemName.localeCompare(b.itemName);
        if (itemCompare !== 0) return itemCompare;
        return a.unit.localeCompare(b.unit);
      });
  }, [stockReports]);

  const purchaseSummaryTotals = useMemo(
    () =>
      purchasePartySummary.reduce(
        (acc, party) => {
          acc.totalUnfixPurchase += party.totalUnfixPurchase;
          acc.totalFixPurchase += party.totalFixPurchase;
          return acc;
        },
        {
          totalUnfixPurchase: 0,
          totalFixPurchase: 0,
        }
      ),
    [purchasePartySummary]
  );

  const salePartySummary = useMemo(() => {
    const grouped = new Map<
      string,
      {
        partyId: number;
        partyName: string;
        itemId: number;
        itemName: string;
        unit: string;
        totalUnfixSale: number;
        totalFixSale: number;
        totalTransferOut: number;
        totalTransferReturn: number;
        currentSaleStock: number;
      }
    >();

    stockReports.forEach((stock) => {
        const partyId = Number(stock.partyId) || 0;
        const itemId = Number(stock.itemId) || 0;
        const unit = stock.unit ?? "";
        const key = [partyId, itemId, unit].join("|");
        const existing = grouped.get(key) ?? {
          partyId,
          partyName: stock.party?.name ?? "-",
          itemId,
          itemName: stock.item?.name ?? "-",
          unit,
          totalUnfixSale: 0,
          totalFixSale: 0,
          totalTransferOut: 0,
          totalTransferReturn: 0,
          currentSaleStock: 0,
        };

        existing.totalUnfixSale += Number(stock.totalUnfixSale) || 0;
        existing.totalFixSale += Number(stock.totalFixSale) || 0;
        existing.totalTransferOut += Number(stock.totalTransferOut) || 0;
        existing.totalTransferReturn += Number(stock.totalTransferReturn) || 0;

        existing.currentSaleStock =
          existing.totalUnfixSale +
          existing.totalTransferOut -
          existing.totalFixSale -
          existing.totalTransferReturn;

        grouped.set(key, existing);
      });

    return Array.from(grouped.values())
      .filter(
        (row) =>
          row.totalUnfixSale > 0 ||
          row.totalFixSale > 0 ||
          row.totalTransferOut > 0 ||
          row.totalTransferReturn > 0
      )
      .sort((a, b) => {
        const partyCompare = a.partyName.localeCompare(b.partyName);
        if (partyCompare !== 0) return partyCompare;
        const itemCompare = a.itemName.localeCompare(b.itemName);
        if (itemCompare !== 0) return itemCompare;
        return a.unit.localeCompare(b.unit);
      });
  }, [stockReports]);

  const saleSummaryTotals = useMemo(
    () =>
      salePartySummary.reduce(
        (acc, party) => {
          acc.totalUnfixSale += party.totalUnfixSale;
          acc.totalFixSale += party.totalFixSale;
          acc.currentSaleStock += party.currentSaleStock;
          return acc;
        },
        {
          totalUnfixSale: 0,
          totalFixSale: 0,
          currentSaleStock: 0,
        }
      ),
    [salePartySummary]
  );

  const itemWiseSummary = useMemo(() => {
    const grouped = new Map<
      string,
      {
        itemId: number;
        itemName: string;
        unit: string;
        totalUnfixPurchase: number;
        totalFixPurchase: number;
        totalUnfixSale: number;
        totalFixSale: number;
        totalTransferOut: number;
        totalTransferReturn: number;
        currentStock: number;
      }
    >();

    stockReports.forEach((stock) => {
      const itemId = Number(stock.itemId) || 0;
      const unit = stock.unit ?? "";
      const key = [itemId, unit].join("|");
      const existing = grouped.get(key) ?? {
        itemId,
        itemName: stock.item?.name ?? "-",
        unit,
        totalUnfixPurchase: 0,
        totalFixPurchase: 0,
        totalUnfixSale: 0,
        totalFixSale: 0,
        totalTransferOut: 0,
        totalTransferReturn: 0,
        currentStock: 0,
      };

      existing.totalUnfixPurchase += Number(stock.totalUnfixPurchase) || 0;
      existing.totalFixPurchase += Number(stock.totalFixPurchase) || 0;
      existing.totalUnfixSale += Number(stock.totalUnfixSale) || 0;
      existing.totalFixSale += Number(stock.totalFixSale) || 0;
      existing.totalTransferOut += Number(stock.totalTransferOut) || 0;
      existing.totalTransferReturn += Number(stock.totalTransferReturn) || 0;
      existing.currentStock += Number(stock.currentStock) || 0;

      grouped.set(key, existing);
    });

    return Array.from(grouped.values())
      .filter(
        (row) =>
          row.totalUnfixPurchase > 0 ||
          row.totalFixPurchase > 0 ||
          row.totalUnfixSale > 0 ||
          row.totalFixSale > 0 ||
          row.totalTransferOut > 0 ||
          row.totalTransferReturn > 0
      )
      .sort((a, b) => {
        const itemCompare = a.itemName.localeCompare(b.itemName);
        if (itemCompare !== 0) return itemCompare;
        return a.unit.localeCompare(b.unit);
      });
  }, [stockReports]);
  const sellingStockColumnCount = 6;
  const sellingStockItemWise = useMemo(() => {
    return itemWiseSummary
      .map((item) => {
        const totalSaleStock =
          item.totalUnfixSale +
          item.totalTransferOut -
          item.totalFixSale -
          item.totalTransferReturn;
        return {
          itemId: item.itemId,
          itemName: item.itemName,
          unit: item.unit,
          currentStock: item.currentStock,
          totalSaleStock,
          sellingStock: item.currentStock - totalSaleStock,
        };
      })
      .filter(
        (item) =>
          item.currentStock !== 0 ||
          item.totalSaleStock !== 0 ||
          item.sellingStock !== 0
      );
  }, [itemWiseSummary]);
  const summaryTitle =
    summaryTab === "stock"
      ? "Stock Summary :"
      : summaryTab === "purchase"
        ? "Purchase Stock Summary"
        : "Customer Stock Summary";
  

  return (
    <>
      <PageMeta
        title="Stock Report"
        description="Stock Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Stock Report" />

      {/* Print Button */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-gray-300 bg-gray-50 p-2">
          <button
            type="button"
            onClick={() => setSummaryTab("stock")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              summaryTab === "stock"
                ? "border border-gray-300 bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:bg-white hover:text-gray-700"
            }`}
          >
            Stock Summary
          </button>
          <button
            type="button"
            onClick={() => setSummaryTab("purchase")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              summaryTab === "purchase"
                ? "border border-gray-300 bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:bg-white hover:text-gray-700"
            }`}
          >
            Purchase Stock Summary
          </button>
          <button
            type="button"
            onClick={() => setSummaryTab("sale")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              summaryTab === "sale"
                ? "border border-gray-300 bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:bg-white hover:text-gray-700"
            }`}
          >
            Customer Stock Summary
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="bg-red-400 text-white px-2 py-1 rounded-full hover:bg-red-700"
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
                    {summaryTab === "stock" && (
                      <h6 className="border border-gray-500 p-1 rounded text-sm font-semibold text-gray-800 dark:text-white/90 mt-5">
                          Stock Report
                      </h6>
                    )}
                  </div>
                </div>
              </div>

              {summaryTab === "stock" && (
                <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-5 gap-3 mb-4">
                  <div className="border border-gray-300 rounded p-2 text-center text-sm">
                    <p className="text-gray-500">Unfix Purchase</p>
                    <p className="font-semibold">{overall.totalUnfixPurchase.toFixed(2)}</p>
                  </div>
                  <div className="border border-gray-300 rounded p-2 text-center text-sm">
                    <p className="text-gray-500">Fix Purchase</p>
                    <p className="font-semibold">{overall.totalFixPurchase.toFixed(2)}</p>
                  </div>
                  <div className="border border-gray-300 rounded p-2 text-center text-sm">
                    <p className="text-gray-500">Unfix Sale</p>
                    <p className="font-semibold">{overall.totalUnfixSale.toFixed(2)}</p>
                  </div>
                  <div className="border border-gray-300 rounded p-2 text-center text-sm">
                    <p className="text-gray-500">Fix Sale</p>
                    <p className="font-semibold">{overall.totalFixSale.toFixed(2)}</p>
                  </div>
                  <div className="border border-gray-300 rounded p-2 text-center text-sm">
                    <p className="text-gray-500">Current Stock</p>
                    <p className="font-semibold">{overall.currentStock.toFixed(2)}</p>
                  </div>
                </div>
              )}
             
              <div className="mt-4">
                <div className={`flex flex-row items-center gap-5 xl:flex-row xl:justify-between mb-4 ${summaryTab === "stock" ? "text-left" : "text-center"}`}>
                  <div className={`flex flex-col w-full gap-1 ${summaryTab === "stock" ? "items-start" : "items-center"}`}>
                    <h6 className={`${summaryTab === "stock" ? "" : "border border-gray-500 p-1 rounded "}text-sm font-semibold text-gray-800 dark:text-white/90 mt-5`}>
                      {summaryTitle}
                    </h6>
                  </div>
                </div>

                {summaryTab === "stock" ? (
                  <Table>
                    <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                      <TableRow>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Sl</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Item</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Unit</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Unfix Purchase</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Fix Purchase</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Unfix Sale</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Fix Sale</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Current Stock</TableCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {status === "loading" ? (
                        <TableRow>
                          <TableCell colSpan={itemSummaryColumnCount} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                            Loading data...
                          </TableCell>
                        </TableRow>
                      ) : itemWiseSummary.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={itemSummaryColumnCount} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                            No item-wise summary found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        itemWiseSummary.map((item, index) => (
                          <TableRow key={`item-summary-${item.itemId}-${item.unit}`} className="border border-gray-500 dark:border-white/[0.05]">
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.itemName}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.unit?.toUpperCase() || "-"}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.totalUnfixPurchase.toFixed(2)}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.totalFixPurchase.toFixed(2)}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.totalUnfixSale.toFixed(2)}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.totalFixSale.toFixed(2)}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.currentStock.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                ) : summaryTab === "purchase" ? (
                  <Table>
                    <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                      <TableRow>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Sl</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Party</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Item</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Unit</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Unfix Purchase</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Fix Purchase</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Current Stock</TableCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {status === "loading" ? (
                        <TableRow>
                          <TableCell colSpan={purchaseSummaryColumnCount} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                            Loading data...
                          </TableCell>
                        </TableRow>
                      ) : purchasePartySummary.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={purchaseSummaryColumnCount} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                            No purchase stock summary found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        purchasePartySummary.map((party, index) => (
                          <TableRow key={`purchase-${party.partyId}`} className="border border-gray-500 dark:border-white/[0.05]">
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {party.partyName}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {party.itemName}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {party.unit?.toUpperCase() || "-"}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {party.totalUnfixPurchase.toFixed(2)}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {party.totalFixPurchase.toFixed(2)}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {(party.totalUnfixPurchase - party.totalFixPurchase).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                    {status !== "loading" && purchasePartySummary.length > 0 && (
                      <TableFooter className="border border-gray-500 bg-gray-100 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="border border-gray-500 px-2 py-1 text-center font-semibold"
                          >
                            Total
                          </TableCell>
                          <TableCell className="border border-gray-500 px-2 py-1 text-center font-semibold">
                            {purchaseSummaryTotals.totalUnfixPurchase.toFixed(2)}
                          </TableCell>
                          <TableCell className="border border-gray-500 px-2 py-1 text-center font-semibold">
                            {purchaseSummaryTotals.totalFixPurchase.toFixed(2)}
                          </TableCell>
                          <TableCell className="border border-gray-500 px-2 py-1 text-center font-semibold">
                            {(purchaseSummaryTotals.totalUnfixPurchase - purchaseSummaryTotals.totalFixPurchase).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    )}
                  </Table>
                ) : (
                  <Table>
                    <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                      <TableRow>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Sl</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Party</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Item</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Unit</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Unfix Sale</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Fix Sale</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Current Stock</TableCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {status === "loading" ? (
                        <TableRow>
                          <TableCell colSpan={saleSummaryColumnCount} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                            Loading data...
                          </TableCell>
                        </TableRow>
                      ) : salePartySummary.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={saleSummaryColumnCount} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                            No customer stock summary found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        salePartySummary.map((party, index) => (
                          <TableRow key={`sale-${party.partyId}`} className="border border-gray-500 dark:border-white/[0.05]">
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {party.partyName}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {party.itemName}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {party.unit?.toUpperCase() || "-"}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {party.totalUnfixSale.toFixed(2)}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {party.totalFixSale.toFixed(2)}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {party.currentSaleStock.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                    {status !== "loading" && salePartySummary.length > 0 && (
                      <TableFooter className="border border-gray-500 bg-gray-100 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="border border-gray-500 px-2 py-1 text-center font-semibold"
                          >
                            Total
                          </TableCell>
                          <TableCell className="border border-gray-500 px-2 py-1 text-center font-semibold">
                            {saleSummaryTotals.totalUnfixSale.toFixed(2)}
                          </TableCell>
                          <TableCell className="border border-gray-500 px-2 py-1 text-center font-semibold">
                            {saleSummaryTotals.totalFixSale.toFixed(2)}
                          </TableCell>
                          <TableCell className="border border-gray-500 px-2 py-1 text-center font-semibold">
                            {saleSummaryTotals.currentSaleStock.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    )}
                  </Table>
                )}
              </div>

              {summaryTab === "stock" && (
                <div className="mt-8">
                  <div className="flex flex-row items-center gap-5 xl:flex-row xl:justify-between mb-4 text-left">
                      <div className="flex flex-col items-start w-full gap-1">
                        <h6 className="text-sm font-semibold text-gray-800 dark:text-white/90 mt-5">
                            Selling Stock Item Wise :
                        </h6>
                      </div>
                    </div>

                  <Table>
                    <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                      <TableRow>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Sl</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Item</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Unit</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Selling Stock</TableCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {status === "loading" ? (
                        <TableRow>
                          <TableCell colSpan={sellingStockColumnCount} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                            Loading data...
                          </TableCell>
                        </TableRow>
                      ) : sellingStockItemWise.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={sellingStockColumnCount} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                            No selling stock found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        sellingStockItemWise.map((item, index) => (
                          <TableRow key={`selling-stock-${item.itemId}-${item.unit}`} className="border border-gray-500 dark:border-white/[0.05]">
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.itemName}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.unit?.toUpperCase() || "-"}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.sellingStock.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      
    </>
  );
}
