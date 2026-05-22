import { Invoice, InvoiceItem, User, Payment, Item, Warehouse, Stock, Ledger, Category, Party, sequelize } from "../../models/model.js";
import { fn, col, Op, Sequelize } from "sequelize";

const UNFIX_TRANSFER_TYPE = "unfix_sale_transter";
const LEGACY_UNFIX_TRANSFER_TYPE = "unfix_transter";
const UNFIX_TRANSFER_TYPES = [UNFIX_TRANSFER_TYPE, LEGACY_UNFIX_TRANSFER_TYPE];
const UNFIX_TRANSFER_SOURCE_TYPES = ["unfix_sale", ...UNFIX_TRANSFER_TYPES];
const AUTO_PURCHASE_STOCK_TYPES = ["wholesale_purchase", "unfix_purchase", "fix_purchase"];
const AUTO_SALE_STOCK_TYPES = ["wholesale_sale", "unfix_sale", "fix_sale"];
const AUTO_STOCK_MANAGED_TYPES = ["sale", ...AUTO_PURCHASE_STOCK_TYPES, ...AUTO_SALE_STOCK_TYPES, ...UNFIX_TRANSFER_TYPES, "fix_sale", "fix_purchase", "unfix_purchase"];
const STOCK_PREFIX_MAP = {
  stock_in: "STI",
  stock_out: "STO",
  stock_transfer: "STT",
  stock_transfer_return: "STR",
  stock_adj: "STA",
};
const INVOICE_PAYMENT_CONFIG = {
  wholesale_purchase: {
    paymentType: "payment_out",
    prefix: "PMO",
    description: "Paid Payment",
    debit: false,
  },
  wholesale_sale: {
    paymentType: "payment_in",
    prefix: "PMI",
    description: "Received Payment",
    debit: true,
  },
  fix_purchase: {
    paymentType: "payment_out",
    prefix: "PMO",
    description: "Paid Payment",
    debit: false,
  },
};
const STOCK_LEDGER_CATEGORY_NAMES = ["currency", "gold"];
const MANDATORY_WHOLESALE_PAID_TYPES = ["wholesale_purchase", "wholesale_sale"];

const isUnfixTransferType = (invoiceType) =>
  UNFIX_TRANSFER_TYPES.includes(String(invoiceType || "").toLowerCase());

const normalizeTransferInvoiceType = (invoiceType) =>
  isUnfixTransferType(invoiceType) ? UNFIX_TRANSFER_TYPE : invoiceType;

const requiresMandatoryWholesalePaidFields = (invoiceType) =>
  MANDATORY_WHOLESALE_PAID_TYPES.includes(invoiceType?.toLowerCase());

const ensureMandatoryWholesalePaidFields = ({ invoiceType, isFullPaid, bankId }) => {
  if (!requiresMandatoryWholesalePaidFields(invoiceType)) {
    return;
  }

  if (isFullPaid !== true) {
    throw {
      status: 400,
      message: "Is Full Paid is mandatory for wholesale purchase and wholesale sale invoices.",
    };
  }

  if (!(Number(bankId) > 0)) {
    throw {
      status: 400,
      message: "Paid Account is mandatory for wholesale purchase and wholesale sale invoices.",
    };
  }
};

const normalizeOptionalId = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalizedValue = Number(value);
  return Number.isNaN(normalizedValue) ? null : normalizedValue;
};

const shouldCreateAutoStockLedger = (invoiceType, categoryName) => {
  const normalizedType = invoiceType?.toLowerCase();
  const normalizedCategory = categoryName?.toLowerCase();
  const isStockLedgerCategory = STOCK_LEDGER_CATEGORY_NAMES.includes(normalizedCategory);

  if (["wholesale_purchase", "wholesale_sale"].includes(normalizedType)) {
    return true;
  }

  return !isStockLedgerCategory;
};

const clearInvoicePaymentsByType = async ({
  invoiceId,
  paymentType,
  transaction,
}) => {
  const existingPayments = await Payment.findAll({
    where: {
      invoiceId,
      paymentType,
    },
    transaction,
  });

  if (existingPayments.length === 0) {
    return;
  }

  const paymentIds = existingPayments.map((payment) => payment.id);

  await Ledger.destroy({
    where: { paymentId: { [Op.in]: paymentIds } },
    transaction,
  });

  await Payment.destroy({
    where: { id: { [Op.in]: paymentIds } },
    transaction,
  });
};

const getInvoiceLedgerPosting = ({
  invoiceType,
  grandTotal,
  items,
  categoryName,
}) => {
  let debitAmount = 0;
  let creditAmount = 0;
  let debitQuantity = 0;
  let creditQuantity = 0;
  let stockCurrency = null;

  const normalizedType = invoiceType?.toLowerCase();
  const normalizedCategory = categoryName?.toLowerCase();
  const primaryItem = Array.isArray(items) ? items[0] : null;
  const primaryQuantity = primaryItem?.quantity ?? 0;
  const primaryItemName = primaryItem?.name ?? null;

  if (["purchase", "clearance_bill", "wholesale_purchase"].includes(normalizedType)) {
    creditAmount = grandTotal;
  }

  if (["sale", "wholesale_sale", "fix_purchase"].includes(normalizedType)) {
    debitAmount = grandTotal;
  }

  if (normalizedType === "fix_sale") {
    creditAmount = grandTotal;
  }

  if (STOCK_LEDGER_CATEGORY_NAMES.includes(normalizedCategory)) {
    if (["purchase", "clearance_bill", "wholesale_purchase"].includes(normalizedType)) {
      creditQuantity = primaryQuantity;
      stockCurrency = primaryItemName;
    }

    if (normalizedType === "unfix_purchase") {
      debitQuantity = primaryQuantity;
      stockCurrency = primaryItemName;
    }

    if (normalizedType === "fix_purchase") {
      creditQuantity = primaryQuantity;
      stockCurrency = primaryItemName;
    }

    if (normalizedType === "unfix_sale") {
      creditQuantity = primaryQuantity;
      stockCurrency = primaryItemName;
    }

    if (normalizedType === "fix_sale") {
      debitQuantity = primaryQuantity;
      stockCurrency = primaryItemName;
    }
  }

  return {
    debitAmount,
    creditAmount,
    debitQuantity,
    creditQuantity,
    stockCurrency,
  };
};

const getUnfixSaleTransferAvailableStock = async ({
  businessId,
  partyId,
  itemId,
  unit,
  excludeInvoiceId = null,
  transaction,
}) => {
  const where = {
    businessId,
    partyId,
    itemId,
    unit,
  };

  if (Number(excludeInvoiceId) > 0) {
    where[Op.or] = [
      { invoiceId: null },
      { invoiceId: { [Op.ne]: Number(excludeInvoiceId) } },
    ];
  }

  const [summary] = await Stock.findAll({
    attributes: [
      [
        fn(
          "SUM",
          Sequelize.literal(`
            CASE
              WHEN invoiceType IN ('unfix_sale', 'unfix_sale_transter', 'unfix_transter') OR movementType = 'stock_transfer'
              THEN quantity
              ELSE 0
            END
          `)
        ),
        "totalReceived",
      ],
      [
        fn(
          "SUM",
          Sequelize.literal(`
            CASE
              WHEN invoiceType = 'fix_sale' OR movementType = 'stock_transfer_return'
              THEN quantity
              ELSE 0
            END
          `)
        ),
        "totalReleased",
      ],
    ],
    where,
    raw: true,
    transaction,
  });

  const totalReceived = Number(summary?.totalReceived) || 0;
  const totalReleased = Number(summary?.totalReleased) || 0;

  return {
    totalReceived,
    totalReleased,
    availableQty: totalReceived - totalReleased,
  };
};

const resolveTransferWarehouseId = (item, referenceItem) => {
  const currentWarehouseId = normalizeOptionalId(item?.warehouseId);
  if (currentWarehouseId) {
    return currentWarehouseId;
  }

  return normalizeOptionalId(referenceItem?.warehouseId);
};

const resolveUnfixSaleTransferContext = async ({
  invoiceType,
  invoiceRefId,
  currentInvoiceId = null,
  businessId,
  destinationPartyId,
  items,
  transaction,
}) => {
  const normalizedType = invoiceType?.toLowerCase();
  const normalizedInvoiceRefId = Number(invoiceRefId) || 0;

  if (!isUnfixTransferType(normalizedType) || normalizedInvoiceRefId <= 0) {
    return null;
  }

  if (Number(currentInvoiceId) > 0 && normalizedInvoiceRefId === Number(currentInvoiceId)) {
    throw {
      status: 400,
      message: "Transfer source invoice cannot be the same invoice.",
    };
  }

  const referenceInvoice = await Invoice.findByPk(normalizedInvoiceRefId, {
    include: [{ model: InvoiceItem, as: "items" }],
    transaction,
  });

  if (!referenceInvoice) {
    throw {
      status: 404,
      message: "Transfer source invoice not found.",
    };
  }

  if (!UNFIX_TRANSFER_SOURCE_TYPES.includes(referenceInvoice.invoiceType?.toLowerCase())) {
    throw {
      status: 400,
      message: "Transfer source invoice must be an unfix sale or unfix sale transter invoice.",
    };
  }

  if (Number(referenceInvoice.businessId) !== Number(businessId)) {
    throw {
      status: 400,
      message: "Transfer source invoice belongs to a different business.",
    };
  }

  const sourcePartyId = Number(referenceInvoice.partyId) || 0;
  const normalizedDestinationPartyId = Number(destinationPartyId) || 0;

  if (!sourcePartyId) {
    throw {
      status: 400,
      message: "Transfer source party is missing.",
    };
  }

  if (!normalizedDestinationPartyId) {
    throw {
      status: 400,
      message: "Destination party is required for unfix sale transter invoice.",
    };
  }

  if (sourcePartyId === normalizedDestinationPartyId) {
    throw {
      status: 400,
      message: "Source party and destination party must be different for unfix sale transter invoice.",
    };
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw {
      status: 400,
      message: "Transfer items are required for unfix sale transter invoice.",
    };
  }

  const [sourceParty, destinationParty] = await Promise.all([
    Party.findByPk(sourcePartyId, { transaction }),
    Party.findByPk(normalizedDestinationPartyId, { transaction }),
  ]);

  if (!sourceParty) {
    throw {
      status: 404,
      message: "Transfer source party not found.",
    };
  }

  if (!destinationParty) {
    throw {
      status: 404,
      message: "Transfer destination party not found.",
    };
  }

  const normalizedItems = items
    .filter((item) => Number(item?.itemId) > 0 && Number(item?.quantity) > 0 && item?.unit)
    .map((item) => {
      const referenceItem = (referenceInvoice.items || []).find(
        (refItem) =>
          Number(refItem.itemId) === Number(item.itemId) &&
          String(refItem.unit || "").trim().toLowerCase() === String(item.unit || "").trim().toLowerCase()
      );

      if (!referenceItem) {
        throw {
          status: 400,
          message: `${item.name || "Selected item"} does not exist in the transfer source invoice.`,
        };
      }

      return {
        ...item,
        itemId: Number(item.itemId) || 0,
        quantity: Number(item.quantity) || 0,
        unit: item.unit,
        name: item.name || referenceItem.name || null,
        warehouseId: resolveTransferWarehouseId(item, referenceItem),
        referenceItem,
      };
    });

  for (const item of normalizedItems) {
    const stockSummary = await getUnfixSaleTransferAvailableStock({
      businessId,
      partyId: sourcePartyId,
      itemId: item.itemId,
      unit: item.unit,
      excludeInvoiceId: currentInvoiceId,
      transaction,
    });

    if (stockSummary.availableQty < item.quantity) {
      throw {
        status: 400,
        message: `Insufficient transfer stock with ${sourceParty.name} for ${item.name || "item"}. Available: ${stockSummary.availableQty.toFixed(2)} ${item.unit}`,
      };
    }
  }

  return {
    referenceInvoice,
    sourceParty,
    destinationParty,
    items: normalizedItems,
  };
};

const normalizeInvoiceItemsForTransfer = (items, transferContext) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  if (!transferContext) {
    return items;
  }

  return items.map((item) => {
    const matchedItem = transferContext.items.find(
      (transferItem) =>
        Number(transferItem.itemId) === Number(item.itemId) &&
        String(transferItem.unit || "").trim().toLowerCase() === String(item.unit || "").trim().toLowerCase()
    );

    if (!matchedItem) {
      return item;
    }

    return {
      ...item,
      name: item.name || matchedItem.name || item.name,
      warehouseId: normalizeOptionalId(item.warehouseId) || matchedItem.warehouseId || null,
    };
  });
};

const createUnfixSaleTransferSourceAdjustments = async ({
  invoice,
  transferContext,
  categoryName,
  transaction,
  updatedBy = null,
}) => {
  if (!transferContext || !Array.isArray(transferContext.items) || transferContext.items.length === 0) {
    return [];
  }

  const isStockLedgerCategory = STOCK_LEDGER_CATEGORY_NAMES.includes(categoryName?.toLowerCase());
  const createdStocks = [];

  for (const item of transferContext.items) {
    const sourceStock = await Stock.create(
      {
        businessId: invoice.businessId,
        date: invoice.date,
        prefix: STOCK_PREFIX_MAP.stock_transfer_return,
        invoiceType: UNFIX_TRANSFER_TYPE,
        invoiceId: invoice.id,
        partyId: transferContext.sourceParty.id,
        categoryId: invoice.categoryId,
        itemId: item.itemId,
        movementType: "stock_transfer_return",
        warehouseId: item.warehouseId ?? null,
        bankId: null,
        quantity: item.quantity,
        unit: item.unit,
        createdBy: invoice.createdBy,
        updatedBy,
      },
      { transaction }
    );

    const destinationStock = await Stock.create(
      {
        businessId: invoice.businessId,
        date: invoice.date,
        prefix: STOCK_PREFIX_MAP.stock_transfer,
        invoiceType: UNFIX_TRANSFER_TYPE,
        invoiceId: invoice.id,
        partyId: transferContext.destinationParty.id,
        categoryId: invoice.categoryId,
        itemId: item.itemId,
        movementType: "stock_transfer",
        warehouseId: item.warehouseId ?? null,
        bankId: null,
        quantity: item.quantity,
        unit: item.unit,
        createdBy: invoice.createdBy,
        updatedBy,
      },
      { transaction }
    );

    if (isStockLedgerCategory) {
      await Ledger.bulkCreate(
        [
          {
            businessId: invoice.businessId,
            categoryId: invoice.categoryId,
            transactionType: UNFIX_TRANSFER_TYPE,
            partyId: transferContext.sourceParty.id,
            date: invoice.date,
            invoiceId: invoice.id,
            stockId: sourceStock.id,
            description: `Transferred to ${transferContext.destinationParty.name}: ${item.name} x${item.quantity}${invoice.note ? ` | Note: ${invoice.note}` : ""}`,
            currency: null,
            stockCurrency: item.name ?? null,
            debitQty: item.quantity,
            creditQty: 0,
            createdBy: invoice.createdBy,
            updatedBy,
          },
          {
            businessId: invoice.businessId,
            categoryId: invoice.categoryId,
            transactionType: UNFIX_TRANSFER_TYPE,
            partyId: transferContext.destinationParty.id,
            date: invoice.date,
            invoiceId: invoice.id,
            stockId: destinationStock.id,
            description: `Transferred from ${transferContext.sourceParty.name}: ${item.name} x${item.quantity}${invoice.note ? ` | Note: ${invoice.note}` : ""}`,
            currency: null,
            stockCurrency: item.name ?? null,
            debitQty: 0,
            creditQty: item.quantity,
            createdBy: invoice.createdBy,
            updatedBy,
          },
        ],
        { transaction }
      );
    }

    createdStocks.push(sourceStock, destinationStock);
  }

  return createdStocks;
};

const getWarehouseAvailableStock = async ({
  businessId,
  itemId,
  unit,
  warehouseId,
  transaction,
}) => {
  const [summary] = await Stock.findAll({
    attributes: [
      [fn("SUM", Sequelize.literal(`CASE WHEN movementType IN ('stock_in', 'stock_transfer_return') THEN quantity ELSE 0 END`)), "totalIn"],
      [fn("SUM", Sequelize.literal(`CASE WHEN movementType IN ('stock_out', 'stock_transfer') THEN quantity ELSE 0 END`)), "totalOut"],
      [fn("SUM", Sequelize.literal(`CASE WHEN movementType = 'damaged' THEN quantity ELSE 0 END`)), "totalDamaged"],
    ],
    where: {
      businessId,
      itemId,
      unit,
      warehouseId,
    },
    raw: true,
    transaction,
  });

  const totalIn = Number(summary?.totalIn) || 0;
  const totalOut = Number(summary?.totalOut) || 0;
  const totalDamaged = Number(summary?.totalDamaged) || 0;

  return {
    totalIn,
    totalOut,
    totalDamaged,
    availableQty: totalIn - totalOut - totalDamaged,
  };
};

const ensureAutoSaleItemsReady = async ({
  invoice,
  items,
  categoryName,
  transaction,
}) => {
  const normalizedCategory = categoryName?.toLowerCase();
  const isStockLedgerCategory = STOCK_LEDGER_CATEGORY_NAMES.includes(normalizedCategory);

  if (!Array.isArray(items) || items.length === 0 || isStockLedgerCategory) {
    return;
  }

  const requestedStockMap = items.reduce((acc, item) => {
    const warehouseId = Number(item.warehouseId) || 0;
    if (!warehouseId) {
      throw {
        status: 400,
        message: `Warehouse is required for ${item.name || "all wholesale sale items"}.`,
      };
    }

    const key = `${item.itemId}_${item.unit}_${warehouseId}`;

    if (!acc[key]) {
      acc[key] = {
        itemId: item.itemId,
        itemName: item.name,
        unit: item.unit,
        warehouseId,
        quantity: 0,
      };
    }

    acc[key].quantity += Number(item.quantity) || 0;
    return acc;
  }, {});

  for (const entry of Object.values(requestedStockMap)) {
    const stockSummary = await getWarehouseAvailableStock({
      businessId: invoice.businessId,
      itemId: entry.itemId,
      unit: entry.unit,
      warehouseId: entry.warehouseId,
      transaction,
    });

    if (stockSummary.availableQty < entry.quantity) {
      throw {
        status: 400,
        message: `Insufficient stock for ${entry.itemName || "item"}. Available: ${stockSummary.availableQty.toFixed(2)} ${entry.unit}`,
      };
    }
  }
};

const createAutoStockEntries = async ({
  invoice,
  items,
  movementType,
  transaction,
  updatedBy = null,
  createLedgerEntry = true,
}) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const prefix = STOCK_PREFIX_MAP[movementType] || "";
  const isStockIn = movementType === "stock_in";

  return Promise.all(
    items.map(async (item) => {
      const stock = await Stock.create(
        {
          businessId: invoice.businessId,
          date: invoice.date,
          prefix,
          invoiceType: invoice.invoiceType,
          invoiceId: invoice.id,
          partyId: invoice.partyId,
          categoryId: invoice.categoryId,
          itemId: item.itemId,
          movementType,
          warehouseId: item.warehouseId ?? null,
          bankId: null,
          quantity: item.quantity,
          unit: item.unit,
          createdBy: invoice.createdBy,
          updatedBy,
        },
        { transaction }
      );

      if (createLedgerEntry) {
        await Ledger.create(
          {
            businessId: invoice.businessId,
            categoryId: invoice.categoryId,
            transactionType: movementType,
            partyId: invoice.partyId,
            date: invoice.date,
            invoiceId: invoice.id,
            stockId: stock.id,
            description: `${item.name} x${item.quantity}${invoice.note ? ` | Note: ${invoice.note}` : ""}`,
            currency: null,
            stockCurrency: item.name ?? null,
            debitQty: isStockIn ? item.quantity : 0,
            creditQty: isStockIn ? 0 : item.quantity,
            createdBy: invoice.createdBy,
            updatedBy,
          },
          { transaction }
        );
      }

      return stock;
    })
  );
};

const syncInvoiceAutoPayment = async ({
  invoice,
  paidTotal,
  isFullPaid = false,
  bankId,
  transaction,
  updatedBy = null,
}) => {
  const type = invoice.invoiceType?.toLowerCase();
  const paymentConfig = INVOICE_PAYMENT_CONFIG[type];
  const shouldPersistPaymentRecord = type !== "fix_purchase";

  if (type === "fix_purchase") {
    const existingPaymentOutLedgers = await Ledger.findAll({
      where: {
        invoiceId: invoice.id,
        transactionType: paymentConfig?.paymentType || "payment_out",
      },
      transaction,
    });

    for (const ledger of existingPaymentOutLedgers) {
      await ledger.destroy({ transaction });
    }
  }

  if (!paymentConfig) {
    if (type === "unfix_purchase") {
      await clearInvoicePaymentsByType({
        invoiceId: invoice.id,
        paymentType: "payment_out",
        transaction,
      });
    }

    if (["unfix_sale", "fix_sale"].includes(type) || isUnfixTransferType(type)) {
      await clearInvoicePaymentsByType({
        invoiceId: invoice.id,
        paymentType: "payment_in",
        transaction,
      });
    }

    return null;
  }

  const existingPayment = await Payment.findOne({
    where: {
      invoiceId: invoice.id,
      paymentType: paymentConfig.paymentType,
    },
    transaction,
  });

  const invoiceFinalAmount = Math.max(
    0,
    (Number(invoice.grandTotal) || 0) - (Number(invoice.discount) || 0)
  );
  const normalizedPaidTotal =
    type === "fix_purchase"
      ? invoiceFinalAmount
      : Number(paidTotal) > 0
      ? Number(paidTotal)
      : isFullPaid
        ? invoiceFinalAmount
        : 0;
  const normalizedBankId = Number(bankId) > 0 ? Number(bankId) : null;

  if (type === "fix_purchase") {
    if (existingPayment) {
      await Ledger.destroy({
        where: { paymentId: existingPayment.id },
        transaction,
      });
      await existingPayment.destroy({ transaction });
    }

    return null;
  }

  if (invoice.system !== 1 || normalizedPaidTotal <= 0) {
    if (existingPayment) {
      await Ledger.destroy({
        where: { paymentId: existingPayment.id },
        transaction,
      });
      await existingPayment.destroy({ transaction });
    }
    return null;
  }

  if (!shouldPersistPaymentRecord && existingPayment) {
    await Ledger.destroy({
      where: { paymentId: existingPayment.id },
      transaction,
    });
    await existingPayment.destroy({ transaction });
  }

  const paymentPayload = {
    businessId: invoice.businessId,
    partyId: invoice.partyId,
    categoryId: invoice.categoryId,
    prefix: paymentConfig.prefix,
    paymentType: paymentConfig.paymentType,
    invoiceId: invoice.id,
    paymentDate: invoice.date,
    currency: invoice.currency,
    amountPaid: normalizedPaidTotal,
    bankId: normalizedBankId,
    createdBy: invoice.createdBy,
    updatedBy,
  };

  const payment = shouldPersistPaymentRecord
    ? existingPayment
      ? await existingPayment.update(paymentPayload, { transaction })
      : await Payment.create(paymentPayload, { transaction })
    : null;

  const ledgerPayload = {
    businessId: invoice.businessId,
    categoryId: invoice.categoryId,
    transactionType: paymentConfig.paymentType,
    partyId: invoice.partyId,
    date: invoice.date,
    paymentId: payment?.id ?? null,
    invoiceId: invoice.id,
    bankId: normalizedBankId,
    description: paymentConfig.description,
    currency: invoice.currency,
    debit: paymentConfig.debit ? normalizedPaidTotal : 0,
    credit: paymentConfig.debit ? 0 : normalizedPaidTotal,
    createdBy: invoice.createdBy,
    updatedBy,
  };

  const existingLedger = payment
    ? await Ledger.findOne({
        where: { paymentId: payment.id },
        transaction,
      })
    : await Ledger.findOne({
        where: {
          invoiceId: invoice.id,
          transactionType: paymentConfig.paymentType,
          paymentId: null,
        },
        transaction,
      });

  if (existingLedger) {
    await existingLedger.update(ledgerPayload, { transaction });
  } else {
    await Ledger.create(ledgerPayload, { transaction });
  }

  return payment;
};

export const getAllInvoice = async () => {
  const invoices = await Invoice.findAll({
    include: [
      { model: InvoiceItem, as: "items" },
      { model: Category, as: "category" },
      { model: Party, as: "party" },
      { model: Stock, as: "stocks" },
      { model: Payment, as: "payments" },
      { model: User, as: "createdByUser" },
      { model: User, as: "updatedByUser" },
    ],
    order: [
      ["date", "DESC"],
      ["id", "DESC"],
    ],
  });

  if (!invoices || invoices.length === 0) {
    const error = new Error("No Invoice found");
    error.status = 400;
    throw error;
  }

  // 🔹 Fetch ALL payments once (avoid N+1)
  const allPayments = await Payment.findAll();

  // 🔹 Group payments by partyId
  const paymentsByParty = allPayments.reduce((acc, p) => {
    if (!acc[p.partyId]) acc[p.partyId] = [];
    acc[p.partyId].push(p);
    return acc;
  }, {});

  const invoiceData = invoices.map(invoice => {
    const invoiceNo = `${invoice.prefix}-${String(invoice.id).padStart(6, "0")}`;

    const vatInvoiceRefNo = invoice.vatInvoiceNo
      ? `${invoice.prefix}-${String(invoice.vatInvoiceNo).padStart(6, "0")}`
      : null;

    // 🔹 Aggregate stocks once per invoice
    const stockMap = {};
    invoice.stocks?.forEach(stock => {
      const key = `${stock.itemId}_${stock.unit}`;
      if (!stockMap[key]) {
        stockMap[key] = { stockIn: 0, stockOut: 0 };
      }

      if (["stock_in", "stock_transfer_return"].includes(stock.movementType)) {
        stockMap[key].stockIn += stock.quantity || 0;
      } else if (["stock_out", "stock_transfer"].includes(stock.movementType)) {
        stockMap[key].stockOut += stock.quantity || 0;
      }
    });

    const itemsWithStockSum =
      invoice.items?.map(item => {
        const key = `${item.itemId}_${item.unit}`;
        return {
          ...item.toJSON(),
          ...(stockMap[key] || { stockIn: 0, stockOut: 0 }),
        };
      }) ?? [];

    // 🔹 Payment In / Out (invoice payments only)
    const { paymentInSum, paymentOutSum } =
      invoice.payments?.reduce(
        (acc, p) => {
          if (p.paymentType === "payment_in") {
            acc.paymentInSum += Number(p.amountPaid) || 0;
          } else if (
            p.paymentType === "payment_out" ||
            p.paymentType === "bill_out"
          ) {
            acc.paymentOutSum += Number(p.amountPaid) || 0;
          }
          return acc;
        },
        { paymentInSum: 0, paymentOutSum: 0 }
      ) ?? { paymentInSum: 0, paymentOutSum: 0 };

    // 🔹 Advance In / Out (party-level)
    const partyPayments = paymentsByParty[invoice.partyId] || [];

    const advancesByCurrency = partyPayments.reduce((acc, p) => {
      const currency = p.currency || "UNKNOWN";

      if (!acc[currency]) {
        acc[currency] = { advanceInSum: 0, advanceOutSum: 0 };
      }

      if (
        p.paymentType === "advance_received" ||
        p.paymentType === "advance_payment_deduct"
      ) {
        acc[currency].advanceInSum += Number(p.amountPaid) || 0;
      } else if (
        p.paymentType === "advance_payment" ||
        p.paymentType === "advance_received_deduct"
      ) {
        acc[currency].advanceOutSum += Number(p.amountPaid) || 0;
      }

      return acc;
    }, {});

    const advancesArray = Object.entries(advancesByCurrency).map(
      ([currency, sums]) => ({
        currency,
        ...sums,
      })
    );

    return {
      ...invoice.toJSON(),
      invoiceNo,
      vatInvoiceRefNo,
      paymentInSum,
      paymentOutSum,
      createdByUser: invoice.createdByUser ?? null,
      updatedByUser: invoice.updatedByUser ?? null,
      items: itemsWithStockSum,
      advancesArray,
    };
  });

  return invoiceData;
};


export const getAllInvoiceWithPagination = async (
  page = 1,
  limit = 10,
  type = "",
  filterText = null
) => {
  let rows;
  let count = 0;
  let totalPages = 1;
  page = Number(page) || 1;
  limit = Number(limit) || 10;
  const normalizedFilterText = String(filterText || "").trim();

  let whereClause = {};
  const include = [
    { model: InvoiceItem, as: "items" },
    { model: Category, as: "category" },
    { model: Party, as: "party" },
    { model: Stock, as: "stocks" },
    { model: Payment, as: "payments" },
    { model: User, as: "createdByUser" },
    { model: User, as: "updatedByUser" },
  ];

  // Filter by invoice type if provided
  if (type && type !== "all") {
    let typeList = [];

    if (type === "purchase") {
      typeList = ["purchase", "wholesale_purchase", "fix_purchase", "unfix_purchase"];
    } else if (type === "sale") {
      typeList = ["sale", "wholesale_sale", "fix_sale", "unfix_sale", ...UNFIX_TRANSFER_TYPES];
    } else {
      typeList = Array.isArray(type) ? type : [type];
    }

    whereClause.invoiceType = { [Op.in]: typeList };
  }

  if (!normalizedFilterText) {
    count = await Invoice.count({ where: whereClause });
    totalPages = Math.max(Math.ceil(count / limit), 1);
    if (page > totalPages) page = totalPages;
    const offset = (page - 1) * limit;

    rows = await Invoice.findAll({
      where: whereClause,
      include,
      order: [
        ["date", "DESC"],
        ["id", "DESC"],
      ],
      limit,
      offset,
    });
  } else {
    const normalizedTypeSearch = normalizedFilterText
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
    const orConditions = [
      { date: { [Op.like]: `%${normalizedFilterText}%` } },
      { prefix: { [Op.like]: `%${normalizedFilterText}%` } },
      { invoiceType: { [Op.like]: `%${normalizedFilterText}%` } },
      { invoiceType: { [Op.like]: `%${normalizedTypeSearch}%` } },
      { "$category.name$": { [Op.like]: `%${normalizedFilterText}%` } },
      { "$party.name$": { [Op.like]: `%${normalizedFilterText}%` } },
      { "$items.name$": { [Op.like]: `%${normalizedFilterText}%` } },
    ];

    const numericFilterValue = Number(normalizedFilterText);
    if (!Number.isNaN(numericFilterValue) && numericFilterValue > 0) {
      orConditions.push(
        { id: { [Op.eq]: numericFilterValue } },
        { vatInvoiceNo: { [Op.eq]: numericFilterValue } }
      );
    }

    const invoiceNumberMatch = normalizedFilterText.match(/^([A-Za-z]+)[-\s]?0*([0-9]+)$/);
    if (invoiceNumberMatch) {
      const [, prefixPart, invoiceNumberPart] = invoiceNumberMatch;
      const invoiceNumber = Number(invoiceNumberPart) || 0;

      if (invoiceNumber > 0) {
        orConditions.push(
          {
            [Op.and]: [
              { prefix: { [Op.like]: `${prefixPart}%` } },
              { id: { [Op.eq]: invoiceNumber } },
            ],
          },
          {
            [Op.and]: [
              { prefix: { [Op.like]: `${prefixPart}%` } },
              { vatInvoiceNo: { [Op.eq]: invoiceNumber } },
            ],
          }
        );
      }
    }

    whereClause = {
      ...whereClause,
      [Op.or]: orConditions,
    };
    const searchableInclude = [
      { model: InvoiceItem, as: "items", attributes: [], required: false },
      { model: Category, as: "category", attributes: [], required: false },
      { model: Party, as: "party", attributes: [], required: false },
    ];

    const matchedInvoiceRows = await Invoice.findAll({
      attributes: ["id"],
      where: whereClause,
      include: searchableInclude,
      order: [
        ["date", "DESC"],
        ["id", "DESC"],
      ],
      raw: true,
      subQuery: false,
    });

    const matchedInvoiceIds = [];
    const seenInvoiceIds = new Set();

    for (const matchedInvoiceRow of matchedInvoiceRows) {
      const invoiceId = Number(matchedInvoiceRow.id) || 0;

      if (invoiceId > 0 && !seenInvoiceIds.has(invoiceId)) {
        seenInvoiceIds.add(invoiceId);
        matchedInvoiceIds.push(invoiceId);
      }
    }

    count = matchedInvoiceIds.length;
    totalPages = Math.max(Math.ceil(count / limit), 1);
    if (page > totalPages) page = totalPages;

    const offset = (page - 1) * limit;
    const paginatedInvoiceIds = matchedInvoiceIds.slice(offset, offset + limit);

    rows = paginatedInvoiceIds.length
      ? await Invoice.findAll({
          where: { id: { [Op.in]: paginatedInvoiceIds } },
          include,
          order: [
            ["date", "DESC"],
            ["id", "DESC"],
          ],
        })
      : [];
  }

  // Return empty list if nothing found
  if (!rows?.length) {
    return {
      success: true,
      totalItems: 0,
      totalPages: 1,
      currentPage: page,
      invoices: [],
    };
  }

  // Format and enrich invoices
  const invoices = rows.map((invoice) => {
    const invoiceNo = `${invoice.prefix}-${String(invoice.id).padStart(6, "0")}`;
    const vatInvoiceRefNo =
      invoice.vatInvoiceNo > 0
        ? `${invoice.prefix}-${String(invoice.vatInvoiceNo).padStart(6, "0")}`
        : null;

    const itemsWithStockSum =
      invoice.items?.map(item => {
        const stockInForItem =
          invoice.stocks
            ?.filter(
              stock =>
                stock.itemId === item.itemId &&
                stock.unit === item.unit &&
                ["stock_in", "stock_transfer_return"].includes(stock.movementType)
            )
            .reduce((sum, stock) => sum + (stock.quantity ?? 0), 0) ?? 0;

        const stockOutForItem =
          invoice.stocks
            ?.filter(
              stock =>
                stock.itemId === item.itemId &&
                stock.unit === item.unit &&
                ["stock_out", "stock_transfer"].includes(stock.movementType)
            )
            .reduce((sum, stock) => sum + (stock.quantity ?? 0), 0) ?? 0;

        return {
          stockIn: stockInForItem,
          stockOut: stockOutForItem,
          ...item.toJSON(),
        };
      }) ?? [];

    const { paymentInSum, paymentOutSum } =
      invoice.payments?.reduce(
        (acc, p) => {
          if (p.paymentType === "payment_in") acc.paymentInSum += Number(p.amountPaid);
          else if (["payment_out", "bill_out"].includes(p.paymentType))
            acc.paymentOutSum += Number(p.amountPaid);
          return acc;
        },
        { paymentInSum: 0, paymentOutSum: 0 }
      ) ?? { paymentInSum: 0, paymentOutSum: 0 };

    return {
      ...invoice.toJSON(),
      invoiceNo,
      vatInvoiceRefNo,
      paymentInSum,
      paymentOutSum,
      items: itemsWithStockSum,
      createdByUser: invoice.createdByUser ?? null,
      updatedByUser: invoice.updatedByUser ?? null,
    };
  });

  return {
    success: true,
    totalItems: count,
    totalPages,
    currentPage: page,
    invoices,
  };
};

export const getPurchaseReport = async () => {
  const data = await Invoice.findAll({
    include: [
      {
          model: InvoiceItem,
          include: [{ model: Warehouse, as: "warehouse"}],
          as: "items",
      },
      {
          model: Category,
          as: "category",
      },
      {
          model: Party,
          as: "party",
      },
      {
          model: Stock,
          as: "stocks", 
      },
      {
          model: Payment,
          as: "payments", 
      },
      {
          model: User,
          as: "createdByUser",
      },
      {
          model: User,
          as: "updatedByUser",
      },
    ],
    order: [["date", "ASC"]],
  });

  if (!data || data.length === 0) throw { status: 400, message: "No Invoice found" };

  const invoiceData = data
  .filter(invoice => invoice.invoiceType === "purchase" || invoice.invoiceType === "fix_purchase" || invoice.invoiceType === "unfix_purchase" || invoice.invoiceType === "wholesale_purchase")
  .map(invoice => {
      let invoiceNo = '';
      let vatInvoiceRefNo = '';
      invoiceNo = invoice.prefix + "-" + String(invoice.id).padStart(6, '0');
      vatInvoiceRefNo = invoice.vatInvoiceNo > 0 ? invoice.prefix + "-" + String(invoice.vatInvoiceNo).padStart(6, '0') : null;

      // Calculate stock sum for each item
      const itemsWithStockSum = invoice.items?.map(item => {
          const stockInForItem = invoice.stocks?.filter(
              stock => stock.itemId === item.itemId && stock.unit === item.unit && ["stock_in", "stock_transfer_return"].includes(stock.movementType)
          ).reduce((sum, stock) => sum + (stock.quantity ?? 0), 0) ?? 0;

          const stockOutForItem = invoice.stocks?.filter(
              stock => stock.itemId === item.itemId && stock.unit === item.unit && ["stock_out", "stock_transfer"].includes(stock.movementType)
          ).reduce((sum, stock) => sum + (stock.quantity ?? 0), 0) ?? 0;

          return {
              stockIn: stockInForItem,
              stockOut: stockOutForItem,
              ...item.toJSON(),
          };
      }) ?? [];

      // Calculate payment sum (sum of payment amounts)
      const { paymentInSum, paymentOutSum } = invoice.payments?.reduce(
          (acc, p) => {
              if (p.paymentType === "payment_in") {
              acc.paymentInSum += Number(p.amountPaid) ?? 0;
              } else if (p.paymentType === "payment_out") {
              acc.paymentOutSum += Number(p.amountPaid) ?? 0;
              }
              return acc;
          },
          { paymentInSum: 0, paymentOutSum: 0 }
      ) ?? { paymentInSum: 0, paymentOutSum: 0 };
      

      return {
          invoiceNo,
          paymentInSum,
          paymentOutSum,
          createdByUser: invoice.createdByUser ?? null,
          updatedByUser: invoice.updatedByUser ?? null,
          ...invoice.toJSON(),
          items: itemsWithStockSum
      };
  });
  
  return invoiceData;
}

export const getSaleReport = async () => {
  const data = await Invoice.findAll({
    include: [
      {
          model: InvoiceItem,
          include: [{ model: Warehouse, as: "warehouse"}],
          as: "items",
      },
      {
          model: Category,
          as: "category",
      },
      {
          model: Party,
          as: "party",
      },
      {
          model: Stock,
          as: "stocks", 
      },
      {
          model: Payment,
          as: "payments", 
      },
      {
          model: User,
          as: "createdByUser",
      },
      {
          model: User,
          as: "updatedByUser",
      },
    ],
    order: [["date", "ASC"]],
  });

  if (!data || data.length === 0) throw { status: 400, message: "No Invoice found" };

  const invoiceData = data
  .filter(invoice => invoice.invoiceType === "sale" || invoice.invoiceType === "fix_sale" || invoice.invoiceType === "unfix_sale" || invoice.invoiceType === "wholesale_sale")
  .map(invoice => {
      let invoiceNo = '';
      let vatInvoiceRefNo = '';
      invoiceNo = invoice.prefix + "-" + String(invoice.id).padStart(6, '0');
      vatInvoiceRefNo = invoice.vatInvoiceNo > 0 ? invoice.prefix + "-" + String(invoice.vatInvoiceNo).padStart(6, '0') : null;

      // Calculate stock sum for each item
      const itemsWithStockSum = invoice.items?.map(item => {
          const stockInForItem = invoice.stocks?.filter(
              stock => stock.itemId === item.itemId && stock.unit === item.unit && ["stock_in", "stock_transfer_return"].includes(stock.movementType)
          ).reduce((sum, stock) => sum + (stock.quantity ?? 0), 0) ?? 0;

          const stockOutForItem = invoice.stocks?.filter(
              stock => stock.itemId === item.itemId && stock.unit === item.unit && ["stock_out", "stock_transfer"].includes(stock.movementType)
          ).reduce((sum, stock) => sum + (stock.quantity ?? 0), 0) ?? 0;

          return {
              stockIn: stockInForItem,
              stockOut: stockOutForItem,
              ...item.toJSON(),
          };
      }) ?? [];

      // Calculate payment sum (sum of payment amounts)
      const { paymentInSum, paymentOutSum } = invoice.payments?.reduce(
        (acc, p) => {
          const amount = Number(p.amountPaid) || 0;

          if (p.paymentType === "payment_in") {
            acc.paymentInSum += amount;
          } else if (p.paymentType === "payment_out") {
            acc.paymentOutSum += amount;
          }

          return acc;
        },
        { paymentInSum: 0, paymentOutSum: 0 }
      ) ?? { paymentInSum: 0, paymentOutSum: 0 };
      

      return {
          invoiceNo,
          vatInvoiceRefNo,
          paymentInSum,
          paymentOutSum,
          createdByUser: invoice.createdByUser ?? null,
          updatedByUser: invoice.updatedByUser ?? null,
          ...invoice.toJSON(),
          items: itemsWithStockSum
      };
  });
  
  return invoiceData;
}

export const getSaleCashReport = async () => {
  // 1. Get all sales grouped by date
  const invoices = await Invoice.findAll({
    attributes: [
      [fn("DATE", col("date")), "date"],
      [fn("SUM", col("grandTotal")), "totalGrandTotal"],
    ],
    where: { invoiceType: "sale" },
    group: [fn("DATE", col("date"))],
    raw: true,
  });

  // 2. Get all payments grouped by date
  const payments = await Payment.findAll({
    attributes: [
      [fn("DATE", col("paymentDate")), "date"],
      [fn("SUM", col("amountPaid")), "totalPaidAmount"],
    ],
    where: { paymentType: "payment_in" },
    group: [fn("DATE", col("paymentDate"))],
    raw: true,
  });

  // 3. Create a combined list of all dates from both tables
  const allDates = new Set([
    ...invoices.map((i) => i.date),
    ...payments.map((p) => p.date),
  ]);

  // 4. Convert to sorted array (chronologically)
  const sortedDates = Array.from(allDates).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // 5. Build quick lookup maps
  const invoiceMap = new Map(
    invoices.map((i) => [i.date, Number(i.totalGrandTotal)])
  );
  const paymentMap = new Map(
    payments.map((p) => [p.date, Number(p.totalPaidAmount)])
  );

  // 6. Combine both per date
  const combined = sortedDates.map((date) => ({
    date,
    saleAmount: invoiceMap.get(date) || 0,
    cashReceived: paymentMap.get(date) || 0,
  }));

  // 7. Calculate running due (cumulative)
  let runningDue = 0;
  const withDue = combined.map((row) => {
    const previousDue = runningDue;
    const dueAmount = previousDue + row.saleAmount - row.cashReceived;
    runningDue = dueAmount;

    return {
      ...row,
      previousDue,
      dueAmount,
    };
  });

  return withDue;
};

export const getBillReport = async () => {
  const data = await Invoice.findAll({
    include: [
      {
        model: InvoiceItem,
        include: [{ model: Warehouse, as: "warehouse"}],
        as: "items",
      },
      { model: Category, as: "category" },
      { model: Party, as: "party"},
      { model: Payment, as: "payments" },
    ],
  });

  if (!data || data.length === 0) throw { status: 400, message: "No Invoice found" };

  const invoiceData = await Promise.all(
    data.map(async (invoice) => {
      const { totalPaid } =
        invoice.payments?.reduce(
          (acc, p) => {
            if (p.paymentType === "bill_out") {
              acc.totalPaid += Number(p.amountPaid) ?? 0;
            }
            return acc;
          },
          { totalPaid: 0 }
        ) ?? { totalPaid: 0 };

      return {
        ...invoice.toJSON(), // <-- keep all invoice data
        totalPaid,
      };
    })
  );

  return invoiceData.filter(
    (invoice) => invoice.category?.name?.toLowerCase() === "bill"
  );

}

export const getProfitLossReport = async () => {
  const data = await InvoiceItem.findAll({
    include: [
      {
        model: Invoice,
        as: "invoice",
        where: {
          invoiceType: [
            "sale", "fix_sale", "unfix_sale", "wholesale_sale",
            "purchase", "fix_purchase", "unfix_purchase", "wholesale_purchase",
          ],
        },
        include: [{ model: Party, as: "party" }],
      },
      { model: Item, as: "item" },
    ],
  });

  if (!data || data.length === 0) {
    throw { status: 400, message: "No Invoice found" };
  }

  // Map grouped by itemId + unit + currency
  const itemsMap = new Map();

  for (const invoiceItem of data) {
    const invoice = invoiceItem.invoice;
    if (!invoice) continue;

    const item = invoiceItem.item;
    if (!item) continue;

    const currency = invoice.currency;
    const unit = invoiceItem.unit || "NA";
    const key = `${item.id}_${unit}_${currency}`;

    if (!itemsMap.has(key)) {
      itemsMap.set(key, {
        itemId: item.id,
        itemName: item.name,
        itemUnit: unit,
        totalPurchaseQty: 0,
        totalPurchaseAmount: 0,
        saleQty: 0,
        saleAmount: 0,
        avgPurchaseRate: 0,
        avgSaleRate: 0,
        profitLoss: 0,
        currency
      });
    }

    const entry = itemsMap.get(key);

    const qty = Number(invoiceItem.quantity) || 0;
    const price = Number(invoiceItem.price) || 0;
    const amount = qty * price;

    if (["sale", "fix_sale", "unfix_sale", "wholesale_sale"].includes(invoice.invoiceType)) {
      entry.saleQty += qty;
      entry.saleAmount += amount;
    } else if (["purchase", "fix_purchase", "unfix_purchase", "wholesale_purchase"].includes(invoice.invoiceType)) {
      entry.totalPurchaseQty += qty;
      entry.totalPurchaseAmount += amount;
    }

    // Recalculate aggregates
    entry.avgPurchaseRate =
      entry.totalPurchaseQty > 0 ? entry.totalPurchaseAmount / entry.totalPurchaseQty : 0;

    entry.avgSaleRate =
      entry.saleQty > 0 ? entry.saleAmount / entry.saleQty : 0;

    entry.profitLoss =
      entry.saleAmount - entry.saleQty * entry.avgPurchaseRate;
  }

  return Array.from(itemsMap.values());
};

export const getDailyProfitLossReport = async () => {
  const data = await InvoiceItem.findAll({
    include: [
      {
        model: Invoice,
        as: "invoice",
        where: {
          invoiceType: [
            "sale",
            "fix_sale",
            "unfix_sale",
            "wholesale_sale",
            "purchase",
            "fix_purchase",
            "unfix_purchase",
            "wholesale_purchase",
          ],
        },
        include: [{ model: Party, as: "party" }],
      },
      { model: Item, as: "item" },
    ],
    order: [[{ model: Invoice, as: "invoice" }, "date", "ASC"]],
  });

  if (!data || data.length === 0) {
    throw { status: 400, message: "No Invoice found" };
  }

  const itemsMap = new Map();

  for (const invoiceItem of data) {
    const invoice = invoiceItem.invoice;
    if (!invoice) continue;

    const date = new Date(invoice.date).toISOString().split("T")[0];
    const item = invoiceItem.item;
    if (!item) continue;

    const currency = invoice.currency;
    const unit = invoiceItem.unit || "NA";
    const itemKey = `${date}_${item.id}_${unit}_${currency}`;

    

    // init item bucket
    if (!itemsMap.has(itemKey)) {
      itemsMap.set(itemKey, {
        date,
        itemId: item.id,
        itemName: item.name,
        itemUnit: invoiceItem.unit,
        purchaseAmount: 0,
        purchaseQty: 0,
        saleQty: 0,
        saleAmount: 0,
        totalPurchaseQty: 0,
        totalPurchaseAmount: 0,
        avgPurchaseRate: 0,
        avgSaleRate: 0,
        profitLoss: 0,
        currency
      });
    }

    const entry = itemsMap.get(itemKey);

    const quantity = Number(invoiceItem.quantity) || 0;
    const amount = quantity * Number(invoiceItem.price || 0);

    if (
      ["sale", "fix_sale", "unfix_sale", "wholesale_sale"].includes(
        invoice.invoiceType
      )
    ) {
      entry.saleAmount += amount;
      entry.saleQty += quantity;
    } else if (
      [
        "purchase",
        "fix_purchase",
        "unfix_purchase",
        "wholesale_purchase",
      ].includes(invoice.invoiceType)
    ) {
      entry.purchaseAmount += amount;
      entry.purchaseQty += quantity;
    }

    // Optionally, get running purchase avg up to this date
    const { preRemainingPurchaseQty, preRemainingPurchaseAmount } =
      await getPurchaseSumUpToDate(invoice.date, entry.itemId, entry.itemUnit);

    entry.totalPurchaseAmount = entry.purchaseAmount + preRemainingPurchaseAmount;
    entry.totalPurchaseQty = entry.purchaseQty + preRemainingPurchaseQty;

    entry.avgPurchaseRate =
      entry.totalPurchaseQty > 0
        ? entry.totalPurchaseAmount / entry.totalPurchaseQty
        : 0;

    entry.avgSaleRate =
      entry.saleQty > 0 ? entry.saleAmount / entry.saleQty : 0;

    entry.profitLoss = (entry.avgSaleRate - entry.avgPurchaseRate) * entry.saleQty;
  }

  // Convert Map → Array
  const report = [];
  
    for (const entry of itemsMap.values()) {
      report.push(entry);
    }
 

  return report;
};

export const getPurchaseSumUpToDate = async (endDate, itemId, itemUnit) => {
  const invoiceWhere = {
    invoiceType: {
      [Op.in]: [
        "sale",
        "fix_sale",
        "unfix_sale",
        "wholesale_sale",
        "purchase",
        "fix_purchase",
        "unfix_purchase",
        "wholesale_purchase",
      ],
    },
  };

  // Add date filter if endDate exists
  if (endDate) {
    invoiceWhere.date = { [Op.lt]: endDate };
  }

  const data = await InvoiceItem.findAll({
    include: [
      {
        model: Invoice,
        as: "invoice",
        where: invoiceWhere,
        include: [{ model: Party, as: "party" }],
      },
      { model: Item, as: "item" },
    ],
    where: {
      unit: itemUnit,
      itemId,
    },
    raw: true,
    nest: true,
  });

  if (!data || data.length === 0) {
    return { preRemainingPurchaseQty: 0, preRemainingPurchaseAmount: 0 };
  }

  let totalPurchaseQty = 0;
  let totalPurchaseAmount = 0;
  let totalSaleQty = 0;

  data.forEach((row) => {
    const qty = Number(row.quantity) || 0;
    const amount = Number(row.subTotal) || qty * Number(row.price || 0);

    if (
      ["purchase", "fix_purchase", "unfix_purchase", "wholesale_purchase"].includes(
        row.invoice.invoiceType
      )
    ) {
      totalPurchaseQty += qty;
      totalPurchaseAmount += amount;
    } else if (
      ["sale", "fix_sale", "unfix_sale", "wholesale_sale"].includes(
        row.invoice.invoiceType
      )
    ) {
      totalSaleQty += qty;
    }
  });

  // Remaining stock using weighted average
  const remainingQty = totalPurchaseQty - totalSaleQty;
  const avgPurchaseRate =
    totalPurchaseQty > 0 ? totalPurchaseAmount / totalPurchaseQty : 0;
  const remainingAmount = remainingQty * avgPurchaseRate;

  return {
    preRemainingPurchaseQty: remainingQty,
    preRemainingPurchaseAmount: remainingAmount,
  };
};

const round2 = (n) => Math.round(n * 100) / 100;

export const getSalePaymentReport = async () => {
  const data = await Invoice.findAll({
    where: { invoiceType: "sale" },
    include: [
      { model: Party, as: "party" },
      { model: Payment, as: "payments" }
    ],
  });

  if (!data || data.length === 0) {
    throw { status: 400, message: "No Invoice found" };
  }

  const customerReport = {};

  data.forEach(invoice => {
    const customerName = invoice.party?.name ?? "Unknown Customer";

    const invoiceAmount = round2(Number(invoice.grandTotal) || 0);
    const discountAmount = round2(Number(invoice.discount) || 0);

    const totalPaidAmount = round2(
      invoice.payments?.reduce(
        (sum, p) => sum + (Number(p.amountPaid) || 0),
        0
      ) || 0
    );

    if (!customerReport[customerName]) {
      customerReport[customerName] = {
        totalSale: 0,
        totalPaid: 0,
        totalDiscount: 0,
        totalDue: 0
      };
    }

    customerReport[customerName].totalSale = round2(
      customerReport[customerName].totalSale + invoiceAmount
    );

    customerReport[customerName].totalPaid = round2(
      customerReport[customerName].totalPaid + totalPaidAmount
    );

    customerReport[customerName].totalDiscount = round2(
      customerReport[customerName].totalDiscount + discountAmount
    );

    customerReport[customerName].totalDue = round2(
      customerReport[customerName].totalDue +
      (invoiceAmount - discountAmount - totalPaidAmount)
    );
  });

  return Object.entries(customerReport).map(([customer, totals]) => ({
    customer,
    ...totals
  }));
};

export const createInvoice = async (req) => {
  const { items, ...invoiceData } = req.body;
  invoiceData.invoiceType = normalizeTransferInvoiceType(invoiceData.invoiceType);
  const requestedType = invoiceData.invoiceType?.toLowerCase();

  ensureMandatoryWholesalePaidFields({
    invoiceType: requestedType,
    isFullPaid: req.body.isFullPaid,
    bankId: req.body.bankId,
  });

  const t = await sequelize.transaction();
  try {
    const prefixMap = {
      purchase: "PCO",
      sale: "SLO",
      purchase_return: "PCR",
      sale_return: "SLR",
      fix_purchase: "FPC",
      unfix_purchase: "UPC",
      wholesale_purchase: "WPC",
      fix_sale: "FSL",
      unfix_sale: "USL",
      [UNFIX_TRANSFER_TYPE]: "UST",
      [LEGACY_UNFIX_TRANSFER_TYPE]: "UST",
      wholesale_sale: "WSL",
      clearance_bill: "CBO",
    };

    const prefix = prefixMap[invoiceData.invoiceType?.toLowerCase()] || "";
    invoiceData.prefix = prefix;

    const transferContext = await resolveUnfixSaleTransferContext({
      invoiceType: invoiceData.invoiceType,
      invoiceRefId: invoiceData.invoiceRefId,
      businessId: invoiceData.businessId,
      destinationPartyId: invoiceData.partyId,
      items,
      transaction: t,
    });
    const normalizedItems = normalizeInvoiceItemsForTransfer(items, transferContext);

    // Step 1: Create Invoice
    const invoice = await Invoice.create(invoiceData, { transaction: t });

    // Step 2: Create Invoice Items
    if (normalizedItems && Array.isArray(normalizedItems) && normalizedItems.length > 0) {
      const invoiceItems = normalizedItems.map((item) => ({
        invoiceId: invoice.id,
        itemId: item.itemId,
        uniqueId: item.uniqueId,
        warehouseId: item.warehouseId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        subTotal: item.subTotal,
        itemVat: item.itemVat,
        itemGrandTotal: item.itemGrandTotal,
        vatPercentage: item.vatPercentage
      }));

      await InvoiceItem.bulkCreate(invoiceItems, { transaction: t });
    }

    // Step 1.1: Generate sequential VAT Invoice No if applicable
    if (invoiceData.isVat === true) {
      const vatInvoiceNo = await lastVatInvoiceNumber(invoice, t);
      await invoice.update({ vatInvoiceNo }, { transaction: t });
    }

    if (invoiceData.isVat === false) {
      await invoice.update({ vatInvoiceNo: null, vatPercentage: 0 }, { transaction: t });
    }
    const type = invoice.invoiceType?.toLowerCase();
    const category = await Category.findByPk(req.body.categoryId);
    const {
      debitAmount,
      creditAmount,
      debitQuantity,
      creditQuantity,
      stockCurrency,
    } = getInvoiceLedgerPosting({
      invoiceType: invoice.invoiceType,
      grandTotal: invoice.grandTotal,
      items: normalizedItems,
      categoryName: category?.name,
    });

    // Step 3: create ledger
    if (invoice.system === 1 && !isUnfixTransferType(type)) {
      await Ledger.create(
        {
          businessId: invoice.businessId,
          categoryId: invoice.categoryId,
          transactionType: invoice.invoiceType,
          partyId: invoice.partyId,
          date: invoice.date,
          invoiceId: invoice.id,
          description: Array.isArray(normalizedItems)
          ? `${normalizedItems
              .map((item) => `${item.name} x${item.quantity} @${item.price}`)
              .join(', ')}${transferContext ? `<br />Transfer From: ${transferContext.sourceParty.name}` : ''}${invoice.note ? `<br />Note: ${invoice.note}` : ''}`
          : '',
          currency: req.body.currency,
          stockCurrency,
          debit: debitAmount,
          credit: creditAmount,
          debitQty: debitQuantity,
          creditQty: creditQuantity,
          createdBy: invoice.createdBy,
        },
        { transaction: t }
      );
    }
    
    
    if (invoice.system === 1 && AUTO_PURCHASE_STOCK_TYPES.includes(type)) {
      await createAutoStockEntries({
        invoice,
        items: normalizedItems,
        movementType: "stock_in",
        transaction: t,
        createLedgerEntry: type === "fix_purchase" ? false : shouldCreateAutoStockLedger(type, category?.name),
      });
    }

    if (invoice.system === 1 && AUTO_SALE_STOCK_TYPES.includes(type)) {
      if (!transferContext) {
        await ensureAutoSaleItemsReady({
          invoice,
          items: normalizedItems,
          categoryName: category?.name,
          transaction: t,
        });
      }

      await createAutoStockEntries({
        invoice,
        items: normalizedItems,
        movementType: "stock_out",
        transaction: t,
        createLedgerEntry: ["unfix_sale", "fix_sale"].includes(type) ? false : shouldCreateAutoStockLedger(type, category?.name),
      });
    }

    if (isUnfixTransferType(type) && transferContext) {
      await createUnfixSaleTransferSourceAdjustments({
        invoice,
        transferContext,
        categoryName: category?.name,
        transaction: t,
      });
    }

    if (category?.name && !["currency", "gold"].includes(category.name.toLowerCase())) {
      if ( invoice.invoiceType === "sale" && invoice.system === 1) {
        await Promise.all(
          normalizedItems.map(async (item) =>{
            const prefixMap = {
              stock_in: "STI",
              stock_out: "STO",
              stock_adj: "STA",
            };
            const movement = invoice.invoiceType === "sale" ? "stock_out" : "stock_in";
            const prefix = prefixMap[movement] || "";

            await Stock.create({
              businessId: invoice.businessId,
              date: invoice.date,
              prefix: prefix,
              invoiceType: invoice.invoiceType,
              invoiceId: invoice.id,
              partyId: invoice.partyId,
              categoryId: invoice.categoryId,
              itemId: item.itemId,
              movementType: invoice.invoiceType === "sale" ? "stock_out" : "stock_in",
              warehouseId: item.warehouseId,
              bankId: null,
              quantity: item.quantity,
              unit: item.unit,
              createdBy: invoice.createdBy
            }, { transaction: t });

          })
        );

        if ( req.body.paidTotal > 0 ){

          const paymentPrefixMap = {
            payment_in: "PMI",
            payment_out: "PMO",
            office_expense: "OEX",
          };
          const paymentPrefix = paymentPrefixMap["payment_in"] || "";

          const payment = await Payment.create({
            businessId: invoice.businessId,
            partyId: invoice.partyId,
            categoryId: invoice.categoryId,
            prefix: paymentPrefix,
            paymentType: "payment_in",
            invoiceId: invoice.id,
            paymentDate: invoice.date,
            currency: invoice.currency,
            amountPaid: req.body.paidTotal,
            bankId: req.body.bankId,
            createdBy: invoice.createdBy
          }, { transaction: t });

          await Ledger.create({
            businessId: invoice.businessId,
            categoryId: invoice.categoryId,
            transactionType: "payment_in",
            partyId: invoice.partyId,
            date: invoice.date,
            paymentId: payment.id,
            invoiceId: null,
            bankId: req.body.bankId,
            description: 'Received Payment',
            currency: invoice.currency,
            debit: req.body.paidTotal,
            credit: 0,
            createdBy: req.body.createdBy
          }, { transaction: t });

        }
      }
    }

    await syncInvoiceAutoPayment({
      invoice,
      paidTotal: req.body.paidTotal,
      isFullPaid: req.body.isFullPaid,
      bankId: req.body.bankId,
      transaction: t,
    });

    await t.commit();

    // Fetch and return invoice with items
    const createdInvoiceWithItems = await Invoice.findByPk(invoice.id, {
      include: [{ model: InvoiceItem, as: "items" }],
    });

    return createdInvoiceWithItems;
  } catch (error) {
    if (!t.finished) await t.rollback();
    throw error;
  }
};

export const getInvoiceById = async (id) => {
    const data = await Invoice.findByPk(id, { 
        include: [
          {
            model: InvoiceItem,
            include: [{ model: Warehouse, as: "warehouse"}],
            as: "items",
          },
          { model: Category, as: "category" },
          { model: Party, as: "party" },
          { model: Stock, as: "stocks" },
          { model: Payment, as: "payments" },
          { model: User, as: "createdByUser" },
          { model: User, as: "updatedByUser" },
        ], 
    });

    if (!data) {
        throw { status: 404, message: "Invoice not found" };
    }

    let invoiceNo = data.prefix + "-" + String(data.id).padStart(6, "0");
    let vatInvoiceRefNo = data.vatInvoiceNo > 0 ? data.prefix + "-" + String(data.vatInvoiceNo).padStart(6, "0") : null;

    let referenceInvoiceNo = null;
    let referencePartyName = null;
    if (Number(data.invoiceRefId) > 0) {
      const referenceInvoice = await Invoice.findByPk(data.invoiceRefId, {
        include: [{ model: Party, as: "party" }],
      });

      if (referenceInvoice) {
        referenceInvoiceNo = `${referenceInvoice.prefix}-${String(referenceInvoice.id).padStart(6, "0")}`;
        referencePartyName = referenceInvoice.party?.name ?? null;
      }
    }

    return {
    ...data.toJSON(),
    invoiceNo,
    vatInvoiceRefNo,
    referenceInvoiceNo,
    referencePartyName,
  };
}

export const updateInvoice = async (req) => {
    const { id } = req.body;
    const { items, ...invoiceData } = req.body;
    invoiceData.invoiceType = normalizeTransferInvoiceType(invoiceData.invoiceType);
    const requestedType = invoiceData.invoiceType?.toLowerCase();
    
    // Mapping Invoice Prefix
    invoiceData.prefix = invoicePrefixMapping(invoiceData);

    ensureMandatoryWholesalePaidFields({
      invoiceType: requestedType,
      isFullPaid: req.body.isFullPaid,
      bankId: req.body.bankId,
    });

    return sequelize.transaction(async (t) => {
    
        // Step 1: Find existing invoice
        const invoice = await Invoice.findByPk(id, { transaction: t });
        if (!invoice) {
          throw { status: 404, message: 'Invoice not found' };
        }

        const previousInvoiceType = invoice.invoiceType?.toLowerCase();

        // Step 2: Update invoice
        const updatedInvoice = await invoice.update(invoiceData, { transaction: t });
        const nextInvoiceType = updatedInvoice.invoiceType?.toLowerCase();
        const transferContext = await resolveUnfixSaleTransferContext({
          invoiceType: updatedInvoice.invoiceType,
          invoiceRefId: updatedInvoice.invoiceRefId,
          currentInvoiceId: updatedInvoice.id,
          businessId: updatedInvoice.businessId,
          destinationPartyId: updatedInvoice.partyId,
          items,
          transaction: t,
        });
        const normalizedItems = normalizeInvoiceItemsForTransfer(items, transferContext);

        // Step 3: Remove old items and stocks
        await InvoiceItem.destroy({ where: { invoiceId: id }, transaction: t });
        if (
          AUTO_STOCK_MANAGED_TYPES.includes(previousInvoiceType) ||
          AUTO_STOCK_MANAGED_TYPES.includes(nextInvoiceType)
        ) {
          await Stock.destroy({ where: { invoiceId: id }, transaction: t });
        }

        // Step 4: Re-create Invoice Items and Stocks
        if (normalizedItems && Array.isArray(normalizedItems)) {
            const invoiceItems = normalizedItems.map((item) => ({
                uniqueId: item.uniqueId,
                invoiceId: invoice.id,
                itemId: item.itemId,
                warehouseId: item.warehouseId,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                price: item.price,
                subTotal: item.subTotal,
                itemVat: item.itemVat,
                itemGrandTotal: item.itemGrandTotal,
                vatPercentage: item.vatPercentage
            }));

            await InvoiceItem.bulkCreate(invoiceItems, { transaction: t });
        }

        // Step 4.1: Generate sequential VAT Invoice No if applicable
        if (updatedInvoice.isVat === true && updatedInvoice.vatInvoiceNo === null) {
          const vatInvoiceNo = await lastVatInvoiceNumber(invoice, t);
          await invoice.update({ vatInvoiceNo }, { transaction: t });
        }

        if (updatedInvoice.isVat === false && updatedInvoice.vatInvoiceNo !== null) {
          await invoice.update({ vatInvoiceNo: null, vatPercentage: 0 }, { transaction: t });
        }

        // Step 5: update ledger
        // await Ledger.destroy({
        //     where: { invoiceId: invoice.id, transactionType: invoice.invoiceType },
        //     transaction: t,
        // });
        await Ledger.destroy({
            where: { invoiceId: invoice.id },
            transaction: t,
        });
        const type = invoice.invoiceType?.toLowerCase();
        const category = await Category.findByPk(req.body.categoryId);
        const {
          debitAmount,
          creditAmount,
          debitQuantity,
          creditQuantity,
          stockCurrency,
        } = getInvoiceLedgerPosting({
          invoiceType: invoice.invoiceType,
          grandTotal: invoice.grandTotal,
          items: normalizedItems,
          categoryName: category?.name,
        });

        // Step 3: create ledger
        if (!isUnfixTransferType(nextInvoiceType)) {
          await Ledger.create(
            {
              businessId: invoice.businessId,
              categoryId: invoice.categoryId,
              transactionType: invoice.invoiceType,
              partyId: invoice.partyId,
              date: invoice.date,
              invoiceId: invoice.id,
              description: Array.isArray(normalizedItems)
              ? `${normalizedItems
                  .map((item) => `${item.name} x${item.quantity} @${item.price}`)
                  .join('<br />')}${transferContext ? `<br />Transfer From: ${transferContext.sourceParty.name}` : ''}${invoice.note ? `<br />Note: ${invoice.note}` : ''}`
              : '',
              currency: req.body.currency,
              debit: debitAmount,
              credit: creditAmount,
              stockCurrency,
              debitQty: debitQuantity,
              creditQty: creditQuantity,
              createdBy: invoice.createdBy,
            },
            { transaction: t }
          );
        }


        if (updatedInvoice.system === 1 && AUTO_PURCHASE_STOCK_TYPES.includes(nextInvoiceType)) {
          await createAutoStockEntries({
            invoice: updatedInvoice,
            items: normalizedItems,
            movementType: "stock_in",
            transaction: t,
            updatedBy: updatedInvoice.updatedBy,
            createLedgerEntry: nextInvoiceType === "fix_purchase" ? false : shouldCreateAutoStockLedger(nextInvoiceType, category?.name),
          });
        }

        if (updatedInvoice.system === 1 && AUTO_SALE_STOCK_TYPES.includes(nextInvoiceType)) {
          if (!transferContext) {
            await ensureAutoSaleItemsReady({
              invoice: updatedInvoice,
              items: normalizedItems,
              categoryName: category?.name,
              transaction: t,
            });
          }

          await createAutoStockEntries({
            invoice: updatedInvoice,
            items: normalizedItems,
            movementType: "stock_out",
            transaction: t,
            updatedBy: updatedInvoice.updatedBy,
            createLedgerEntry: ["unfix_sale", "fix_sale"].includes(nextInvoiceType) ? false : shouldCreateAutoStockLedger(nextInvoiceType, category?.name),
          });
        }

        if (isUnfixTransferType(nextInvoiceType) && transferContext) {
          await createUnfixSaleTransferSourceAdjustments({
            invoice: updatedInvoice,
            transferContext,
            categoryName: category?.name,
            transaction: t,
            updatedBy: updatedInvoice.updatedBy,
          });
        }

        if (category?.name && !["currency", "gold"].includes(category.name.toLowerCase())) {
          // Create Stock Automatically if making sale
          if ( invoice.invoiceType === "sale") {
            await Promise.all(
              normalizedItems.map(async (item) =>{
                const prefixMap = {
                  stock_in: "STI",
                  stock_out: "STO",
                  stock_adj: "STA",
                };
                const movement = invoice.invoiceType === "sale" ? "stock_out" : "stock_in";
                const prefix = prefixMap[movement] || "";

                await Stock.create({
                  businessId: invoice.businessId,
                  date: invoice.date,
                  prefix: prefix,
                  invoiceType: invoice.invoiceType,
                  invoiceId: invoice.id,
                  partyId: invoice.partyId,
                  categoryId: invoice.categoryId,
                  itemId: item.itemId,
                  movementType: invoice.invoiceType === "sale" ? "stock_out" : "stock_in",
                  bankId: null,
                  quantity: item.quantity,
                  unit: item.unit,
                  warehouseId: item.warehouseId,
                  createdBy: invoice.createdBy,
                  updatedBy: invoice.updatedBy
                }, { transaction: t });

              })
            );

            // Create Payment Automatically if making partial or full payment with sale invoice
            if ( req.body.paidTotal > 0 ){
              const payment = await Payment.findOne({
                where: { invoiceId: invoice.id},
                transaction: t
              });

              const paymentPrefixMap = {
                payment_in: "PMI",
                payment_out: "PMO",
                office_expense: "OEX",
              };
              const paymentPrefix = paymentPrefixMap["payment_in"] || "";

              if ( payment ) {
                const updatedPayment = await payment.update({
                  businessId: invoice.businessId,
                  partyId: invoice.partyId,
                  categoryId: invoice.categoryId,
                  prefix: paymentPrefix,
                  paymentType: "payment_in",
                  invoiceId: invoice.id,
                  paymentDate: invoice.date,
                  currency: invoice.currency,
                  amountPaid: req.body.paidTotal,
                  bankId: req.body.bankId,
                  createdBy: invoice.createdBy,
                  updatedBy: invoice.updatedBy
                }, { transaction: t });

                const ledger = await Ledger.findOne({
                  where: { paymentId: updatedPayment.id},
                  transaction: t
                });

                await ledger.update({
                  businessId: invoice.businessId,
                  categoryId: invoice.categoryId,
                  transactionType: "payment_in",
                  partyId: invoice.partyId,
                  date: invoice.date,
                  paymentId: updatedPayment.id,
                  invoiceId: null,
                  bankId: req.body.bankId,
                  description: 'Received Payment',
                  currency: invoice.currency,
                  debit: req.body.paidTotal,
                  credit: 0,
                  createdBy: req.body.createdBy,
                  updatedBy: req.body.updatedBy
                }, { transaction: t });
              }
              else {
                const payment = await Payment.create({
                  businessId: invoice.businessId,
                  partyId: invoice.partyId,
                  categoryId: invoice.categoryId,
                  prefix: paymentPrefix,
                  paymentType: "payment_in",
                  invoiceId: invoice.id,
                  paymentDate: invoice.date,
                  currency: invoice.currency,
                  amountPaid: req.body.paidTotal,
                  bankId: req.body.bankId,
                  createdBy: invoice.createdBy
                }, { transaction: t });

                await Ledger.create({
                  businessId: invoice.businessId,
                  categoryId: invoice.categoryId,
                  transactionType: "payment_in",
                  partyId: invoice.partyId,
                  date: invoice.date,
                  paymentId: payment.id,
                  invoiceId: null,
                  bankId: req.body.bankId,
                  description: 'Received Payment',
                  currency: invoice.currency,
                  debit: req.body.paidTotal,
                  credit: 0,
                  createdBy: req.body.createdBy
                }, { transaction: t });
              }
            }
          }
        }

        await syncInvoiceAutoPayment({
          invoice: updatedInvoice,
          paidTotal: req.body.paidTotal,
          isFullPaid: req.body.isFullPaid,
          bankId: req.body.bankId,
          transaction: t,
          updatedBy: updatedInvoice.updatedBy,
        });

        // Step 5: Return updated invoice with its items
        const updatedInvoiceWithItems = await Invoice.findByPk(invoice.id, {
            include: [
              {
                model: InvoiceItem,
                as: "items",
              },
            ],
            transaction: t,
        });

        return updatedInvoiceWithItems;

      });

    
};

export const deleteInvoice = async (req) => {
  const { id } = req.params;

  if (!id) {
    throw new Error("Invoice ID is required");
  }

  const t = await sequelize.transaction();

  try {
    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: Payment, as: "payments" }, // include payments
        { model: Stock, as: "stocks" },     // include stocks
      ],
      transaction: t,
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.payments && invoice.payments.length > 0) {
      throw new Error("It has already payment references");
    }

    const stockIds = (invoice.stocks || []).map((stock) => stock.id).filter(Boolean);

    // Delete Invoice & Ledger
    await Ledger.destroy({
      where: {
        [Op.or]: [
          { invoiceId: invoice.id },
          stockIds.length > 0 ? { stockId: { [Op.in]: stockIds } } : null,
        ].filter(Boolean),
      },
      transaction: t,
    });

    if (stockIds.length > 0) {
      await Stock.destroy({
        where: { id: { [Op.in]: stockIds } },
        transaction: t,
      });
    }

    await InvoiceItem.destroy({
      where: { invoiceId: invoice.id },
      transaction: t,
    });

    await Invoice.destroy({
      where: { id },
      transaction: t,
    });

    await t.commit();

    return {
      success: true,
      message: "Invoice and its items deleted successfully",
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const lastVatInvoiceNumber = async (invoice, transaction) => {
  // Find the last VAT invoice for this business
  const lastVatInvoice = await Invoice.findOne({
    where: { businessId: invoice.businessId, isVat: true },
    order: [["vatInvoiceNo", "DESC"]],
    transaction: transaction
  });

  let nextNumber = 9329;

  if (lastVatInvoice && lastVatInvoice.vatInvoiceNo) {
    nextNumber = lastVatInvoice.vatInvoiceNo + 1;
  }

  // Pad with zeros → VAT-00001
  const vatInvoiceNo = nextNumber;
  return vatInvoiceNo;
}

export const invoicePrefixMapping = (invoiceData) => {
  const prefixMap = {
    purchase: "PCO",
    sale: "SLO",
    purchase_return: "PCR",
    sale_return: "SLR",
    fix_purchase: "FPC",
    unfix_purchase: "UPC",
    wholesale_purchase: "WPC",
    fix_sale: "FSL",
    unfix_sale: "USL",
    [UNFIX_TRANSFER_TYPE]: "UST",
    [LEGACY_UNFIX_TRANSFER_TYPE]: "UST",
    wholesale_sale: "WSL",
    clearance_bill: "CBO",
  };

  const prefix = prefixMap[invoiceData.invoiceType] || "";
  return prefix;
}

