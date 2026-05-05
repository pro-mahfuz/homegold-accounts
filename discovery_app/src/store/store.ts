// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../modules/auth/features/authSlice";
import businessReducer from "../modules/business/features/businessSlice";
import userReducer from "../modules/user/features/userSlice";
import permissionReducer from "../modules/permission/features/permissionSlice";
import roleReducer from "../modules/role/features/roleSlice";
import partyReducer from "../modules/party/features/partySlice";
import categoryReducer from "../modules/category/features/categorySlice";
import statusReducer from "../modules/status/features/statusSlice";
import unitReducer from "../modules/unit/features/unitSlice";
import itemReducer from "../modules/item/features/itemSlice";
import invoiceReducer from "../modules/invoice/features/invoiceSlice";
import paymentReducer from "../modules/payment/features/paymentSlice";
import warehouseReducer from "../modules/warehouse/features/warehouseSlice";
import bankReducer from "../modules/account/features/accountSlice";
import stockReducer from "../modules/stock/features/stockSlice";
import ledgerReducer from "../modules/ledger/features/ledgerSlice";
import goldPriceInReducer from "../modules/goldPriceIn/features/goldPriceInSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    business: businessReducer,
    permission: permissionReducer,
    role: roleReducer,
    party: partyReducer,
    category: categoryReducer,
    status: statusReducer,
    unit: unitReducer,
    item: itemReducer,
    invoice: invoiceReducer,
    payment: paymentReducer,
    warehouse: warehouseReducer,
    bank: bankReducer,
    stock: stockReducer,
    ledger: ledgerReducer,
    goldPriceIn: goldPriceInReducer,
    // other slices...
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
