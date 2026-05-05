
import { Ledger, Party, Stock, Payment, Category, sequelize } from "../../models/model.js";
import { Op } from "sequelize";

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

export const getReceivablePayable = async () => {
  try {
    const parties = await Party.findAll({
      include: [{ model: Ledger, as: "ledgers" }],
    });

    if (!parties || parties.length === 0) {
      return { parties: [], totals: [], message: "No parties found" };
    }

    const totalsByCurrency = {};

    const result = parties.map((party) => {
      const mergedSummary = {};

      (party.ledgers || []).forEach((l) => {
        const currency = l.currency || "Unknown";
        const stockCurrency = l.stockCurrency || currency;

        // Helper to initialize object
        const ensureCurrency = (key) => {
          if (!mergedSummary[key]) {
            mergedSummary[key] = {
              currency: key,
              stockDebitSum: 0,
              stockCreditSum: 0,
              paymentDebitSum: 0,
              paymentCreditSum: 0,
              advanceInSum: 0,
              advanceOutSum: 0,
              netBalance: 0,
            };
          }
        };

        // --- Define transaction groups ---
        const stockTransactions = [
          "purchase",
          "wholesale_purchase",
          "fix_purchase",
          "unfix_purchase",
          "sale",
          "wholesale_sale",
          "fix_sale",
          "unfix_sale",
          "stock_in",
          "stock_out",
        ];

        const paymentTransactions = [
          "payment_in",
          "payment_out",
          "purchase",
          "wholesale_purchase",
          "fix_purchase",
          "unfix_purchase",
          "sale",
          "wholesale_sale",
          "fix_sale",
          "unfix_sale",
        ];

        const advanceInTransactions = [
          "advance_received",
          "advance_payment_deduct",
          "payable",
        ];

        const advanceOutTransactions = [
          "advance_payment",
          "advance_received_deduct",
          "receivable",
        ];

        // --- STOCK TRANSACTIONS ---
        if (stockTransactions.includes(l.transactionType)) {
          ensureCurrency(stockCurrency);

          mergedSummary[stockCurrency].stockDebitSum += Number(l.debitQty) || 0;
          mergedSummary[stockCurrency].stockCreditSum += Number(l.creditQty) || 0;
        }

        // --- PAYMENT TRANSACTIONS ---
        if (paymentTransactions.includes(l.transactionType)) {
          ensureCurrency(currency);

          mergedSummary[currency].paymentCreditSum += Number(l.credit) || 0;
          mergedSummary[currency].paymentDebitSum += Number(l.debit) || 0;
        }

        // --- ADVANCE TRANSACTIONS ---
        if (advanceInTransactions.includes(l.transactionType)) {
          ensureCurrency(currency);
          mergedSummary[currency].advanceInSum += Number(l.credit) || 0;
        }

        if (advanceOutTransactions.includes(l.transactionType)) {
          ensureCurrency(currency);
          mergedSummary[currency].advanceOutSum += Number(l.debit) || 0;
        }
      });

      // --- Calculate net balances per currency ---
      Object.values(mergedSummary).forEach((s) => {
        s.netBalance =
          (s.advanceInSum - s.advanceOutSum) +
          (s.paymentCreditSum - s.paymentDebitSum) +
          (s.stockDebitSum - s.stockCreditSum);

        if (!totalsByCurrency[s.currency]) {
          totalsByCurrency[s.currency] = {
            currency: s.currency,
            stockDebitSum: 0,
            stockCreditSum: 0,
            paymentDebitSum: 0,
            paymentCreditSum: 0,
            advanceInSum: 0,
            advanceOutSum: 0,
            receivable: 0,
            payable: 0,
            netBalance: 0,
          };
        }

        // Aggregate totals
        const t = totalsByCurrency[s.currency];
        t.stockDebitSum += s.stockDebitSum;
        t.stockCreditSum += s.stockCreditSum;
        t.paymentDebitSum += s.paymentDebitSum;
        t.paymentCreditSum += s.paymentCreditSum;
        t.advanceInSum += s.advanceInSum;
        t.advanceOutSum += s.advanceOutSum;
        t.netBalance += s.netBalance;

        if (s.netBalance < 0) t.receivable += s.netBalance;
        else t.payable += s.netBalance;
      });

      return {
        ...party.toJSON(),
        summaryByCurrency: Object.values(mergedSummary),
      };
    });

    const totals = Object.values(totalsByCurrency).sort((a, b) =>
      a.currency.localeCompare(b.currency)
    );

    return {
      parties: result,
      totals,
      message: "Receivable and Payable summary calculated successfully",
    };
  } catch (err) {
    console.error("Error in getReceivablePayable:", err);
    return { parties: [], totals: [], message: "Internal Server Error" };
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
