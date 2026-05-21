
import { Ledger, Party, Stock, Payment, Category } from "../../models/model.js";
import { Op } from "sequelize";

const getLedgerIncomingPaymentAmount = (ledger) => {
  const transactionType = String(ledger.transactionType || "").toLowerCase();
  return transactionType === "payment_in"
    ? Number(ledger.debit) || 0
    : Number(ledger.credit) || 0;
};

const getLedgerOutgoingPaymentAmount = (ledger) => {
  const transactionType = String(ledger.transactionType || "").toLowerCase();
  return transactionType === "payment_in" ? 0 : Number(ledger.debit) || 0;
};

export const getAllParty = async (type) => {
  try {

    

    if (!type) {
      throw { status: 400, message: "Type parameter is required" };
    }

    let parties;

    if (type === "all") {
      parties = await Party.findAll();
      console.log("parties=", parties.length);
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

export const getAllPartyWithPagination = async (
  page = 1,
  limit = 10,
  type = "",
  filterText = null
) => {
  try {
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const whereClause = {};
    if (type && type !== "all") {
      whereClause.type = { [Op.in]: Array.isArray(type) ? type : [type] };
    }

    if (filterText) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${filterText}%` } },
        { email: { [Op.like]: `%${filterText}%` } },
        { phoneNumber: { [Op.like]: `%${filterText}%` } },
      ];
    }

    const count = await Party.count({ where: whereClause });
    const totalPages = Math.max(Math.ceil(count / limit), 1);
    if (page > totalPages) page = totalPages;
    const offset = (page - 1) * limit;

    const rows = await Party.findAll({
      where: whereClause,
      include: [
        { model: Ledger, as: "ledgers" },
        { model: Stock, as: "stocks" },
        { model: Payment, as: "payments" },
      ],
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    if (!rows.length) {
      throw { status: 404, message: "No parties found" };
    }

    const result = rows.map((party) => {
      // --- STOCK summary ---
      const stockGrouped = (party.ledgers || []).reduce((acc, s) => {
        const currency = s.stockCurrency || "Unknown";
        if (!acc[currency]) acc[currency] = { currency, stockInSum: 0, stockOutSum: 0 };

        if (
          ["purchase", "stock_in", "sale", "stock_out", "fix_purchase", "unfix_purchase", "wholesale_purchase", "fix_sale", "unfix_sale", "unfix_sale_transter", "unfix_transter", "wholesale_sale"]
            .includes(s.transactionType)
        ) {
          acc[currency].stockInSum += Number(s.debitQty) || 0;
          acc[currency].stockOutSum += Number(s.creditQty) || 0;
        }

        return acc;
      }, {});
      const stockSummary = Object.values(stockGrouped);

      // --- PAYMENT summary ---
      const paymentGrouped = (party.ledgers || []).reduce((acc, p) => {
        const currency = p.currency || "Unknown";
        if (!acc[currency]) acc[currency] = { currency, paymentInSum: 0, paymentOutSum: 0 };

        if (
          ["purchase", "payment_in", "sale", "payment_out", "fix_purchase", "unfix_purchase", "wholesale_purchase", "fix_sale", "unfix_sale", "unfix_sale_transter", "unfix_transter", "wholesale_sale"]
            .includes(p.transactionType)
        ) {
          acc[currency].paymentInSum += getLedgerIncomingPaymentAmount(p);
          acc[currency].paymentOutSum += getLedgerOutgoingPaymentAmount(p);
        }

        return acc;
      }, {});
      const paymentSummary = Object.values(paymentGrouped);

      // --- ADVANCE summary ---
      const advanceGrouped = (party.ledgers || []).reduce((acc, a) => {
        const currency = a.currency || "Unknown";
        if (!acc[currency]) acc[currency] = { currency, advanceInSum: 0, advanceOutSum: 0 };

        if (["advance_received", "advance_payment_deduct"].includes(a.transactionType)) {
          acc[currency].advanceInSum += Number(a.credit) || 0;
        }
        if (["advance_payment", "advance_received_deduct"].includes(a.transactionType)) {
          acc[currency].advanceOutSum += Number(a.debit) || 0;
        }

        return acc;
      }, {});
      const advanceSummary = Object.values(advanceGrouped);

      return {
        ...party.toJSON(),
        stockSummary,
        paymentSummary,
        advanceSummary,
      };
    });

    return {
      success: true,
      totalItems: count,
      totalPages,
      currentPage: page,
      parties: result,
    };
  } catch (err) {
    throw err;
  }
};

export const getReceivablePayable = async () => {
  try {
    const parties = await Party.findAll({
      include: [
        { model: Ledger, as: "ledgers" },
        { model: Stock, as: "stocks" },
        { model: Payment, as: "payments" },
      ],
    });

    const categories = await Category.findAll();

    if (!parties || parties.length === 0) {
      return { parties: [], totals: [], message: "No parties found" };
    }

    // Totals grouped by currency
    const totalsByCurrency = {};

    const result = parties.map((party) => {
      // --- STOCK ---
      const stockReceivableSummary = Object.values(
        (party.ledgers || []).reduce((acc, s) => {
          const currency = s.currency || "Unknown";
          if (!acc[currency]) acc[currency] = { currency, stockDebitSum: 0, stockCreditSum: 0, stockReceivable: 0 };
          if (["purchase", "stock_in"].includes(s.transactionType)) {
            acc[currency].stockDebitSum += Number(s.debitQty) || 0;
            acc[currency].stockCreditSum += Number(s.creditQty) || 0;
            acc[currency].stockReceivable += (Number(s.debitQty) - Number(s.creditQty)) || 0;
          }
          return acc;
        }, {})
      );

      const stockPayableSummary = Object.values(
        (party.ledgers || []).reduce((acc, s) => {
          const currency = s.currency || "Unknown";
          if (!acc[currency]) acc[currency] = { currency, stockDebitSum: 0, stockCreditSum: 0, stockPayable: 0 };
          if (["sale", "stock_out"].includes(s.transactionType)) {
            acc[currency].stockDebitSum += Number(s.debitQty) || 0;
            acc[currency].stockCreditSum += Number(s.creditQty) || 0;
            acc[currency].stockPayable += (Number(s.debitQty) - Number(s.creditQty)) || 0;
          }
          return acc;
        }, {})
      );

      // --- PAYMENT ---
      const paymentReceivableSummary = Object.values(
        (party.ledgers || []).reduce((acc, p) => {
          const currency = p.currency || "Unknown";
          if (!acc[currency]) acc[currency] = { currency, paymentCreditSum: 0, paymentDebitSum: 0, paymentReceivable: 0 };
          if (["sale", "payment_in"].includes(p.transactionType)) {
            const incomingAmount = getLedgerIncomingPaymentAmount(p);
            const outgoingAmount = getLedgerOutgoingPaymentAmount(p);
            acc[currency].paymentCreditSum += incomingAmount;
            acc[currency].paymentDebitSum += outgoingAmount;
            acc[currency].paymentReceivable += incomingAmount - outgoingAmount;
          }
          return acc;
        }, {})
      );

      const paymentPayableSummary = Object.values(
        (party.ledgers || []).reduce((acc, p) => {
          const currency = p.currency || "Unknown";
          if (!acc[currency]) acc[currency] = { currency, paymentCreditSum: 0, paymentDebitSum: 0, paymentPayable: 0 };
          if (["purchase", "payment_out"].includes(p.transactionType)) {
            const incomingAmount = getLedgerIncomingPaymentAmount(p);
            const outgoingAmount = getLedgerOutgoingPaymentAmount(p);
            acc[currency].paymentCreditSum += incomingAmount;
            acc[currency].paymentDebitSum += outgoingAmount;
            acc[currency].paymentPayable += incomingAmount - outgoingAmount;
          }
          return acc;
        }, {})
      );

      // --- ADVANCE ---
      const advanceSummary = Object.values(
        (party.ledgers || []).reduce((acc, a) => {
          const currency = a.currency || "Unknown";
          if (!acc[currency]) acc[currency] = { currency, advanceInSum: 0, advanceOutSum: 0 };
          if (["advance_received", "advance_payment_deduct"].includes(a.transactionType)) {
            acc[currency].advanceInSum += Number(a.credit) || 0;
          }
          if (["advance_payment", "advance_received_deduct"].includes(a.transactionType)) {
            acc[currency].advanceOutSum += Number(a.debit) || 0;
          }
          return acc;
        }, {})
      );

      // --- Receivable & Payable per currency ---


      const receivableMap = {};
      const payableMap = {};

      const processBalance = (currency, balance) => {
        totalsByCurrency[currency] = totalsByCurrency[currency] || { receivable: 0, payable: 0 };
        if (balance < 0) {
          receivableMap[currency] = (receivableMap[currency] || 0) + balance;
          totalsByCurrency[currency].receivable += balance;
        } else if (balance > 0) {
          const absBalance = Math.abs(balance);
          payableMap[currency] = (payableMap[currency] || 0) + absBalance;
          totalsByCurrency[currency].payable += absBalance;
        }
      };

      // Process payments, advances, stock
      paymentReceivableSummary.forEach((s) => processBalance(s.currency || "Unknown", s.paymentReceivable));
      paymentPayableSummary.forEach((s) => processBalance(s.currency || "Unknown", s.paymentPayable)); 
      advanceSummary.forEach((s) => processBalance(s.currency || "Unknown", Number(s.advanceInSum || 0) - Number(s.advanceOutSum || 0)));

      // Find if this party has stocks with category "currency" or "gold"
      const hasCurrencyOrGoldStock = (party.stocks || []).some(
        (stock) => ["currency", "gold"].includes(stock.category?.toLowerCase())
      );

      if (hasCurrencyOrGoldStock) {
        stockReceivableSummary.forEach((s) =>
          processBalance(s.currency || "Unknown", s.stockReceivable)
        );
        stockPayableSummary.forEach((s) =>
          processBalance(s.currency || "Unknown", s.stockPayable)
        );
      }
      

      // Convert maps → arrays
      const receivableByCurrency = Object.keys(receivableMap).map((currency) => ({ currency, amount: receivableMap[currency] }));
      const payableByCurrency = Object.keys(payableMap).map((currency) => ({ currency, amount: payableMap[currency] }));

      return {
        stockReceivableSummary,
        stockPayableSummary,
        paymentReceivableSummary,
        paymentPayableSummary,
        advanceSummary,
        receivableByCurrency,
        payableByCurrency,
        ...party.toJSON(),
      };
    });
    
    return {
      parties: result,
      totals: Object.keys(totalsByCurrency).map((currency) => ({
        currency,
        receivable: totalsByCurrency[currency].receivable,
        payable: totalsByCurrency[currency].payable,
      })),
    };
  } catch (err) {
    console.error(err);
  }
};

export const createParty = async (req) => {
    const party = await Party.create(req.body);
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
