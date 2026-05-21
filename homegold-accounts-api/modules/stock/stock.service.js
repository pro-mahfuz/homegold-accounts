import { Stock, Business, User, Invoice, InvoiceItem, Item, Bank, Category, Ledger, Warehouse, Party, sequelize } from "../../models/model.js";
import { fn, literal, Op } from "sequelize";

const STOCK_PREFIX_MAP = {
  stock_in: "STI",
  stock_out: "STO",
  stock_transfer: "STT",
  stock_transfer_return: "STR",
  damaged: "STA",
};
const STOCK_LEDGER_CATEGORY_NAMES = ["currency", "gold"];
const STOCK_IN_MOVEMENT_TYPES = ["stock_in", "stock_transfer_return"];
const STOCK_OUT_MOVEMENT_TYPES = ["stock_out", "stock_transfer"];
const STOCK_TRANSFER_MOVEMENT_TYPES = ["stock_transfer", "stock_transfer_return"];
const STOCK_REPORT_TRANSFER_TRANSACTION_TYPES = ["unfix_sale_transter", "unfix_transter"];
const STOCK_REPORT_LEDGER_TYPES = [
  "unfix_purchase",
  "fix_purchase",
  "unfix_sale",
  "fix_sale",
  ...STOCK_REPORT_TRANSFER_TRANSACTION_TYPES,
];

const getWarehouseAvailableStock = async ({
  businessId,
  itemId,
  unit,
  warehouseId,
  transaction,
}) => {
  const where = {
    businessId,
    itemId,
    unit,
    warehouseId,
  };

  const [summary] = await Stock.findAll({
    attributes: [
      [fn("SUM", literal(`CASE WHEN movementType IN ('stock_in', 'stock_transfer_return') THEN quantity ELSE 0 END`)), "totalIn"],
      [fn("SUM", literal(`CASE WHEN movementType IN ('stock_out', 'stock_transfer') THEN quantity ELSE 0 END`)), "totalOut"],
      [fn("SUM", literal(`CASE WHEN movementType = 'damaged' THEN quantity ELSE 0 END`)), "totalDamaged"],
    ],
    where,
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

const getPartyTransferAvailableStock = async ({
  businessId,
  itemId,
  unit,
  partyId,
  transaction,
}) => {
  const where = {
    businessId,
    itemId,
    unit,
    partyId,
  };

  const [summary] = await Stock.findAll({
    attributes: [
      [fn("SUM", literal(`CASE WHEN movementType = 'stock_transfer' THEN quantity ELSE 0 END`)), "totalTransferred"],
      [fn("SUM", literal(`CASE WHEN movementType = 'stock_transfer_return' THEN quantity ELSE 0 END`)), "totalReturned"],
    ],
    where,
    raw: true,
    transaction,
  });

  const totalTransferred = Number(summary?.totalTransferred) || 0;
  const totalReturned = Number(summary?.totalReturned) || 0;

  return {
    totalTransferred,
    totalReturned,
    availableQty: totalTransferred - totalReturned,
  };
};


export const getAllStock = async () => {
    const data = await Stock.findAll({
        include: [
            {
                model: Business,
                as: "business",
            },
            {
                model: Invoice,
                as: "invoice",
            },
            {
                model: Item,
                as: "item",
            },
            {
                model: Bank,
                as: "bank",
            },
            {
                model: Warehouse,
                as: "warehouse",
            },
            {
                model: Party,
                as: "party",
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
        order: [
            ["date", "DESC"],
        ]
    });
    if (!data || data.length === 0) throw { status: 400, message: "No stock found" };

    const stockData = data.map((stock) => {
        let invoiceRefNo = '';
        let stockRefNo = '';
        invoiceRefNo = stock.invoice ? stock.invoice.prefix + "-" + String(stock.invoice.id).padStart(6, '0') : '';
        stockRefNo = stock.prefix + "-" + String(stock.id).padStart(6, '0');
        return {
            ...stock.toJSON(),
            invoiceRefNo,
            stockRefNo,
            createdByUser: stock.createdByUser?.name ?? null,
            updatedByUser: stock.updatedByUser?.name ?? null,
        };
    });

    return stockData;
}

export const getStockReport = async () => {
  const ledgerRows = await Ledger.findAll({
    where: {
      isDeleted: false,
      invoiceId: { [Op.ne]: null },
      transactionType: {
        [Op.in]: STOCK_REPORT_LEDGER_TYPES,
      },
    },
    include: [
      {
        model: Party,
        as: "party",
        required: false,
      },
      {
        model: Stock,
        as: "stock",
        required: false,
        include: [
          { model: Item, as: "item", required: false },
          { model: Warehouse, as: "warehouse", required: false },
        ],
      },
      {
        model: Invoice,
        as: "invoice",
        required: true,
        include: [
          {
            model: InvoiceItem,
            as: "items",
            required: false,
            include: [
              { model: Item, as: "item", required: false },
              { model: Warehouse, as: "warehouse", required: false },
            ],
          },
        ],
      },
    ],
    order: [
      ["date", "ASC"],
      ["id", "ASC"],
    ],
  });

  if (!ledgerRows || ledgerRows.length === 0) {
    throw { status: 400, message: "No stock found" };
  }

  const grouped = new Map();

  ledgerRows.forEach((ledger) => {
    const transactionType = ledger.transactionType?.toLowerCase();
    const isTransferTransaction = STOCK_REPORT_TRANSFER_TRANSACTION_TYPES.includes(transactionType);

    if (isTransferTransaction && ledger.stock) {
      const partyId = Number(ledger.partyId) || 0;
      const warehouseId = Number(ledger.stock.warehouseId) || 0;
      const itemId = Number(ledger.stock.itemId) || 0;
      const unit = ledger.stock.unit ?? "";

      if (!itemId || !unit) {
        return;
      }

      const key = [partyId, warehouseId, itemId, unit].join("|");
      const existing = grouped.get(key) ?? {
        partyId: partyId || null,
        party: ledger.party ?? null,
        warehouseId: warehouseId || null,
        itemId: itemId || null,
        unit,
        warehouse: ledger.stock.warehouse ?? null,
        item: ledger.stock.item ?? null,
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
      };

      const quantity =
        Number(ledger.stock.quantity) ||
        Number(ledger.creditQty) ||
        Number(ledger.debitQty) ||
        0;

      if (Number(ledger.creditQty) > 0 || ledger.stock.movementType === "stock_transfer") {
        existing.totalTransferOut += quantity;
      }

      if (Number(ledger.debitQty) > 0 || ledger.stock.movementType === "stock_transfer_return") {
        existing.totalTransferReturn += quantity;
      }

      grouped.set(key, existing);
      return;
    }

    const invoiceItems = ledger.invoice?.items ?? [];

    invoiceItems.forEach((invoiceItem) => {
      const partyId = Number(ledger.partyId) || 0;
      const warehouseId = Number(invoiceItem.warehouseId) || 0;
      const itemId = Number(invoiceItem.itemId) || 0;
      const unit = invoiceItem.unit ?? "";
      const key = [partyId, warehouseId, itemId, unit].join("|");

      const existing = grouped.get(key) ?? {
        partyId: partyId || null,
        party: ledger.party ?? null,
        warehouseId: warehouseId || null,
        itemId: itemId || null,
        unit,
        warehouse: invoiceItem.warehouse ?? null,
        item: invoiceItem.item ?? null,
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
      };

      const quantity = Number(invoiceItem.quantity) || 0;

      if (transactionType === "unfix_purchase") {
        existing.totalUnfixPurchase += quantity;
      }
      if (transactionType === "fix_purchase") {
        existing.totalFixPurchase += quantity;
      }
      if (transactionType === "unfix_sale") {
        existing.totalUnfixSale += quantity;
      }
      if (transactionType === "fix_sale") {
        existing.totalFixSale += quantity;
      }

      grouped.set(key, existing);
    });
  });

  return Array.from(grouped.values()).map((entry) => {
    const totalUnfixPurchase = Number(entry.totalUnfixPurchase) || 0;
    const totalFixPurchase = Number(entry.totalFixPurchase) || 0;
    const totalUnfixSale = Number(entry.totalUnfixSale) || 0;
    const totalFixSale = Number(entry.totalFixSale) || 0;
    const totalStockIn = Number(entry.totalStockIn) || 0;
    const totalStockOut = Number(entry.totalStockOut) || 0;
    const totalTransferOut = Number(entry.totalTransferOut) || 0;
    const totalTransferReturn = Number(entry.totalTransferReturn) || 0;
    const totalDamaged = Number(entry.totalDamaged) || 0;
    const totalIn = totalUnfixPurchase + totalTransferReturn + (Number(entry.totalIn) || 0);
    const totalOut = totalFixSale + totalTransferOut + (Number(entry.totalOut) || 0);
    const currentStock = totalUnfixPurchase - totalFixSale;
    const transferStock = totalTransferOut - totalTransferReturn;
    const totalStock = currentStock + transferStock;

    return {
      ...entry,
      totalUnfixPurchase,
      totalFixPurchase,
      totalUnfixSale,
      totalFixSale,
      totalStockIn,
      totalStockOut,
      totalTransferOut,
      totalTransferReturn,
      totalIn,
      totalOut,
      totalDamaged,
      currentStock,
      transferStock,
      totalStock,
      availableQty: currentStock,
    };
  });
};

export const getOverallStockReport = async () => {
  const details = await getStockReport();

  const summary = details.reduce(
    (acc, row) => {
      acc.totalStockIn += Number(row.totalStockIn) || 0;
      acc.totalStockOut += Number(row.totalStockOut) || 0;
      acc.totalTransferOut += Number(row.totalTransferOut) || 0;
      acc.totalTransferReturn += Number(row.totalTransferReturn) || 0;
      acc.totalIn += Number(row.totalIn) || 0;
      acc.totalOut += Number(row.totalOut) || 0;
      acc.totalDamaged += Number(row.totalDamaged) || 0;
      acc.totalCurrentStock += Number(row.currentStock) || 0;
      acc.totalTransferStock += Number(row.transferStock) || 0;
      acc.totalStock += Number(row.totalStock) || 0;
      acc.totalAvailable += Number(row.currentStock) || 0;
      return acc;
    },
    {
      totalItems: details.length,
      totalStockIn: 0,
      totalStockOut: 0,
      totalTransferOut: 0,
      totalTransferReturn: 0,
      totalIn: 0,
      totalOut: 0,
      totalDamaged: 0,
      totalCurrentStock: 0,
      totalTransferStock: 0,
      totalStock: 0,
      totalAvailable: 0,
    }
  );

  return {
    summary,
    details,
  };
};

export const createStockTransfer = async (req) => {
  const t = await sequelize.transaction();

  try {
    const {
      businessId,
      date,
      movementType = "stock_transfer",
      categoryId,
      invoiceId = null,
      itemId,
      unit,
      quantity,
      warehouseId = null,
      fromWarehouseId,
      partyId = null,
      createdBy = null,
      updatedBy = null,
    } = req.body;

    const normalizedMovementType =
      movementType === "stock_transfer_return" ? "stock_transfer_return" : "stock_transfer";
    const isTransferReturn = normalizedMovementType === "stock_transfer_return";
    const normalizedQty = Number(quantity) || 0;
    const normalizedWarehouseId = Number(warehouseId ?? fromWarehouseId) || 0;
    const normalizedPartyId = Number(partyId) > 0 ? Number(partyId) : null;
    const normalizedInvoiceId = Number(invoiceId) > 0 ? Number(invoiceId) : null;
    const normalizedBusinessId = Number(businessId) || 0;

    if (normalizedQty <= 0) {
      throw { status: 400, message: "Transfer quantity must be greater than zero." };
    }

    if (!normalizedWarehouseId) {
      throw {
        status: 400,
        message: isTransferReturn ? "Return warehouse is required." : "Source warehouse is required.",
      };
    }

    const normalizedItemId = Number(itemId) || 0;
    if (!normalizedItemId) {
      throw { status: 400, message: "Item is required for stock transfer." };
    }

    if (!unit) {
      throw { status: 400, message: "Unit is required for stock transfer." };
    }
    if (isTransferReturn && !normalizedPartyId) {
      throw { status: 400, message: "Party is required for stock transfer return." };
    }

    const [item, warehouse, party] = await Promise.all([
      Item.findByPk(normalizedItemId, { transaction: t }),
      Warehouse.findByPk(normalizedWarehouseId, { transaction: t }),
      normalizedPartyId ? Party.findByPk(normalizedPartyId, { transaction: t }) : Promise.resolve(null),
    ]);

    const normalizedCategoryId = Number(categoryId) > 0
      ? Number(categoryId)
      : Number(item?.categoryId) > 0
        ? Number(item.categoryId)
        : null;
    const category = normalizedCategoryId
      ? await Category.findByPk(normalizedCategoryId, { transaction: t })
      : null;

    if (!item) {
      throw { status: 404, message: "Item not found." };
    }
    if (!warehouse) {
      throw {
        status: 404,
        message: isTransferReturn ? "Return warehouse not found." : "Source warehouse not found.",
      };
    }
    if (normalizedPartyId && !party) {
      throw { status: 404, message: "Party not found." };
    }
    if (normalizedCategoryId && !category) {
      throw { status: 404, message: "Category not found." };
    }

    let stockSummary = null;
    if (isTransferReturn) {
      stockSummary = await getPartyTransferAvailableStock({
        businessId: normalizedBusinessId,
        itemId: normalizedItemId,
        unit,
        partyId: normalizedPartyId,
        transaction: t,
      });

      if (stockSummary.availableQty < normalizedQty) {
        throw {
          status: 400,
          message: `Insufficient transferred stock with party. Available: ${stockSummary.availableQty.toFixed(2)} ${unit}`,
        };
      }
    } else {
      stockSummary = await getWarehouseAvailableStock({
        businessId: normalizedBusinessId,
        itemId: normalizedItemId,
        unit,
        warehouseId: normalizedWarehouseId,
        transaction: t,
      });

      if (stockSummary.availableQty < normalizedQty) {
        throw {
          status: 400,
          message: `Insufficient stock in source warehouse. Available: ${stockSummary.availableQty.toFixed(2)} ${unit}`,
        };
      }
    }

    const commonPayload = {
      businessId: normalizedBusinessId,
      date,
      invoiceType: normalizedMovementType,
      invoiceId: normalizedInvoiceId,
      partyId: normalizedPartyId,
      categoryId: normalizedCategoryId,
      itemId: normalizedItemId,
      bankId: null,
      quantity: normalizedQty,
      unit,
      createdBy,
      updatedBy,
    };

    const stockTransfer = await Stock.create(
      {
        ...commonPayload,
        prefix: STOCK_PREFIX_MAP[normalizedMovementType],
        movementType: normalizedMovementType,
        warehouseId: normalizedWarehouseId,
      },
      { transaction: t }
    );


    if (category && STOCK_LEDGER_CATEGORY_NAMES.includes(category.name.toLowerCase())) {
      const partyName = party?.name ?? "N/A";
      await Ledger.bulkCreate(
        [
          {
            businessId: normalizedBusinessId,
            categoryId: normalizedCategoryId,
            transactionType: normalizedMovementType,
            partyId: normalizedPartyId,
            date,
            invoiceId: normalizedInvoiceId,
            stockId: stockTransfer.id,
            description: isTransferReturn ? `Transfer return from ${partyName}` : `Transfer to ${partyName}`,
            currency: null,
            stockCurrency: item.name,
            debitQty: isTransferReturn ? normalizedQty : 0,
            creditQty: isTransferReturn ? 0 : normalizedQty,
            createdBy,
            updatedBy,
          },
        ],
        { transaction: t }
      );
    }

    await t.commit();

    return {
      transferId: stockTransfer.id,
      movementType: normalizedMovementType,
      itemId: normalizedItemId,
      itemName: item.name,
      warehouseId: normalizedWarehouseId,
      warehouseName: warehouse.name,
      invoiceId: normalizedInvoiceId,
      partyId: normalizedPartyId,
      partyName: party?.name ?? null,
      quantity: normalizedQty,
      unit,
      availableBeforeTransfer: stockSummary.availableQty,
      availableAfterTransfer: stockSummary.availableQty - normalizedQty,
    };
  } catch (err) {
    if (!t.finished) await t.rollback();
    throw err;
  }
};

export const createStock = async (req) => {
  if (STOCK_TRANSFER_MOVEMENT_TYPES.includes(req.body.movementType)) {
    return createStockTransfer(req);
  }

  const t = await sequelize.transaction();

  try {
    const prefix = STOCK_PREFIX_MAP[req.body.movementType] || "";
    req.body.prefix = prefix;

    if (!req.body.partyId) {
      req.body.partyId = null;
    }

    const data = await Stock.create(req.body, { transaction: t });

    let debitQty = 0;
    let creditQty = 0;
    if (STOCK_OUT_MOVEMENT_TYPES.includes(req.body.movementType) || req.body.movementType === 'damaged') {
      creditQty = req.body.quantity;
    } else if (STOCK_IN_MOVEMENT_TYPES.includes(req.body.movementType)) {
      debitQty = req.body.quantity;
    }

    const item = await Item.findByPk(req.body.itemId);
    if (!item) throw { status: 400, message: "Item not found" };

    const category = await Category.findByPk(req.body.categoryId);
    // if (!category) throw { status: 400, message: "Category not found" };

    if (category && ["currency", "gold"].includes(category.name.toLowerCase())) {
      await Ledger.create({
        businessId: req.body.businessId,
        categoryId: category ? category.id : req.body.categoryId,
        invoiceId: req.body.invoiceId,
        transactionType: req.body.movementType,
        partyId: req.body.partyId,
        bankId: req.body.bankId,
        date: req.body.date,
        stockId: data.id,
        debitQty: debitQty,
        creditQty: creditQty,
        currency: null,
        stockCurrency: item.name,
        createdBy: req.body.createdBy
      }, { transaction: t });
    }

    await t.commit();
      
    return data;

  } catch (err) {
    await t.rollback();
    throw err;
  }
}

export const getStockById = async (id) => {
    const data = await Stock.findByPk(id, {
      include: [
        { model: Item, as: "item" },
        { model: Warehouse, as: "warehouse" },
        { model: Party, as: "party" },
      ],
    });
    if (!data) {
        throw { status: 404, message: "Stock not found" };
    }
    return data;
}

export const updateStock = async (req) => {
  const t = await sequelize.transaction();

  try {
    // Find the stock by ID
    const stock = await Stock.findByPk(req.body.id, { transaction: t });
    if (!stock) {
      throw { status: 404, message: "Stock not found" };
    }

    req.body.prefix = STOCK_PREFIX_MAP[req.body.movementType] || stock.prefix;

    if (!req.body.partyId) {
      req.body.partyId = null;
    }
    if (!req.body.invoiceId) {
      req.body.invoiceId = null;
    }
    if (!req.body.warehouseId) {
      req.body.warehouseId = null;
    }
    if (!req.body.bankId) {
      req.body.bankId = null;
    }

    // Update stock with request body data
    await stock.update(req.body, { transaction: t });

    // Calculate debit and credit quantities based on movementType
    let debitQty = 0;
    let creditQty = 0;
    if (STOCK_OUT_MOVEMENT_TYPES.includes(req.body.movementType) || req.body.movementType === "damaged") {
      creditQty = req.body.quantity;
    } else if (STOCK_IN_MOVEMENT_TYPES.includes(req.body.movementType)) {
      debitQty = req.body.quantity;
    }

    // Find related item
    const item = await Item.findByPk(req.body.itemId, { transaction: t });
    if (!item) {
      throw { status: 404, message: "Item not found" };
    }

    
    const category = await Category.findByPk(req.body.categoryId, { transaction: t });
    const ledger = await Ledger.findOne({
      where: { stockId: req.body.id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    // Update the ledger instance
    if (category && ["currency", "gold"].includes(category.name.toLowerCase())) {
      if (!ledger) {
        await Ledger.create({
          businessId: req.body.businessId,
          categoryId: category ? category.id : req.body.categoryId,
          invoiceId: req.body.invoiceId,
          transactionType: req.body.movementType,
          partyId: req.body.partyId,
          bankId: req.body.bankId,
          date: req.body.date,
          stockId: stock.id,
          debitQty,
          creditQty,
          currency: null,
          stockCurrency: item.name,
          updatedBy: req.body.updatedBy
        }, { transaction: t });
      } else {
        await ledger.update({
          businessId: req.body.businessId,
          categoryId: category ? category.id : req.body.categoryId,
          invoiceId: req.body.invoiceId,
          transactionType: req.body.movementType,
          partyId: req.body.partyId,
          bankId: req.body.bankId,
          date: req.body.date,
          stockId: stock.id,
          debitQty,
          creditQty,
          currency: null,
          stockCurrency: item.name,
          updatedBy: req.body.updatedBy
        }, { transaction: t });
      }
    } else if (ledger) {
      await ledger.destroy({ transaction: t });
    }

    // Commit transaction
    await t.commit();

    return stock;

  } catch (error) {
    // Rollback on error
    await t.rollback();
    throw error;
  }
};


export const deleteStock = async (id) => {

  const t = await sequelize.transaction();

  const stock = await Stock.findByPk(id);
  if (!stock) {
    throw new Error("Stock not found");
  }

  try {
    const ledger = await Ledger.findOne({
      where: { stockId: stock.id },
      transaction: t,
    });

    if (ledger) {
      await ledger.destroy({ transaction: t });
    }

    await stock.destroy({ transaction: t });

    await t.commit();
    return { success: true, message: "Stock and ledger deleted successfully" };

  } catch (err) {
    if (!t.finished) await t.rollback();
    throw err;
  }
}
