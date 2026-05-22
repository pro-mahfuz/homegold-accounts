import { Ledger, Payment, User, Bank, Invoice, Stock, InvoiceItem, Party, Category } from "../../models/model.js";

const getLedgerStableReferenceId = (ledger) =>
  Number(ledger.invoiceId) ||
  Number(ledger.paymentId) ||
  Number(ledger.stockId) ||
  Number(ledger.id) ||
  0;

const compareLedgerAscending = (a, b) => {
  const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
  if (dateDiff !== 0) return dateDiff;

  const referenceDiff = getLedgerStableReferenceId(a) - getLedgerStableReferenceId(b);
  if (referenceDiff !== 0) return referenceDiff;

  const createdAtDiff =
    new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
  if (createdAtDiff !== 0) return createdAtDiff;

  return (a.id || 0) - (b.id || 0);
};

export const getAllLedger = async () => {
  const data = await Ledger.findAll({
    include: [
      { model: Party, as: "party" },
      { model: Category, as: "category" },
      { model: Payment, as: "payment", include: [{ model: Invoice, as: "invoice" }] },
      { model: Invoice, as: "invoice", include: [{ model: InvoiceItem, as: "items" }] },
      { model: Bank, as: "bank" },
      { model: Stock, as: "stock", include: [{ model: Invoice, as: "invoice" }] },
      { model: User, as: "createdByUser" },
      { model: User, as: "updatedByUser" },
    ],
    order: [
      ["date", "ASC"],
      ["id", "ASC"],
    ],
    subQuery: false, // important when using includes
  });

  if (!data?.length) throw { status: 400, message: "No Ledger found" };

  return data.map((ledger) => {
    const ledgerJson = ledger.toJSON();

    // determine type
    const isPayment = [
      "payment_in", 
      "payment_out", 
      "expense", 
      "advance_received", 
      "advance_payment", 
      "advance_received_deduct", 
      "advance_payment_deduct",
      "payable",
      "receivable", 
      "bill_out",
      "discount_sale",
      "discount_purchase",
      "deposit",
      "withdraw",
      "premium_received",
      "premium_paid"
    ].includes(ledgerJson.transactionType);
    const isStock = ["stock_in", "stock_out", "stock_transfer", "stock_transfer_return"].includes(ledgerJson.transactionType);

    return {
      invoiceRefNo: ledgerJson.invoice ? `${ledgerJson.invoice.prefix}-${String(ledgerJson.invoiceId).padStart(6, "0")}` : null,
      paymentRefNo: isPayment && ledgerJson.payment ? `${ledgerJson.payment.prefix}-${String(ledgerJson.paymentId).padStart(6, "0")}` : null,
      stockRefNo: isStock && ledgerJson.stock ? `${ledgerJson.stock.prefix}-${String(ledgerJson.stockId).padStart(6, "0")}` : null,
      createdByUserName: ledgerJson.createdByUser?.name ?? null,
      updatedByUserName: ledgerJson.updatedByUser?.name ?? null,
      ...ledgerJson,
    };
  }).sort(compareLedgerAscending);
};

export const getCustomerLedgerData = async () => {
  const data = await Ledger.findAll({
    include: [
      { model: Party, as: "party" },
      { model: Category, as: "category" },
      { model: Payment, as: "payment", include: [{ model: Invoice, as: "invoice" }] },
      { model: Invoice, as: "invoice", include: [{ model: InvoiceItem, as: "items" }] },
      { model: Bank, as: "bank" },
      { model: Stock, as: "stock", include: [{ model: Invoice, as: "invoice" }] },
      { model: User, as: "createdByUser" },
      { model: User, as: "updatedByUser" },
    ],
    order: [
      ["date", "ASC"],
      ["id", "ASC"],
    ],
    subQuery: false, // important when using includes
  });

  if (!data?.length) throw { status: 400, message: "No Ledger found" };

  return data.map((ledger) => {
    const ledgerJson = ledger.toJSON();

    // determine type
    const isPayment = [
      "payment_in", 
      "payment_out", 
      "expense", 
      "advance_received", 
      "advance_payment", 
      "advance_received_deduct", 
      "advance_payment_deduct",
      "payable",
      "receivable",
      "bill_out",
      "discount_sale",
      "discount_purchase",
      "deposit",
      "withdraw",
      "premium_received",
      "premium_paid"
    ].includes(ledgerJson.transactionType);
    const isStock = ["stock_in", "stock_out", "stock_transfer", "stock_transfer_return"].includes(ledgerJson.transactionType);

    return {
      invoiceRefNo: ledgerJson.invoice ? `${ledgerJson.invoice.prefix}-${String(ledgerJson.invoiceId).padStart(6, "0")}` : null,
      paymentRefNo: isPayment && ledgerJson.payment ? `${ledgerJson.payment.prefix}-${String(ledgerJson.paymentId).padStart(6, "0")}` : null,
      stockRefNo: isStock && ledgerJson.stock ? `${ledgerJson.stock.prefix}-${String(ledgerJson.stockId).padStart(6, "0")}` : null,
      createdByUserName: ledgerJson.createdByUser?.name ?? null,
      updatedByUserName: ledgerJson.updatedByUser?.name ?? null,
      ...ledgerJson,
    };
  }).sort(compareLedgerAscending);
};

export const createLedger = async (req) => {
    const data = await Ledger.create(req.body);
    console.log("Ledger response body:", data);
    
    return data;
}

export const getLedgerById = async (id) => {
    const data = await Ledger.findByPk(id);
    if (!data) {
        throw { status: 404, message: "Ledger not found" };
    }
    return data;
}

export const updateLedger = async (req) => {
    const data = await Ledger.findByPk(req.body.id);
    console.log("Ledger: ", data);
    if (!data) {
        throw { status: 404, message: "Ledger not found" };
    }

    await data.update(req.body);
    return data;
}

export const deleteLedger = async (id) => {
      
    const data = await Ledger.findByPk(id);
    if (!data) {
      throw new Error("Ledger not found");
    }

    data.destroy();

    return data;
}
