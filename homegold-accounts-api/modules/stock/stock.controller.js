import * as StockService from "./stock.service.js";
import { success, error } from "../../utils/responseHandler.js";

export const getAllStock = async (req, res, next) =>{
    try {
        const data = await StockService.getAllStock();
        return success(res, data, "Response successful");

    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}

export const getStockReport = async (req, res, next) => {
    try {
        const data = await StockService.getStockReport();
        return success(res, data, "Response successful");

    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}

export const getOverallStockReport = async (req, res, next) => {
    try {
        const data = await StockService.getOverallStockReport();
        return success(res, data, "Response successful");

    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}

export const getCapitalReport = async (req, res, next) => {
    try {
        const data = await StockService.getCapitalReport(req.user.businessId);
        return success(res, data, "Response successful");
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}

export const createStockTransfer = async (req, res, next) => {
    try {
        const data = await StockService.createStockTransfer(req);
        return success(res, data, "Stock transfer created successfully", 201);
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}

export const createStock = async (req, res, next) => {
    try {
        const data = await StockService.createStock(req);
        return success(res, data, "Stock created successfully", 201);
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}

export const getStockById = async (req, res, next) => {
    try {
        const data = await StockService.getStockById(req.params.id);
        return success(res, data, "Stock retrieved successfully", 200);
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}

export const updateStock = async (req, res, next) => {
    try {
        const data = await StockService.updateStock(req);
        return success(res, data, "Stock updated successfully", 200);
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}

export const deleteStock = async (req, res, next) => {
    try {
        const data = await StockService.deleteStock(req.params.id);
        return success(res, data, "Stock deactivated successfully", 200);
    } catch (err) {
        return error(res, err.message, err.status || 500);
    }
}
