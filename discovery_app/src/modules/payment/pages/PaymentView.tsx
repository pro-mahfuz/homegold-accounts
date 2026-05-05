import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";


import { AppDispatch } from "../../../store/store";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { fetchAll as fetchPayment } from "../../payment/features/paymentThunks.ts";
import { selectPaymentById } from "../../payment/features/paymentSelectors.ts";
import { Payment } from "../features/paymentTypes.ts";


export default function PaymentView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const API_URL = import.meta.env.VITE_API_URL;
    const APP_URL = import.meta.env.VITE_APP_URL;

    useEffect(() => {
        dispatch(fetchPayment());
    }, [dispatch]);

    const authUser = useSelector(selectAuth);
    const user = useSelector(selectUserById(Number(authUser.user?.id)));
    const payment = useSelector(selectPaymentById(Number(id)));
    console.log("payment2: ", payment);
    function numberToWords(amount: number): string {
        const ones = [
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
            "Sixteen", "Seventeen", "Eighteen", "Nineteen"
        ];
        const tens = [
            "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
        ];

        const convertTens = (num: number): string => {
            if (num < 20) return ones[num];
            const ten = Math.floor(num / 10);
            const unit = num % 10;
            return tens[ten] + (unit ? " " + ones[unit] : "");
        };

        const convertHundreds = (num: number): string => {
            if (num > 99) {
            return ones[Math.floor(num / 100)] + " Hundred " + convertTens(num % 100);
            }
            return convertTens(num);
        };

        const convert = (num: number): string => {
            if (num === 0) return "Zero";
            let words = "";

            if (Math.floor(num / 1000) > 0) {
            words += convertHundreds(Math.floor(num / 1000)) + " Thousand ";
            num %= 1000;
            }

            words += convertHundreds(num);

            return words.trim();
        };

        // Split amount into dirhams and fils
        const [dirhams, fils] = amount.toString().split(".").map(Number);

        let result = "";
        if (dirhams > 0) {
            result += convert(dirhams);
        }
        if (fils > 0) {
            result += (result ? " and " : "") + convert(fils);
        }

        return result || "Zero";
    }

    const handleEdit = (payment: Payment) => {
        payment.system === 2 ? navigate(`/paymentSys2/${payment.id}/edit`) : navigate(`/payment/${payment.id}/edit`);
    };

    const handleList = (payment: Payment) => {
        payment.system === 1 ? navigate(`/payment/list`) : navigate(`/payment/list`);
    };

    return (
        <div>
            <PageMeta title="Payment View" description="Payment View" />
            <PageBreadcrumb pageTitle="Payment View" />

            <div className="mb-4 flex justify-between print:hidden">
                
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-red-400 text-white px-2 py-1 rounded-full hover:bg-red-700 mr-4"
                    >
                        Back
                    </button>

                    <button
                        onClick={() => {if (payment) handleList(payment)}}
                        className="bg-fuchsia-400 text-white px-2 py-1 rounded-full hover:bg-fuchsia-700 mr-4"
                    >
                        Payment List
                    </button>

                    <button
                        onClick={() => {
                            if (payment) handleEdit(payment);
                        }}
                        className="bg-blue-600 text-white px-2 py-1 rounded-full hover:bg-blue-700"
                    >
                        Update
                    </button>
                    
                </div>

                {user?.role?.permissions?.some(s => s.action === "print_invoice" || s.action === "print_purchase_invoice" || s.action === "print_sale_invoice") && (
                    <div className="mb-4 flex justify-end print:hidden">
                        <button
                        onClick={() => window.print()}
                        className="bg-purple-600 text-white px-2 py-1 rounded-full hover:bg-blue-700"
                        >
                        Print Invoice
                        </button>
                    </div>
                )}
            </div>

            {/* Print Button */}
            
            

            <div id="print-section">
                <div className="rounded-2xl border border-gray-500 bg-white mx-2 my-8 p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                    <div className="space-y-6">
                        <div className="p-5 rounded-2xl lg:p-6">
                            <div className="flex flex-row items-center text-center gap-5 xl:flex-row xl:justify-between">
                                <div className="flex flex-col items-center w-full gap-1">
                                    
                                        <>
                                            <img
                                                src={
                                                user?.business?.businessLogo instanceof File
                                                    ? URL.createObjectURL(user.business.businessLogo)
                                                    : user?.business?.businessLogo
                                                    ? `${API_URL}${user?.business.businessLogo}`
                                                    : `${APP_URL}/public/images/user/owner.jpeg`
                                                }
                                                alt="user"
                                                className="w-[310px] h-[100px]"
                                            />
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                            {user?.business?.businessName}
                                            </h4>
                                            {user?.business?.trnNo && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                TRN No: {user.business.trnNo}
                                            </p>
                                            )}
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Address: {user?.business?.address}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Email: {user?.business?.email} , Phone: {(user?.business?.phoneCode ?? '') + (user?.business?.phoneNumber ?? '')}
                                            </p>
                                        </>
                                        
                                   

                                </div>
                                
                            </div>
                            
                        </div>

                        <div className="rounded-2xl lg:p-1">
                            <div className="flex flex-row items-center text-center gap-5 xl:flex-row xl:justify-between">
                                <div className="flex flex-col items-center w-full gap-1">
                                    <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90 border border-black-500 px-2 rounded">
                                        {   payment?.paymentType === "payment_in" ? "RECEIVED VOUCHER" : 
                                            payment?.paymentType === "payment_out" ? "PAYMENT VOUCHER" : 
                                            payment?.paymentType === "advance_received" ? "ADVANCE (RECEIVED) VOUCHER" : 
                                            payment?.paymentType === "advance_payment" ? "ADVANCE (PAYMENT) VOUCHER" : 
                                            payment?.paymentType === "advance_payment_deduct" ? "ADVANCE (PAYMENT DEDUCT) VOUCHER" : 
                                            payment?.paymentType === "advance_received_deduct" ? "ADVANCE (RECEIVED DEDUCT) VOUCHER" :
                                            payment?.paymentType === "discount_purchase" || "discount_sale" ? "DISCOUNT VOUCHER" : 
                                            payment?.paymentType === "premium_collection" ? "PREMIUM COLLECTION VOUCHER" : 
                                            payment?.paymentType === "deposit" ? "DEPOSIT VOUCHER" : 
                                            payment?.paymentType === "withdraw" ? "WIDTHDRAW VOUCHER" : 
                                            payment?.paymentType.toUpperCase() + ' VOUCHER'
                                        } 
                                    </h4>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row items-start text-center gap-5 xl:flex-row xl:justify-between">
                            <div className="flex flex-col items-start w-full gap-1 xl:justify-between">
                                <h6 className="text-lg font-semibold text-gray-800 dark:text-white/90">To,</h6>
                                <p className="text-lg text-left text-gray-500 dark:text-gray-400">
                                    <b>Name:</b>{" "}
                                    <span>
                                        {payment?.party?.name}
                                    </span>
                                </p>
                                {payment?.party?.trnNo && (
                                    <p className="text-lg text-left text-gray-500 dark:text-gray-400">
                                        <b>TRN No:</b> {payment?.party?.trnNo}
                                    </p>
                                )}
                                {payment?.party?.nationalId && (
                                    <p className="text-lg text-left text-gray-500 dark:text-gray-400">
                                        <b>Passport/EID:</b> {payment?.party?.nationalId}
                                    </p>
                                )}
                                {payment?.party?.address && (
                                <p className="text-lg text-left text-gray-500 dark:text-gray-400">
                                    <b>Address:</b> {payment?.party?.address}
                                </p>
                                )}
                                {payment?.party?.phoneCode && (
                                <p className="text-lg text-left text-gray-500 dark:text-gray-400">
                                    <b>Phone:</b> {(payment?.party?.phoneCode ?? '') + payment?.party?.phoneNumber}
                                </p>
                                )}
                            </div>

                            <div className="flex flex-col items-end w-full gap-1 xl:justify-between">

                                <ul className="space-y-2">
                                    <li className="flex items-center justify-between">
                                        <span className="text-lg text-gray-500 dark:text-gray-400">
                                            Date:
                                        </span>
                                        <span className="text-lg text-gray-500 dark:text-white/90 pr-4">{payment?.paymentDate
                                            ? new Date(payment?.paymentDate).toLocaleDateString("en-GB").replace(/\//g, "-")
                                            : ""}
                                        </span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span className="text-lg text-gray-500 dark:text-gray-400">
                                            Ref #
                                        </span>
                                        <span className="text-lg text-gray-500 dark:text-white/90 pr-4">{payment?.paymentRefNo}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        
                            <div className="min-h-[300px]">
                                <Table className="border border-gray-500">
                                    <TableHeader className="border-b border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                                        <TableRow>
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Payment No</TableCell>
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Description</TableCell>
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Payment Account</TableCell>
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Currency</TableCell>
                                            
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Amount ({payment?.currency})</TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {!payment ? (
                                            <TableRow className="">
                                                <TableCell colSpan={6} className="text-center py-4">
                                                    No items added yet.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            
                                                <TableRow >
                                                    <TableCell className="text-lg text-center px-4 py-2">{payment.paymentRefNo}</TableCell>
                                                    <TableCell className="text-lg text-center px-4 py-2">
                                                        {payment.note?.trim() || `For Invoice No: ${payment.invoiceRefNo}`}
                                                    </TableCell>
                                                    <TableCell className="text-lg text-center px-4 py-2">{payment.bank?.accountName}</TableCell>
                                                    <TableCell className="text-lg text-center px-4 py-2">{payment.currency}</TableCell>
                                                    <TableCell className="text-lg text-center px-4 py-2">{payment.amountPaid}</TableCell>
                                                </TableRow>
                                           
                                        )}
                                    </TableBody>
                                </Table>
                                <div className="flex justify-center text-center mt-4">
                                    <p className="text-lg text-gray-500 dark:text-gray-400">
                                        <span className="font-bold">In-Words:</span> {numberToWords(payment?.amountPaid ?? 0) + " " + ` (${payment?.currency})` + " Only"}
                                    </p>
                                </div>
                            </div>
                        

                        
                        

                        <div className="flex flex-row items-start text-center gap-5 xl:flex-row xl:justify-between">
                            <div className="flex flex-col items-start w-full gap-1 xl:justify-between">
                                <ul className="space-y-2">
                                    <li className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            ---------------------
                                        </span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Receiver's Signature
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex flex-col items-end w-full gap-1 xl:justify-between">

                                <ul className="space-y-2">
                                    <li className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            ---------------------
                                        </span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Authorized Signature
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
