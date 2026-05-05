import { hash } from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
import { sequelize, Permission, StatusType } from "../models/model.js"; // Adjust the path as needed
import { faker } from '@faker-js/faker';

import { shmSeed } from "./shm.js";
import { discoverySeed } from "./discovery.js";

async function seed() {
  await sequelize.sync({ force: true });

  const permissions = await Permission.bulkCreate([
    { name: "Dashboard Manage", action: "manage_dashboard", group: "Dashboard" },
    { name: "Role Manage", action: "manage_roles", group: "Role" },
    { name: "Permission Manage", action: "manage_permissions", group: "Permission" },

    { name: "Business Manage", action: "manage_business", group: "Business" },
    { name: "Business Create", action: "create_business", group: "Business" },
    { name: "Business Edit", action: "edit_business", group: "Business" },
    { name: "Business View", action: "view_business", group: "Business" },
    { name: "Business Delete", action: "delete_business", group: "Business" },

    { name: "Category Manage", action: "manage_category", group: "Category" },
    { name: "Category Create", action: "create_category", group: "Category" },
    { name: "Category Edit", action: "edit_category", group: "Category" },
    { name: "Category View", action: "view_category", group: "Category" },
    { name: "Category Delete", action: "delete_category", group: "Category" },

    { name: "Item Manage", action: "manage_item", group: "Item" },
    { name: "Item Create", action: "create_item", group: "Item" },
    { name: "Item Edit", action: "edit_item", group: "Item" },
    { name: "Item View", action: "view_item", group: "Item" },
    { name: "Item Delete", action: "delete_item", group: "Item" },

    { name: "Unit Manage", action: "manage_unit", group: "Unit" },
    { name: "Unit Create", action: "create_unit", group: "Unit" },
    { name: "Unit Edit", action: "edit_unit", group: "Unit" },
    { name: "Unit View", action: "view_unit", group: "Unit" },
    { name: "Unit Delete", action: "delete_unit", group: "Unit" },

    { name: "Account Manage", action: "manage_account", group: "Account" },
    { name: "Account Create", action: "create_account", group: "Account" },
    { name: "Account Edit", action: "edit_account", group: "Account" },
    { name: "Account View", action: "view_account", group: "Account" },
    { name: "Account Delete", action: "delete_account", group: "Account" },

    { name: "Warehouse Manage", action: "manage_warehouse", group: "Warehouse" },
    { name: "Warehouse Create", action: "create_warehouse", group: "Warehouse" },
    { name: "Warehouse Edit", action: "edit_warehouse", group: "Warehouse" },
    { name: "Warehouse View", action: "view_warehouse", group: "Warehouse" },
    { name: "Warehouse Delete", action: "delete_warehouse", group: "Warehouse" },

    { name: "User Manage", action: "manage_users", group: "User" },
    { name: "User Create", action: "create_users", group: "User" },
    { name: "User Edit", action: "edit_users", group: "User" },
    { name: "User View", action: "view_users", group: "User" },
    { name: "User Delete", action: "delete_users", group: "User" },

    { name: "Profile Manage", action: "manage_profile", group: "Profile" },
    { name: "Profile Edit", action: "edit_profile", group: "Profile" },
    { name: "Profile View", action: "view_profile", group: "Profile" },

    { name: "Party Manage", action: "manage_party", group: "Party" },
    { name: "Party Create", action: "create_party", group: "Party" },
    { name: "Party Edit", action: "edit_party", group: "Party" },
    { name: "Party View", action: "view_party", group: "Party" },
    { name: "Party Delete", action: "delete_party", group: "Party" },

    { name: "Purchase Manage", action: "manage_purchase", group: "Purchase" },
    { name: "Purchase Create", action: "create_purchase", group: "Purchase" },
    { name: "Purchase Edit", action: "edit_purchase", group: "Purchase" },
    { name: "Purchase View", action: "view_purchase", group: "Purchase" },
    { name: "Purchase Delete", action: "delete_purchase", group: "Purchase" },

    { name: "Sale Manage", action: "manage_sale", group: "Sale" },
    { name: "Sale Create", action: "create_sale", group: "Sale" },
    { name: "Sale Edit", action: "edit_sale", group: "Sale" },
    { name: "Sale View", action: "view_sale", group: "Sale" },
    { name: "Sale Delete", action: "delete_sale", group: "Sale" },

    { name: "Payment Manage", action: "manage_payment", group: "Payment" },
    { name: "Payment Create", action: "create_payment", group: "Payment" },
    { name: "Payment Edit", action: "edit_payment", group: "Payment" },
    { name: "Payment View", action: "view_payment", group: "Payment" },
    { name: "Payment Delete", action: "delete_payment", group: "Payment" },

    { name: "Expense Manage", action: "manage_expense", group: "Expense" },
    { name: "Expense Create", action: "create_expense", group: "Expense" },
    { name: "Expense Edit", action: "edit_expense", group: "Expense" },
    { name: "Expense View", action: "view_expense", group: "Expense" },
    { name: "Expense Delete", action: "delete_expense", group: "Expense" },

    { name: "Stock Manage", action: "manage_stock", group: "Stock" },
    { name: "Stock Create", action: "create_stock", group: "Stock" },
    { name: "Stock Edit", action: "edit_stock", group: "Stock" },
    { name: "Stock View", action: "view_stock", group: "Stock" },
    { name: "Stock Delete", action: "delete_stock", group: "Stock" },

    { name: "Ledger Currency", action: "currency_ledger", group: "Ledger" },
    { name: "Ledger Manage", action: "manage_ledger", group: "Ledger" },
    { name: "Ledger All", action: "all_ledger", group: "Ledger" },
    { name: "Ledger Purchase", action: "purchase_ledger", group: "Ledger" },
    { name: "Ledger Sale", action: "sale_ledger", group: "Ledger" },
    { name: "Ledger Create", action: "create_ledger", group: "Ledger" },
    { name: "Ledger Edit", action: "edit_ledger", group: "Ledger" },
    { name: "Ledger View", action: "view_ledger", group: "Ledger" },
    { name: "Ledger Delete", action: "delete_ledger", group: "Ledger" },

    { name: "Report Manage", action: "manage_report", group: "Report" },
    { name: "Report Stock", action: "report_stock", group: "Report" },
    { name: "Report Sale", action: "report_sale", group: "Report" },
    { name: "Report Payment", action: "report_payment", group: "Report" },
    { name: "Report Expense", action: "report_expense", group: "Report" },
    { name: "Report Balance", action: "report_balance", group: "Report" },

    { name: "Status Manage", action: "manage_status", group: "Status" },
    { name: "Status Create", action: "create_status", group: "Status" },
    { name: "Status Edit", action: "edit_status", group: "Status" },
    { name: "Status View", action: "view_status", group: "Status" },
    { name: "Status Delete", action: "delete_status", group: "Status" },
  ]);

  //await discoverySeed(permissions);
  await shmSeed(permissions);

  console.log("Seed complete");
  process.exit();
}

seed();
