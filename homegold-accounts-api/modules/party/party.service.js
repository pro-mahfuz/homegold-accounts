
import { Ledger, Party, Stock, Payment, Category, sequelize } from "../../models/model.js";
import { Op } from "sequelize";

const normalizeReportAmount = (value) => {
  const normalizedValue = Number(value) || 0;
  if (Math.abs(normalizedValue) < 0.005) {
    return 0;
  }

  return Number(normalizedValue.toFixed(2));
};

const createEmptyReceivablePayableResponse = (message) => ({
  parties: [],
  totals: [],
  summary: {
    partyCount: 0,
    partiesWithBalance: 0,
    receivablePartyCount: 0,
    payablePartyCount: 0,
    currencies: 0,
    totalReceivableByCurrency: [],
    totalPayableByCurrency: [],
  },
  message,
});

const getReceivablePayableBusinessWhere = (req) => {
  const requestedBusinessId = Number(req?.query?.businessId) || 0;
  const authBusinessId = Number(req?.user?.businessId) || 0;
  const roleId = Number(req?.user?.roleId) || 0;

  if (roleId === 1 && requestedBusinessId > 0) {
    return { businessId: requestedBusinessId };
  }

  if (authBusinessId > 0) {
    return { businessId: authBusinessId };
  }

  if (requestedBusinessId > 0) {
    return { businessId: requestedBusinessId };
  }

  return {};
};

const createReceivablePayableSummaryBucket = (currency) => ({
  currency,
  stockDebitSum: 0,
  stockCreditSum: 0,
  paymentDebitSum: 0,
  paymentCreditSum: 0,
  advanceInSum: 0,
  advanceOutSum: 0,
  netBalance: 0,
});

const ensureReceivablePayableSummaryBucket = (collection, currency) => {
  if (!collection[currency]) {
    collection[currency] = createReceivablePayableSummaryBucket(currency);
  }

  return collection[currency];
};

export const getAllParty = async (type) => {
  try {
    if (!type) {
      throw { status: 400, message: "Type parameter is required" };
    }

    let parties;

    if (type === "all") {
      parties = await Party.findAll();
    } else {
      parties = await Party.findAll({
        where: { type }});
    }

    if (!parties || parties.length === 0) {
      throw { status: 404, message: "No parties found" };
    }
    return parties;
  } catch (err) {
    throw err;
  }
};

// export const getAllPartyWithPagination = async (
//   page = 1,
//   limit = 10,
//   type = "",
//   filterText = null
// ) => {
//   try {
//     page = Number(page) || 1;
//     limit = Number(limit) || 10;

//     const whereClause = {};
//     if (type && type !== "all") {
//       whereClause.type = { [Op.in]: Array.isArray(type) ? type : [type] };
//     }

//     if (filterText) {
//       whereClause[Op.or] = [
//         { name: { [Op.like]: `%${filterText}%` } },
//         { email: { [Op.like]: `%${filterText}%` } },
//         { phoneNumber: { [Op.like]: `%${filterText}%` } },
//       ];
//     }

//     const count = await Party.count({ where: whereClause });
//     const totalPages = Math.max(Math.ceil(count / limit), 1);
//     if (page > totalPages) page = totalPages;
//     const offset = (page - 1) * limit;

//     const rows = await Party.findAll({
//       where: whereClause,
//       include: [
//         { model: Ledger, as: "ledgers" },
//         { model: Stock, as: "stocks" },
//         { model: Payment, as: "payments" },
//       ],
//       limit,
//       offset,
//       order: [["id", "DESC"]],
//     });

//     if (!rows.length) {
//       throw { status: 404, message: "No parties found" };
//     }

//     // Totals grouped by currency
//     const totalsByCurrency = {};

//     const result = rows.map((party) => {
//       const mergedSummary = {};

//       // --- Process all ledgers once ---
//       (party.ledgers || []).forEach((l) => {
//         const currency = l.currency || "Unknown";
//         const stockCurrency = l.stockCurrency || "Unknown";

//         // --- STOCK TRANSACTIONS ---
//         if (["purchase", "stock_in", "sale", "stock_out"].includes(l.transactionType)) {
//           if (!mergedSummary[stockCurrency]) {
//             mergedSummary[stockCurrency] = {
//               currency: stockCurrency,
//               stockDebitSum: 0,
//               stockCreditSum: 0,
//               paymentDebitSum: 0,
//               paymentCreditSum: 0,
//               advanceInSum: 0,
//               advanceOutSum: 0,
//               netBalance: 0,
//             };
//           }

//           mergedSummary[stockCurrency].stockDebitSum += Number(l.debitQty) || 0;
//           mergedSummary[stockCurrency].stockCreditSum += Number(l.creditQty) || 0;
//         }

//         // --- PAYMENT TRANSACTIONS ---
//         if (["sale", "payment_in", "purchase", "payment_out"].includes(l.transactionType)) {
//           if (!mergedSummary[currency]) {
//             mergedSummary[currency] = {
//               currency,
//               stockDebitSum: 0,
//               stockCreditSum: 0,
//               paymentDebitSum: 0,
//               paymentCreditSum: 0,
//               advanceInSum: 0,
//               advanceOutSum: 0,
//               netBalance: 0,
//             };
//           }

//           mergedSummary[currency].paymentCreditSum += Number(l.credit) || 0;
//           mergedSummary[currency].paymentDebitSum += Number(l.debit) || 0;
//         }

//         // --- ADVANCE, PAYABLE & RECEIVABLE TRANSACTIONS ---
//         if (["advance_received", "advance_payment_deduct", "payable"].includes(l.transactionType)) {
//           if (!mergedSummary[currency]) {
//             mergedSummary[currency] = {
//               currency,
//               stockDebitSum: 0,
//               stockCreditSum: 0,
//               paymentDebitSum: 0,
//               paymentCreditSum: 0,
//               advanceInSum: 0,
//               advanceOutSum: 0,
//               netBalance: 0,
//             };
//           }
//           mergedSummary[currency].advanceInSum += Number(l.credit) || 0;
//         }

//         if (["advance_payment", "advance_received_deduct", "receivable"].includes(l.transactionType)) {
//           if (!mergedSummary[currency]) {
//             mergedSummary[currency] = {
//               currency,
//               stockDebitSum: 0,
//               stockCreditSum: 0,
//               paymentDebitSum: 0,
//               paymentCreditSum: 0,
//               advanceInSum: 0,
//               advanceOutSum: 0,
//               netBalance: 0,
//             };
//           }
//           mergedSummary[currency].advanceOutSum += Number(l.debit) || 0;
//         }
//       });

//       // --- Calculate net balances per currency ---
//       Object.values(mergedSummary).forEach((s) => {
//         s.netBalance =
//           (s.advanceInSum - s.advanceOutSum) +
//           (s.paymentCreditSum - s.paymentDebitSum) +
//           (s.stockDebitSum - s.stockCreditSum);

//         // --- Update overall totals ---
//         if (!totalsByCurrency[s.currency]) {
//           totalsByCurrency[s.currency] = {
//             currency: s.currency,
//             receivable: 0,
//             payable: 0,
//           };
//         }

//         if (s.netBalance < 0) {
//           totalsByCurrency[s.currency].receivable += s.netBalance;
//         } else {
//           totalsByCurrency[s.currency].payable += s.netBalance;
//         }
//       });

//       return {
//         ...party.toJSON(),
//         summaryByCurrency: Object.values(mergedSummary),
//       };
//     });

//     return {
//       success: true,
//       totalItems: count,
//       totalPages,
//       currentPage: page,
//       parties: result,
//     };
//   } catch (err) {
//     throw err;
//   }
// };

export const getAllPartyWithPagination = async (page = 1, limit = 10, type = "", filterText = null) => {
  try {
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const offset = (page - 1) * limit;

    const totalsByCurrency = {}; // <-- define this

    const whereClause = {};
    whereClause.isActive = true;
    const isSingleParty = filterText !== null && filterText !== undefined && filterText > 0;

    if (isSingleParty) {
      whereClause.id = Number(filterText); // ensure number
    }

    if (type && type !== "all") {
      whereClause.type = Array.isArray(type) ? { [Op.in]: type } : { [Op.in]: [type] };
    }

    // Count total items
    let totalItems = 1;
    if (!isSingleParty) {
      totalItems = await Party.count({ where: whereClause });
    }

    const totalPages = isSingleParty ? 1 : Math.max(Math.ceil(totalItems / limit), 1);

    const parties = await Party.findAll({
      where: whereClause,
      // include: [
      //   { model: Ledger, as: "ledgers" },
      //   { model: Stock, as: "stocks" },
      //   { model: Payment, as: "payments" },
      // ],
      limit: isSingleParty ? undefined : limit,
      offset: isSingleParty ? undefined : offset,
      order: [["id", "DESC"]],
    });

    if (!parties || parties.length === 0) {
      return { success: true, totalItems, totalPages, currentPage: page, parties: [] };
    }

    // const result = parties.map((party) => {
    //   const mergedSummary = {};

    //   (party.ledgers || []).forEach((l) => {
    //     const currency = l.currency || "Unknown";
    //     const stockCurrency = l.stockCurrency || "Unknown";

    //     // STOCK
    //     if (["purchase", "stock_in", "sale", "stock_out"].includes(l.transactionType)) {
    //       if (!mergedSummary[stockCurrency]) mergedSummary[stockCurrency] = { currency: stockCurrency, stockDebitSum: 0, stockCreditSum: 0, paymentDebitSum: 0, paymentCreditSum: 0, advanceInSum: 0, advanceOutSum: 0, netBalance: 0 };
    //       mergedSummary[stockCurrency].stockDebitSum += Number(l.debitQty) || 0;
    //       mergedSummary[stockCurrency].stockCreditSum += Number(l.creditQty) || 0;
    //     }

    //     // PAYMENT
    //     if (["sale", "payment_in", "purchase", "payment_out"].includes(l.transactionType)) {
    //       if (!mergedSummary[currency]) mergedSummary[currency] = { currency, stockDebitSum: 0, stockCreditSum: 0, paymentDebitSum: 0, paymentCreditSum: 0, advanceInSum: 0, advanceOutSum: 0, netBalance: 0 };
    //       mergedSummary[currency].paymentCreditSum += Number(l.credit) || 0;
    //       mergedSummary[currency].paymentDebitSum += Number(l.debit) || 0;
    //     }

    //     // ADVANCE / PAYABLE / RECEIVABLE
    //     if (["advance_received", "advance_payment_deduct", "payable"].includes(l.transactionType)) {
    //       if (!mergedSummary[currency]) mergedSummary[currency] = { currency, stockDebitSum: 0, stockCreditSum: 0, paymentDebitSum: 0, paymentCreditSum: 0, advanceInSum: 0, advanceOutSum: 0, netBalance: 0 };
    //       mergedSummary[currency].advanceInSum += Number(l.credit) || 0;
    //     }
    //     if (["advance_payment", "advance_received_deduct", "receivable"].includes(l.transactionType)) {
    //       if (!mergedSummary[currency]) mergedSummary[currency] = { currency, stockDebitSum: 0, stockCreditSum: 0, paymentDebitSum: 0, paymentCreditSum: 0, advanceInSum: 0, advanceOutSum: 0, netBalance: 0 };
    //       mergedSummary[currency].advanceOutSum += Number(l.debit) || 0;
    //     }
    //   });

    //   // Calculate net balances
    //   Object.values(mergedSummary).forEach((s) => {
    //     s.netBalance = (s.advanceInSum - s.advanceOutSum) + (s.paymentCreditSum - s.paymentDebitSum) + (s.stockDebitSum - s.stockCreditSum);

    //     if (!totalsByCurrency[s.currency]) totalsByCurrency[s.currency] = { currency: s.currency, receivable: 0, payable: 0 };
    //     if (s.netBalance < 0) totalsByCurrency[s.currency].receivable += s.netBalance;
    //     else totalsByCurrency[s.currency].payable += s.netBalance;
    //   });

    //   return { ...party.toJSON(), summaryByCurrency: Object.values(mergedSummary) };
    // });

    return { success: true, totalItems, totalPages, currentPage: page, parties: parties };
  } catch (err) {
    console.error("Error in getAllPartyWithPagination:", err);
    throw err;
  }
};

// export const getReceivablePayable = async () => {
//   try {
//     const parties = await Party.findAll({
//       include: [
//         { model: Ledger, as: "ledgers" },
//         { model: Stock, as: "stocks" },
//         { model: Payment, as: "payments" },
//       ],
//     });

//     if (!parties || parties.length === 0) {
//       return { parties: [], totals: [], message: "No parties found" };
//     }

//     // Totals grouped by currency
//     const totalsByCurrency = {};

//     const result = parties.map((party) => {
//       const mergedSummary = {};

//       // --- Process all ledgers once ---
//       (party.ledgers || []).forEach((l) => {
//         const currency = l.currency || "Unknown";
//         const stockCurrency = l.stockCurrency || "Unknown";

//         // --- STOCK TRANSACTIONS ---
//         if (["purchase", "stock_in", "sale", "stock_out"].includes(l.transactionType)) {
//           if (!mergedSummary[stockCurrency]) {
//             mergedSummary[stockCurrency] = {
//               currency: stockCurrency,
//               stockDebitSum: 0,
//               stockCreditSum: 0,
//               paymentDebitSum: 0,
//               paymentCreditSum: 0,
//               advanceInSum: 0,
//               advanceOutSum: 0,
//               netBalance: 0,
//             };
//           }

//           mergedSummary[stockCurrency].stockDebitSum += Number(l.debitQty) || 0;
//           mergedSummary[stockCurrency].stockCreditSum += Number(l.creditQty) || 0;
//         }

//         // --- PAYMENT TRANSACTIONS ---
//         if (["sale", "payment_in", "purchase", "payment_out"].includes(l.transactionType)) {
//           if (!mergedSummary[currency]) {
//             mergedSummary[currency] = {
//               currency,
//               stockDebitSum: 0,
//               stockCreditSum: 0,
//               paymentDebitSum: 0,
//               paymentCreditSum: 0,
//               advanceInSum: 0,
//               advanceOutSum: 0,
//               netBalance: 0,
//             };
//           }

//           mergedSummary[currency].paymentCreditSum += Number(l.credit) || 0;
//           mergedSummary[currency].paymentDebitSum += Number(l.debit) || 0;
//         }

//         // --- ADVANCE TRANSACTIONS ---
//         if (["advance_received", "advance_payment_deduct", "payable"].includes(l.transactionType)) {
//           if (!mergedSummary[currency]) {
//             mergedSummary[currency] = {
//               currency,
//               stockDebitSum: 0,
//               stockCreditSum: 0,
//               paymentDebitSum: 0,
//               paymentCreditSum: 0,
//               advanceInSum: 0,
//               advanceOutSum: 0,
//               netBalance: 0,
//             };
//           }
//           mergedSummary[currency].advanceInSum += Number(l.credit) || 0;
//         }

//         if (["advance_payment", "advance_received_deduct", "receivable"].includes(l.transactionType)) {
//           if (!mergedSummary[currency]) {
//             mergedSummary[currency] = {
//               currency,
//               stockDebitSum: 0,
//               stockCreditSum: 0,
//               paymentDebitSum: 0,
//               paymentCreditSum: 0,
//               advanceInSum: 0,
//               advanceOutSum: 0,
//               netBalance: 0,
//             };
//           }
//           mergedSummary[currency].advanceOutSum += Number(l.debit) || 0;
//         }
//       });

//       // --- Calculate net balances per currency ---
//       Object.values(mergedSummary).forEach((s) => {
//         s.netBalance =
//           (s.advanceInSum - s.advanceOutSum) +
//           (s.paymentCreditSum - s.paymentDebitSum) +
//           (s.stockDebitSum - s.stockCreditSum);

//         // --- Update overall totals ---
//         if (!totalsByCurrency[s.currency]) {
//           totalsByCurrency[s.currency] = {
//             currency: s.currency,
//             receivable: 0,
//             payable: 0,
//           };
//         }

//         if (s.netBalance < 0) {
//           totalsByCurrency[s.currency].receivable += s.netBalance;
//         } else {
//           totalsByCurrency[s.currency].payable += s.netBalance;
//         }
//       });

//       return {
//         ...party.toJSON(),
//         summaryByCurrency: Object.values(mergedSummary),
//       };
//     });

//     // Convert totals object to array
//     const totals = Object.values(totalsByCurrency);

//     return {
//       parties: result,
//       totals,
//       message: "Receivable and Payable summary calculated successfully",
//     };
//   } catch (err) {
//     console.error("Error in getReceivablePayable:", err);
//     return { parties: [], totals: [], message: "Internal Server Error" };
//   }
// };

export const getReceivablePayable = async (req = null) => {
  try {
    const businessWhere = getReceivablePayableBusinessWhere(req);
    const ledgers = await Ledger.findAll({
      where: {
        partyId: {
          [Op.not]: null,
        },
        isDeleted: false,
        ...businessWhere,
      },
      include: [
        {
          model: Party,
          as: "party",
          required: true,
          where: businessWhere,
        },
      ],
      order: [
        ["partyId", "ASC"],
        ["date", "ASC"],
        ["id", "ASC"],
      ],
    });

    if (!ledgers || ledgers.length === 0) {
      return createEmptyReceivablePayableResponse("No ledger data found");
    }

    const partiesById = {};
    const totalsByCurrency = {};

    ledgers.forEach((ledger) => {
      const partyId = Number(ledger.partyId) || 0;
      const party = ledger.party?.toJSON?.() || null;

      if (!partyId || !party) {
        return;
      }

      if (!partiesById[partyId]) {
        partiesById[partyId] = {
          ...party,
          summaryMap: {},
        };
      }

      const summaryMap = partiesById[partyId].summaryMap;
      const currency = ledger.currency || "Unknown";
      const stockCurrency = ledger.stockCurrency || currency;
      const debit = Number(ledger.debit) || 0;
      const credit = Number(ledger.credit) || 0;
      const debitQty = Number(ledger.debitQty) || 0;
      const creditQty = Number(ledger.creditQty) || 0;
      const hasMoneyEntry = Math.abs(debit) >= 0.005 || Math.abs(credit) >= 0.005;
      const hasStockEntry = Math.abs(debitQty) >= 0.005 || Math.abs(creditQty) >= 0.005;

      if (hasMoneyEntry) {
        const summary = ensureReceivablePayableSummaryBucket(summaryMap, currency);
        summary.paymentDebitSum += debit;
        summary.paymentCreditSum += credit;
      }

      if (hasStockEntry) {
        const summary = ensureReceivablePayableSummaryBucket(summaryMap, stockCurrency);
        summary.stockDebitSum += debitQty;
        summary.stockCreditSum += creditQty;
      }
    });

    const result = Object.values(partiesById).map((party) => {
      const summaryByCurrency = Object.values(party.summaryMap)
        .map((summary) => {
          const stockDebitSum = normalizeReportAmount(summary.stockDebitSum);
          const stockCreditSum = normalizeReportAmount(summary.stockCreditSum);
          const paymentDebitSum = normalizeReportAmount(summary.paymentDebitSum);
          const paymentCreditSum = normalizeReportAmount(summary.paymentCreditSum);
          const advanceInSum = normalizeReportAmount(summary.advanceInSum);
          const advanceOutSum = normalizeReportAmount(summary.advanceOutSum);

          const stockNet = normalizeReportAmount(stockCreditSum - stockDebitSum);
          const paymentNet = normalizeReportAmount(paymentDebitSum - paymentCreditSum);
          const stockReceivable = stockNet > 0 ? stockNet : 0;
          const stockPayable = stockNet < 0 ? Math.abs(stockNet) : 0;
          const paymentReceivable = paymentNet < 0 ? Math.abs(paymentNet) : 0;
          const paymentPayable = paymentNet > 0 ? paymentNet : 0;
          const advanceNet = normalizeReportAmount(advanceInSum - advanceOutSum);
          const receivable = normalizeReportAmount(stockReceivable + paymentReceivable);
          const payable = normalizeReportAmount(stockPayable + paymentPayable);
          const netBalance = normalizeReportAmount(payable - receivable);

          return {
            currency: summary.currency,
            stockDebitSum,
            stockCreditSum,
            paymentDebitSum,
            paymentCreditSum,
            advanceInSum,
            advanceOutSum,
            stockNet,
            paymentNet,
            advanceNet,
            stockReceivable,
            stockPayable,
            paymentReceivable,
            paymentPayable,
            netBalance,
            receivable,
            payable,
          };
        })
        .filter((summary) =>
          [
            summary.stockDebitSum,
            summary.stockCreditSum,
            summary.paymentDebitSum,
            summary.paymentCreditSum,
            summary.advanceInSum,
            summary.advanceOutSum,
            summary.receivable,
            summary.payable,
          ].some((value) => Math.abs(Number(value) || 0) >= 0.005)
        )
        .sort((a, b) => a.currency.localeCompare(b.currency));

      summaryByCurrency.forEach((summary) => {
        if (!totalsByCurrency[summary.currency]) {
          totalsByCurrency[summary.currency] = createReceivablePayableSummaryBucket(
            summary.currency
          );
          totalsByCurrency[summary.currency].stockNet = 0;
          totalsByCurrency[summary.currency].paymentNet = 0;
          totalsByCurrency[summary.currency].advanceNet = 0;
          totalsByCurrency[summary.currency].stockReceivable = 0;
          totalsByCurrency[summary.currency].stockPayable = 0;
          totalsByCurrency[summary.currency].paymentReceivable = 0;
          totalsByCurrency[summary.currency].paymentPayable = 0;
          totalsByCurrency[summary.currency].receivable = 0;
          totalsByCurrency[summary.currency].payable = 0;
        }

        const total = totalsByCurrency[summary.currency];
        total.stockDebitSum = normalizeReportAmount(total.stockDebitSum + summary.stockDebitSum);
        total.stockCreditSum = normalizeReportAmount(total.stockCreditSum + summary.stockCreditSum);
        total.paymentDebitSum = normalizeReportAmount(total.paymentDebitSum + summary.paymentDebitSum);
        total.paymentCreditSum = normalizeReportAmount(total.paymentCreditSum + summary.paymentCreditSum);
        total.advanceInSum = normalizeReportAmount(total.advanceInSum + summary.advanceInSum);
        total.advanceOutSum = normalizeReportAmount(total.advanceOutSum + summary.advanceOutSum);
        total.stockNet = normalizeReportAmount(total.stockNet + summary.stockNet);
        total.paymentNet = normalizeReportAmount(total.paymentNet + summary.paymentNet);
        total.advanceNet = normalizeReportAmount(total.advanceNet + summary.advanceNet);
        total.stockReceivable = normalizeReportAmount(total.stockReceivable + (summary.stockReceivable || 0));
        total.stockPayable = normalizeReportAmount(total.stockPayable + (summary.stockPayable || 0));
        total.paymentReceivable = normalizeReportAmount(total.paymentReceivable + (summary.paymentReceivable || 0));
        total.paymentPayable = normalizeReportAmount(total.paymentPayable + (summary.paymentPayable || 0));
        total.netBalance = normalizeReportAmount(total.netBalance + summary.netBalance);
        total.receivable = normalizeReportAmount(total.receivable + summary.receivable);
        total.payable = normalizeReportAmount(total.payable + summary.payable);
      });

      const receivableByCurrency = summaryByCurrency
        .filter((summary) => summary.receivable > 0)
        .map((summary) => ({
          currency: summary.currency,
          amount: summary.receivable,
        }));

      const payableByCurrency = summaryByCurrency
        .filter((summary) => summary.payable > 0)
        .map((summary) => ({
          currency: summary.currency,
          amount: summary.payable,
        }));

      const { summaryMap, ...partyData } = party;

      return {
        ...partyData,
        summaryByCurrency,
        receivableByCurrency,
        payableByCurrency,
      };
    });

    const totals = Object.values(totalsByCurrency).sort((a, b) =>
      a.currency.localeCompare(b.currency)
    );

    const partiesWithBalance = result.filter((party) =>
      (party.summaryByCurrency || []).some(
        (summary) => summary.receivable > 0 || summary.payable > 0
      )
    );

    return {
      parties: result,
      totals,
      summary: {
        partyCount: result.length,
        partiesWithBalance: partiesWithBalance.length,
        receivablePartyCount: partiesWithBalance.filter(
          (party) => (party.receivableByCurrency || []).length > 0
        ).length,
        payablePartyCount: partiesWithBalance.filter(
          (party) => (party.payableByCurrency || []).length > 0
        ).length,
        currencies: totals.length,
        totalReceivableByCurrency: totals
          .filter((total) => total.receivable > 0)
          .map((total) => ({
            currency: total.currency,
            amount: total.receivable,
          })),
        totalPayableByCurrency: totals
          .filter((total) => total.payable > 0)
          .map((total) => ({
            currency: total.currency,
            amount: total.payable,
          })),
      },
      message: "Receivable and Payable summary calculated successfully",
    };
  } catch (err) {
    console.error("Error in getReceivablePayable:", err);
    return createEmptyReceivablePayableResponse("Internal Server Error");
  }
};




export const createParty = async (req) => {
  const allowedTypes = ["party", "customer", "supplier"];
  const payload = {
    ...req.body,
    type: allowedTypes.includes(req.body?.type) ? req.body.type : "party",
  };

  const party = await Party.create(payload);
  return party;
}

export const getPartyById = async (id) => {
  const party = await Party.findByPk(id);
  if (!party) {
      throw { status: 404, message: "Party not found" };
  }
  return party;
}

export const updateParty = async (id, req) => {
  const party = await Party.findByPk(id);
  if (!party) {
      throw { status: 404, message: "Party not found" };
  }

  await party.update(req.body);
  return party;
}

export const activeParty = async (id) => {
  const party = await Party.findByPk(id);
  if (!party) {
      throw { status: 404, message: "Party not found" };
  }

  party.isActive = true; // Set Party as active
  await Party.save();
  return party;
}

export const deactiveParty = async (id) => {
  const party = await Party.findByPk(id);
  if (!party) {
      throw { status: 404, message: "Party not found" };
  }

  party.isActive = false; // Set Party as inactive
  await party.save();
  return party;
}
