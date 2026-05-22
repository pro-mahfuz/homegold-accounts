import { Payment, User, Party, Category, Invoice, Bank, Ledger, sequelize } from "../../models/model.js";
import { Op, Sequelize } from "sequelize";

const PAYMENT_CREDIT_TYPES = new Set([
  "payment_out",
  "advance_received",
  "receivable",
  "advance_payment_deduct",
  "capital_in",
  "discount_sale",
  "deposit",
  "premium_received",
  "premium_paid",
]);

const PAYMENT_DEBIT_TYPES = new Set([
  "payment_in",
  "advance_payment",
  "payable",
  "advance_received_deduct",
  "capital_out",
  "discount_purchase",
  "withdraw",
  "premium_received",
  "premium_paid",
  "bill_out",
]);

const getPaymentEntryAmounts = (paymentType, amountPaid) => {
  const normalizedAmount = Number(amountPaid) || 0;

  return {
    debit: PAYMENT_DEBIT_TYPES.has(paymentType) ? normalizedAmount : 0,
    credit: PAYMENT_CREDIT_TYPES.has(paymentType) ? normalizedAmount : 0,
  };
};

// Get All Payments
export const getAllPayment = async () => {
  const data = await Payment.findAll({
    include: [
      {
        model: Party,
        as: "party",
      },
      {
        model: Category,
        as: "category",
      },
      {
        model: Invoice,
        as: "invoice",
        attributes: ["id", "prefix", "vatInvoiceNo", "isVat"], // 👈 ensure vatInvoiceNo is selected
      },
      {
        model: User,
        as: "createdByUser",
      },
      {
        model: User,
        as: "updatedByUser",
      },
      {
        model: Bank,
        as: "bank",
      },
    ]
  });

  if (!data || data.length === 0) throw { status: 400, message: "No payment found" };

  const paymentData = data.map(payment => {
    const paymentRefNo = payment.prefix + "-" + String(payment.id).padStart(6, '0');
    const invoiceRefNo = payment.invoice ? payment.invoice.prefix + "-" + String(payment.invoice.id).padStart(6, '0') : '';
    const vatInvoiceRefNo = payment.invoice?.vatInvoiceNo ? payment.invoice.prefix + "-" + String(payment.invoice?.vatInvoiceNo).padStart(6, '0') : '';
    const { debit, credit } = getPaymentEntryAmounts(payment.paymentType, payment.amountPaid);
    return {
      ...payment.toJSON(),
      paymentRefNo,
      invoiceRefNo,
      vatInvoiceRefNo,
      debit,
      credit,
      createdByUser: payment.createdByUser?.name ?? null,
      updatedByUser: payment.updatedByUser?.name ?? null,
    };
  });

  return paymentData;
};

export const getAllPaymentWithPagination = async (
  page = 1,
  limit = 10,
  system = 1,
  filterText = null
) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;
  const normalizedFilterText = String(filterText || "").trim();

  // Always filter by system
  const whereClause = { system };

  // Build search filters if filterText exists
  if (normalizedFilterText) {
    const normalizedPaymentTypeSearch = normalizedFilterText
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
    const orConditions = [
      { paymentDate: { [Op.like]: `%${normalizedFilterText}%` } },
      { prefix: { [Op.like]: `%${normalizedFilterText}%` } },
      { paymentType: { [Op.like]: `%${normalizedFilterText}%` } },
      { paymentType: { [Op.like]: `%${normalizedPaymentTypeSearch}%` } },
      { currency: { [Op.like]: `%${normalizedFilterText}%` } },
      { "$party.name$": { [Op.like]: `%${normalizedFilterText}%` } },
      { "$invoice.prefix$": { [Op.like]: `%${normalizedFilterText}%` } },
    ];

    const numericFilterValue = Number(normalizedFilterText);
    if (!Number.isNaN(numericFilterValue) && numericFilterValue > 0) {
      orConditions.push(
        { id: { [Op.eq]: numericFilterValue } },
        { "$invoice.id$": { [Op.eq]: numericFilterValue } },
        { "$invoice.vatInvoiceNo$": { [Op.eq]: numericFilterValue } },
        { partyId: { [Op.eq]: numericFilterValue } }
      );
    }

    const paymentReferenceMatch = normalizedFilterText.match(/^([A-Za-z]+)[-\s]?0*([0-9]+)$/);
    if (paymentReferenceMatch) {
      const [, prefixPart, referenceNumberPart] = paymentReferenceMatch;
      const referenceNumber = Number(referenceNumberPart) || 0;

      if (referenceNumber > 0) {
        orConditions.push(
          {
            [Op.and]: [
              { prefix: { [Op.like]: `${prefixPart}%` } },
              { id: { [Op.eq]: referenceNumber } },
            ],
          },
          {
            [Op.and]: [
              { "$invoice.prefix$": { [Op.like]: `${prefixPart}%` } },
              { "$invoice.id$": { [Op.eq]: referenceNumber } },
            ],
          },
          {
            [Op.and]: [
              { "$invoice.prefix$": { [Op.like]: `${prefixPart}%` } },
              { "$invoice.vatInvoiceNo$": { [Op.eq]: referenceNumber } },
            ],
          }
        );
      }
    }

    whereClause[Op.or] = orConditions;
  }

  // Shared includes (for both count + findAll)
  const include = [
    { model: Party, as: "party", required: false },
    { model: Category, as: "category" },
    {
      model: Invoice,
      as: "invoice",
      attributes: ["id", "prefix", "vatInvoiceNo", "isVat"],
      required: false,
    },
    { model: User, as: "createdByUser" },
    { model: User, as: "updatedByUser" },
    { model: Bank, as: "bank" },
  ];

  // Count total results (MUST include joins for alias filters)
  const count = await Payment.count({
    where: whereClause,
    include,
    distinct: true,
  });

  const totalPages = Math.max(Math.ceil(count / limit), 1);
  if (page > totalPages) page = totalPages;
  const offset = (page - 1) * limit;

  // Fetch paginated data
  const data = await Payment.findAll({
    where: whereClause,
    include,
    order: [["id", "DESC"]],
    limit,
    offset,
  });

  if (!data?.length) {
    return {
      success: true,
      totalItems: 0,
      totalPages: 0,
      currentPage: page,
      payments: [],
    };
  }

  // Enrich and format payments
  const payments = data.map((payment) => {
    const paymentRefNo = `${payment.prefix}-${String(payment.id).padStart(6, "0")}`;
    const invoiceRefNo = payment.invoice
      ? `${payment.invoice.prefix}-${String(payment.invoice.id).padStart(6, "0")}`
      : "";
    const vatInvoiceRefNo = payment.invoice?.vatInvoiceNo
      ? `${payment.invoice.prefix}-${String(payment.invoice.vatInvoiceNo).padStart(6, "0")}`
      : "";
    const { debit, credit } = getPaymentEntryAmounts(payment.paymentType, payment.amountPaid);

    return {
      ...payment.toJSON(),
      paymentRefNo,
      invoiceRefNo,
      vatInvoiceRefNo,
      debit,
      credit,
      createdByUser: payment.createdByUser?.name ?? null,
      updatedByUser: payment.updatedByUser?.name ?? null,
    };
  });

  return {
    success: true,
    totalItems: count,
    totalPages,
    currentPage: page,
    payments,
  };
};


// Create Payment
export const createPayment = async (req) => {

  const t = await sequelize.transaction();

  try {
    // Prefix mapping
    const prefixMap = {
      payment_in: "PMI",
      payment_out: "PMO",
      office_expense: "OEX",
      advance_received: "ADR",
      advance_payment: "ADP",
      advance_received_deduct: "ARD",
      advance_payment_deduct: "APD",
      capital_in: "CPI",
      capital_out: "CPO",
      bill_out: "BLO",
      discount_sale: "DCS",
      discount_purchase: "DCP",
      premium_received: "PMR",
      premium_paid: "PMR",
      deposit: "DEP",
      withdraw: "WDR",
      payable: "PAY",
      receivable: "REV"
    };

    const prefix = prefixMap[req.body.paymentType];
    if (!prefix) {
      throw { status: 400, message: `Invalid paymentType: ${req.body.paymentType}` };
    }
    req.body.prefix = prefix;
    // Create Payment
    const payment = await Payment.create(req.body, { transaction: t });
    console.log("paymentData: ", payment);

    if (
      [
        "payment_in",
        "advance_received",
        "payable",
        "receivable",
        "advance_payment_deduct",
        "capital_in",
        "discount_sale",
        "deposit",
        "premium_received",
        "premium_paid",
        "payment_out",
        "advance_payment",
        "advance_received_deduct",
        "capital_out",
        "discount_purchase",
        "withdraw",
        "premium_received",
        "premium_paid",
        "bill_out"
      ].includes(req.body.paymentType)
    ) {
      // Only create Ledger for payment types (not pure expenses)
      const { debit: debitAmount, credit: creditAmount } = getPaymentEntryAmounts(
        req.body.paymentType,
        req.body.amountPaid
      );

      // Invoice Ref
      if (req.body.invoiceId){
        const invoice = req.body.invoiceId
        ? await Invoice.findByPk(req.body.invoiceId)
        : null;

        const invoiceNo = invoice
        ? `${invoice.prefix}-${String(invoice.id).padStart(6, "0")}`
        : "";
      }
      
      // Create Ledger entry
      await Ledger.create(
        {
          businessId: req.body.businessId,
          categoryId: req.body.categoryId > 0 ? req.body.categoryId : null,
          transactionType: req.body.paymentType,
          partyId: req.body.partyId,
          date: req.body.paymentDate,
          paymentId: payment.id,
          invoiceId: req.body.invoiceId ?? null,
          bankId: req.body.bankId ?? null,
          description: req.body.note ?? "", // fallback if note empty
          currency: req.body.currency,
          debit: debitAmount,
          credit: creditAmount,
          createdBy: req.body.createdBy,
        },
        { transaction: t }
      );
    }

    await t.commit();

    // Generate formatted reference
    const paymentRefNo = `${payment.prefix}-${String(payment.id).padStart(6, "0")}`;

    return {
      ...payment.toJSON(),
      paymentRefNo,
    };
  } catch (error) {
    if (!t.finished) await t.rollback();
    throw error;
  }
};


// Get Payment By ID
export const getPaymentById = async (id) => {
  const data = await Payment.findByPk(id);
  if (!data) {
    throw { status: 404, message: "Payment not found" };
  }
  return data;
};

// Update Payment
export const updatePayment = async (req) => {
  
  const existingPayment = await Payment.findByPk(req.body.id, {
    include: [{ model: Invoice, as: "invoice" }],
  });

  if (!existingPayment) {
    throw { status: 404, message: "Payment not found" };
  }

  const t = await sequelize.transaction();

  try {
    // Prefix mapping
    const prefixMap = {
      payment_in: "PMI",
      payment_out: "PMO",
      office_expense: "OEX",
      advance_received: "ADR",
      advance_payment: "ADP",
      advance_received_deduct: "ARD",
      advance_payment_deduct: "APD",
      capital_in: "CPI",
      capital_out: "CPO",
      bill_out: "BLO",
      discount_sale: "DCS",
      discount_purchase: "DCP",
      premium_received: "PMR",
      premium_paid: "PMP",
      deposit: "DEP",
      withdraw: "WDR",
      payable: "PAY",
      receivable: "REV"
    };

    const prefix = prefixMap[req.body.paymentType];
    if (!prefix) {
      throw { status: 400, message: `Invalid paymentType: ${req.body.paymentType}` };
    }

    req.body.prefix = prefix;

    // Update payment
    const updatedPayment = await existingPayment.update(req.body, { transaction: t });

    

    if (
      [
        "payment_in",
        "payable",
        "receivable",
        "advance_received",
        "advance_payment_deduct",
        "capital_in",
        "discount_sale",
        "deposit",
        "premium_received",
        "premium_paid",
        "payment_out",
        "advance_payment",
        "advance_received_deduct",
        "capital_out",
        "discount_purchase",
        "withdraw",
        "premium_received",
        "premium_paid",
        "bill_out"
      ].includes(req.body.paymentType)
    ) {
      const { debit: debitAmount, credit: creditAmount } = getPaymentEntryAmounts(
        req.body.paymentType,
        req.body.amountPaid
      );

      // Ledger entry
      let ledger = await Ledger.findOne({
        where: { paymentId: req.body.id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (ledger == null) {
        ledger = await Ledger.create(
          {
            businessId: req.body.businessId,
            categoryId: req.body.categoryId > 0 ? req.body.categoryId : null,
            transactionType: req.body.paymentType,
            partyId: req.body.partyId,
            date: req.body.paymentDate,
            paymentId: updatedPayment.id,
            invoiceId: req.body.invoiceId ?? null,
            bankId: req.body.bankId ?? null,
            description: req.body.note ?? "",
            currency: req.body.currency,
            debit: debitAmount,
            credit: creditAmount,
            createdBy: req.body.createdBy,
          },
          { transaction: t }
        );

        
      } else {

        console.log("ledger-", ledger)
        await ledger.update(
          {
            businessId: req.body.businessId,
            categoryId: req.body.categoryId > 0 ? req.body.categoryId : null,
            transactionType: req.body.paymentType,
            partyId: req.body.partyId,
            date: req.body.paymentDate,
            paymentId: updatedPayment.id,
            invoiceId: req.body.invoiceId ?? null,
            description: req.body.note ?? "",
            bankId: req.body.bankId ?? null,
            currency: req.body.currency,
            debit: debitAmount,
            credit: creditAmount,
            updatedBy: req.body.updatedBy,
          },
          { transaction: t }
        );
      }

      
    }

    await t.commit();
    return updatedPayment;
  } catch (err) {
    if (!t.finished) await t.rollback();
    throw err;
  }
};


// Delete Payment
export const deletePayment = async (id) => {
  const t = await sequelize.transaction();

  const payment = await Payment.findByPk(id);
  if (!payment) {
    throw new Error("Payment not found");
  }

  try {
    const ledger = await Ledger.findOne({
      where: { paymentId: payment.id },
      transaction: t,
    });

    if (ledger) {
      await ledger.destroy({ transaction: t });
    }

    await payment.destroy({ transaction: t });

    await t.commit();
    return { success: true, message: "Payment and ledger deleted successfully" };

  } catch (err) {
    if (!t.finished) await t.rollback();
    throw err;
  }
};


export const getAdvanceSums = async (partyId) => {
  if (!partyId) throw new Error("partyId is required");

  const ledgerData = await Ledger.findAll({
    where: {
      partyId,
      transactionType: {
        [Op.or]: [
          "advance_received",
          "advance_payment",
          "advance_received_deduct",
          "advance_payment_deduct",
        ],
      },
    },
    raw: true,
  });


  const { advanceInSum, advanceOutSum } = ledgerData.reduce(
    (acc, row) => {
      if (["advance_received", "advance_payment_deduct"].includes(row.transactionType)) {
        acc.advanceInSum += Number(row.credit) || 0; // credit increases advanceIn
      } else if (["advance_payment", "advance_received_deduct"].includes(row.transactionType)) {
        acc.advanceOutSum += Number(row.debit) || 0; // debit increases advanceOut
      }
      return acc;
    },
    { advanceInSum: 0, advanceOutSum: 0 }
  );

  return { advanceInSum, advanceOutSum };
};
