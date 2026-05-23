import { Bank, Stock, Payment } from "../../models/model.js";

export const getAllBank = async () => {
    const data = await Bank.findAll();
    if (!data || data.length === 0) throw { status: 400, message: "No Bank found" };
    return data;
}

export const createBank = async (req) => {
    const data = await Bank.create(req.body);
    return data;
}

export const getBankById = async (id) => {
    const data = await Bank.findByPk(id);
    if (!data) {
        throw { status: 404, message: "Bank not found" };
    }
    return data;
}

export const updateBank = async (req) => {
    
  const bank = await Bank.findByPk(req.body.id);
  console.log("req.body: ", bank);
  if (!bank) {
      throw { status: 404, message: "Bank not found" };
  }

  await bank.update(req.body);
  return bank;
}

export const activeBank = async (id) => {
    const data = await Bank.findByPk(id);
    if (!data) {
        throw { status: 404, message: "Bank not found" };
    }

    data.isActive = true;

    await data.save();
    return data;
}

export const deactiveBank = async (id) => {
    const data = await Bank.findByPk(id);
    if (!data) {
        throw { status: 404, message: "Bank not found" };
    }

    data.isActive = false;

    await data.save();
    return data;
}

export const deleteBank = async (id) => {
  try{    
    const data = await Bank.findByPk(id,{
      include: [
        { model: Stock, as: "stocks" },
        { model: Payment, as: "payments" },
      ],
    });

    if (!data) {
      throw new Error("Bank not found");
    }

    if (data.payments.length > 0 || data.stocks.length > 0) {
      throw new Error("Can't delete, account has reference of Payment/Stock");
    }

    data.destroy();

    return data;
  } catch (error) {
    throw error;
  }
}
