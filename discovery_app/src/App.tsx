import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./modules/auth/pages/SignIn";
import SignUp from "./modules/auth/pages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/dashboard/Home";
import UserTable from "./modules/user/pages/UserTable";
import UserForm from "./modules/user/pages/UserForm";
import UserEditForm from "./modules/user/pages/UserEditForm";
import PrivateRoute from "./middleware/PrivateRoute";
import "../node_modules/react-toastify/dist/ReactToastify.css"
import { ToastContainer } from 'react-toastify';
import ProfileEdit from "./modules/user/pages/ProfileEditForm";
import ProfileView from "./modules/user/pages/ProfileView";
import PermissionTable from "./modules/permission/pages/PermissionTable";
import RoleTable from "./modules/role/pages/RoleTable";
import RoleEditForm from "./modules/role/pages/RoleEditForm";
import RoleCreateForm from "./modules/role/pages/RoleCreateForm";
import CustomerLedger from "./modules/ledger/pages/CustomerLedger";
import LedgerList from "./modules/ledger/pages/LedgerList";
import PartyCreateForm from "./modules/party/pages/PartyCreateForm";
import PartyEditForm from "./modules/party/pages/PartyEditForm";
import PartyView from "./modules/party/pages/PartyView";
import InvoiceCreateForm from "./modules/invoice/pages/InvoiceCreateForm";
import InvoiceList from "./modules/invoice/pages/invoiceList";
import PartyList from "./modules/party/pages/PartyList";
import BusinessCreateForm from "./modules/business/pages/BusinessCreateForm";
import BusinessList from "./modules/business/pages/BusinessList";
import BusinessEditForm from "./modules/business/pages/BusinessEditForm";
import BusinessView from "./modules/business/pages/BusinessView";
import InvoiceEditForm from "./modules/invoice/pages/invoiceEditForm";
import InvoiceView from "./modules/invoice/pages/invoiceView";
import PaymentCreateForm from "./modules/payment/pages/PaymentCreateForm";
import PaymentList from "./modules/payment/pages/PaymentList";
import PaymentEditForm from "./modules/payment/pages/PaymentEditForm";
import StockCreateForm from "./modules/stock/pages/StockCreateForm";
import StockListForm from "./modules/stock/pages/StockList";
import StockEditForm from "./modules/stock/pages/StockEditForm";
import StockReport from "./modules/report/pages/StockReport";
import SaleReport from "./modules/report/pages/SaleReport";
import SalePaymentReport from "./modules/report/pages/SaleCashCollectionReport";
import ProfitLossReport from "./modules/report/pages/profitLossReport";
import ExpenseCreateForm from "./modules/payment/pages/ExpenseCreateForm";
import ExpenseList from "./modules/payment/pages/ExpenseList";
import ExpenseEditForm from "./modules/payment/pages/ExpenseEditForm";
import ExpenseOfficeReport from "./modules/report/pages/ExpenseOfficeReport";
import ItemList from "./modules/item/pages/ItemList";
import UnitList from "./modules/unit/pages/UnitList";
import StatusList from "./modules/status/pages/StatusList";
import BalanceStatement from "./modules/report/pages/BalanceStatement";
import PaymentAcountList from "./modules/account/pages/PaymentAcountList";
import CustomerBalanceStatement from "./modules/report/pages/CustomerBalanceStatement";
import SaleCashCollectionReport from "./modules/report/pages/SaleCashCollectionReport";
import SaleCashReport from "./modules/report/pages/SaleCashReport";
import DailyProfitLossReport from "./modules/report/pages/dailyProfitLossReport";
import CapitalReport from "./modules/report/pages/CapitalReport";
import ReceivableReport from "./modules/report/pages/ReceivableReport";
import PayableReport from "./modules/report/pages/PayableReport";
import SaleOutstandingReport from "./modules/report/pages/SaleOutstandingReport";
import PurchaseReport from "./modules/report/pages/PurchaseReport";
import PurchaseCashPaymentReport from "./modules/report/pages/PurchaseCashPaymentReport";
import SaleStatement from "./modules/report/pages/SaleStatement";
import PaymentView from "./modules/payment/pages/PaymentView";
import AccountStatement from "./modules/report/pages/AccountStatement";
import ResetPassword from "./modules/auth/pages/ResetPassword";
import ForgotPassword from "./modules/auth/pages/ForgotPassword";
import GoldPriceInList from "./modules/goldPriceIn/pages/GoldPriceInList";
import GoldConverter from "./modules/goldPriceIn/pages/GoldConverter";
import BaseCurrencySettings from "./modules/settings/pages/BaseCurrencySettings";


export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />


          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            {/* Auth Layout */}
            <Route index path="/" element={
              <PrivateRoute permissions={['manage_dashboard']}>
                <Home />
              </PrivateRoute>} 
            />

            {/* Unit */}
            <Route index path="/unit/list" element={
              <PrivateRoute permissions={['manage_unit']}>
                <UnitList />
              </PrivateRoute>} 
            />

            {/* Item */}
            <Route index path="/item/list" element={
              <PrivateRoute permissions={['manage_item']}>
                <ItemList />
              </PrivateRoute>} 
            />

            {/* Party */}
            <Route index path="/party/:partyType/list" element={
              <PrivateRoute permissions={['manage_party']}>
                <PartyList />
              </PrivateRoute>} 
            />

            <Route index path="/party/create" element={
              <PrivateRoute permissions={['create_party']}>
                <PartyCreateForm />
              </PrivateRoute>} 
            />

            <Route index path="/party/:partyType/create" element={
              <PrivateRoute permissions={['create_party']}>
                <PartyCreateForm />
              </PrivateRoute>} 
            />

            <Route index path="/party/view/:id" element={
              <PrivateRoute permissions={['view_party']}>
                <PartyView />
              </PrivateRoute>} 
            />

            <Route index path="/party/edit/:id" element={
              <PrivateRoute permissions={['edit_party']}>
                <PartyEditForm />
              </PrivateRoute>} 
            />

            {/* Invoice */}
            <Route index path="/invoice/:invoiceType/create" element={
              <PrivateRoute permissions={['create_purchase', 'create_sale']}>
                <InvoiceCreateForm />
              </PrivateRoute>} 
            />
            <Route index path="/invoice/:invoiceType/:categoryId/list" element={
              <PrivateRoute permissions={['manage_purchase', 'manage_sale']}>
                <InvoiceList />
              </PrivateRoute>} 
            />

            <Route index path="/invoice/:id/view" element={
              <PrivateRoute permissions={['view_purchase', 'view_sale']}>
                <InvoiceView />
              </PrivateRoute>} 
            />

            <Route index path="/invoice/:id/edit" element={
              <PrivateRoute permissions={['edit_purchase', 'edit_sale']}>
                <InvoiceEditForm />
              </PrivateRoute>} 
            />


            {/* Payment */}
            <Route index path="/payment/create" element={
              <PrivateRoute permissions={['create_payment']}>
                <PaymentCreateForm />
              </PrivateRoute>} 
            />
            <Route index path="/payment/list" element={
              <PrivateRoute permissions={['manage_payment']}>
                <PaymentList />
              </PrivateRoute>} 
            />

            <Route index path="/payment/:id/edit" element={
              <PrivateRoute permissions={['edit_payment']}>
                <PaymentEditForm />
              </PrivateRoute>} 
            />

            <Route index path="/payment/:id/view" element={
              <PrivateRoute permissions={['view_payment']}>
                <PaymentView />
              </PrivateRoute>} 
            />

            {/* Expense */}
            <Route index path="/expense/create" element={
              <PrivateRoute permissions={['create_expense']}>
                <ExpenseCreateForm />
              </PrivateRoute>} 
            />
            <Route index path="/expense/list" element={
              <PrivateRoute permissions={['manage_expense']}>
                <ExpenseList />
              </PrivateRoute>} 
            />

            <Route index path="/expense/:id/edit" element={
              <PrivateRoute permissions={['edit_expense']}>
                <ExpenseEditForm />
              </PrivateRoute>} 
            />

            {/* Stock */}
            <Route index path="/stock/create" element={
              <PrivateRoute permissions={['create_stock']}>
                <StockCreateForm />
              </PrivateRoute>} 
            />
            <Route index path="/stock/list" element={
              <PrivateRoute permissions={['manage_stock']}>
                <StockListForm />
              </PrivateRoute>} 
            />

            <Route index path="/stock/:id/edit" element={
              <PrivateRoute permissions={['edit_stock']}>
                <StockEditForm />
              </PrivateRoute>} 
            />
            
            {/* Ledger */}

            {/* <Route index path="/ledger/all/:categoryId/list" element={
              <PrivateRoute permissions={['manage_users']}>
                <CustomerLedger />
              </PrivateRoute>} 
            /> */}
            
            <Route index path="/ledger/:categoryId/party/:partyId" element={
              <PrivateRoute permissions={['view_ledger']}>
                <CustomerLedger />
              </PrivateRoute>} 
            />

            <Route index path="/ledger/:ledgerType/list/:partyId" element={
              <PrivateRoute permissions={['manage_ledger']}>
                <LedgerList />
              </PrivateRoute>} 
            />

            {/* Report */}
            <Route index path="/report/balance/statement" element={
              <PrivateRoute permissions={['report_balance']}>
                <BalanceStatement />
              </PrivateRoute>} 
            />

            <Route index path="/report/:partyType/statement" element={
              <PrivateRoute permissions={['statement_summary_party']}>
                <CustomerBalanceStatement />
              </PrivateRoute>} 
            />

            <Route index path="/report/stock" element={
              <PrivateRoute permissions={['report_stock']}>
                <StockReport />
              </PrivateRoute>} 
            />

            <Route index path="/report/purchase" element={
              <PrivateRoute permissions={['report_purchase']}>
                <PurchaseReport />
              </PrivateRoute>} 
            />

            <Route index path="/report/sale" element={
              <PrivateRoute permissions={['report_sale']}>
                <SaleReport />
              </PrivateRoute>} 
            />

            <Route index path="/report/sale/statement" element={
              <PrivateRoute permissions={['report_sale']}>
                <SaleStatement />
              </PrivateRoute>} 
            />


            <Route index path="report/sale/cash-collection" element={
              <PrivateRoute permissions={['report_sale_cash_collection']}>
                <SaleCashCollectionReport />
              </PrivateRoute>} 
            />

            <Route index path="report/purchase/cash-payment" element={
              <PrivateRoute permissions={['report_sale_cash_collection']}>
                <PurchaseCashPaymentReport />
              </PrivateRoute>} 
            />

            <Route index path="/report/sale/cash-report" element={
              <PrivateRoute permissions={['report_sale']}>
                <SaleCashReport />
              </PrivateRoute>} 
            />

            <Route index path="/report/sale/:containerNo" element={
              <PrivateRoute permissions={['report_sale']}>
                <SaleReport />
              </PrivateRoute>} 
            />

            <Route index path="/report/sale/payment" element={
              <PrivateRoute permissions={['report_payment']}>
                <SalePaymentReport />
              </PrivateRoute>} 
            />

            <Route index path="/report/sale/due" element={
              <PrivateRoute permissions={['report_sale']}>
                <SaleOutstandingReport />
              </PrivateRoute>} 
            />

            <Route index path="/report/expense/office" element={
              <PrivateRoute permissions={['report_expense']}>
                <ExpenseOfficeReport />
              </PrivateRoute>} 
            />

            <Route index path="/report/dailyProfitLoss" element={
              <PrivateRoute permissions={['report_sale']}>
                <DailyProfitLossReport />
              </PrivateRoute>} 
            />

            <Route index path="/report/profitLoss" element={
              <PrivateRoute permissions={['report_sale']}>
                <ProfitLossReport />
              </PrivateRoute>} 
            />

            <Route index path="/report/receivable" element={
              <PrivateRoute permissions={['report_receivable']}>
                <ReceivableReport />
              </PrivateRoute>} 
            />

            <Route index path="/report/payable" element={
              <PrivateRoute permissions={['report_payable']}>
                <PayableReport />
              </PrivateRoute>} 
            />

            <Route index path="/report/capitalReport" element={
              <PrivateRoute permissions={['report_capital']}>
                <CapitalReport />
              </PrivateRoute>} 
            />

            <Route index path="/report/account/statement" element={
              <PrivateRoute permissions={['report_balance']}>
                <AccountStatement />
              </PrivateRoute>} 
            />

            {/* Business */}
            <Route index path="/business/create" element={
              <PrivateRoute permissions={['create_business']}>
                <BusinessCreateForm />
              </PrivateRoute>
            }
            />

            <Route index path="/business/list" element={
              <PrivateRoute permissions={['manage_business']}>
                <BusinessList />
              </PrivateRoute>
            }
            />

            <Route index path="/business/edit/:id" element={
              <PrivateRoute permissions={['edit_business']}>
                <BusinessEditForm />
              </PrivateRoute>
            }
            />

            <Route index path="/business/view/:id" element={
              <PrivateRoute permissions={['view_business']}>
                <BusinessView />
              </PrivateRoute>
            }
            />
            
            {/* User */}
            <Route index path="/user/list" element={
              <PrivateRoute permissions={['manage_users']}>
                <UserTable />
              </PrivateRoute>} 
            />

            <Route index path="/user/create" element={
              <PrivateRoute permissions={['create_users']}>
                <UserForm />
              </PrivateRoute>} 
            />

            <Route index path="/user/edit/:id" element={
              <PrivateRoute permissions={['edit_users']}>
                <UserEditForm />
              </PrivateRoute>} 
            />

            <Route index path="/user/profile/view/:id" element={
              <PrivateRoute permissions={['view_profile']}>
                <ProfileView />
              </PrivateRoute>} 
            />

            <Route index path="/user/profile/edit/:id" element={
              <PrivateRoute permissions={['edit_profile']}>
                <ProfileEdit />
              </PrivateRoute>} 
            />


            {/* Permission */}
            <Route index path="/permission/list" element={
              <PrivateRoute permissions={['manage_permissions']}>
                <PermissionTable />
              </PrivateRoute>} 
            />

            {/* Role */}
            <Route index path="/role/list" element={
              <PrivateRoute permissions={['manage_roles']}>
                <RoleTable />
              </PrivateRoute>} 
            />

            <Route index path="/role/create" element={
              <PrivateRoute permissions={['manage_roles']}>
                <RoleCreateForm />
              </PrivateRoute>} 
            />

            <Route index path="/role/edit/:id" element={
              <PrivateRoute permissions={['manage_roles']}>
                <RoleEditForm />
              </PrivateRoute>} 
            />

             {/* Payment Account */}
            <Route index path="/account/list" element={
              <PrivateRoute permissions={['manage_account']}>
                <PaymentAcountList />
              </PrivateRoute>} 
            />

            {/* Status */}
            <Route index path="/status/list" element={
              <PrivateRoute permissions={['manage_status']}>
                <StatusList />
              </PrivateRoute>} 
            />

            <Route index path="/settings/base-currency" element={
              <PrivateRoute permissions={['edit_business']}>
                <BaseCurrencySettings />
              </PrivateRoute>}
            />

            {/* Gold Price In */}
            <Route index path="/gold-price-in/list" element={
              <PrivateRoute permissions={['manage_dashboard']}>
                <GoldPriceInList />
              </PrivateRoute>}
            />

            <Route index path="/gold-converter" element={
              <PrivateRoute permissions={['manage_dashboard']}>
                <GoldConverter />
              </PrivateRoute>}
            />


            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>

      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
}
