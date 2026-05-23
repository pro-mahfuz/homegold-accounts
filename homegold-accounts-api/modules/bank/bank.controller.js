import * as BankService from "./bank.service.js";
import { success, error } from "../../utils/responseHandler.js";

export const getAllBank = async (req, res, next) =>{
    try {
        const data = await BankService.getAllBank();
        return success(res, data, "Response successful");

    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}

export const createBank = async (req, res, next) => {
    try {
        console.log("Bank create Request: ", req.body);
        const data = await BankService.createBank(req);
        return success(res, data, "Bank created successfully", 201);
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}

export const getBankById = async (req, res, next) => {
    try {
        const data = await BankService.getBankById(req.params.id);
        return success(res, data, "Bank retrieved successfully", 200);
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}

export const updateBank = async (req, res, next) => {
    try {
        const data = await BankService.updateBank(req);
        return success(res, data, "Bank updated successfully", 200);
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}

export const activeBank = async (req, res, next) => {
    try {
        const data = await BankService.activeBank(req.params.id);
        return success(res, data, "Bank activated successfully", 200);
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}

export const deactiveBank = async (req, res, next) => {
    try {
        const data = await BankService.deactiveBank(req.params.id);
        return success(res, data, "Bank deactivated successfully", 200);
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}

export const deleteBank = async (req, res, next) => {
    try {
        const data = await BankService.deleteBank(req.params.id);
        return success(res, data, "Bank deactivated successfully", 200);
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}
