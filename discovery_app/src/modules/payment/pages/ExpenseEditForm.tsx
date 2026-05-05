import { FormEvent, ChangeEvent, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import DatePicker from "../../../components/form/date-picker.tsx";
import Button from "../../../components/ui/button/Button";
import Select from "react-select";

import { AppDispatch } from "../../../store/store";
import { OptionStringType, selectStyles, CurrencyOptions } from "../../types.ts";
import { Payment } from "../features/paymentTypes.ts";

import { update } from "../features/paymentThunks";
import { fetchAll as fetchPayment } from "../../payment/features/paymentThunks.ts";
import { fetchParty } from "../../party/features/partyThunks.ts";
import { fetchAllInvoice } from "../../invoice/features/invoiceThunks.ts";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";
import { fetchAllStatus } from "../../status/features/statusThunks.ts";

import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectPaymentById } from "../../payment/features/paymentSelectors.ts";
import { selectAllInvoice } from "../../invoice/features/invoiceSelectors.ts";
import { selectAllAccount } from "../../account/features/accountSelectors.ts";
import { selectAllStatusByType } from "../../status/features/statusSelectors.ts";

export default function ExpenseEditForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const authUser = useSelector(selectAuth);
    const user = useSelector(selectUserById(Number(authUser.user?.id)));

    useEffect(() => {
        if(invoices.length === 0){
            dispatch(fetchPayment());
        }
        if(invoices.length === 0){
            dispatch(fetchParty({ type: "all" }))
        }
        if(invoices.length === 0){
            dispatch(fetchAllInvoice());
        }
        dispatch(fetchAllAccount());
        dispatch(fetchAllStatus());
    }, [dispatch]);

    const invoices = useSelector(selectAllInvoice);
    const payment = useSelector(selectPaymentById(Number(id)));
    const paymentAccounts = useSelector(selectAllAccount);
    const InvoiceTypeOptions = useSelector(selectAllStatusByType(Number(user?.business?.id), 'expense'));


    const [formData, setFormData] = useState<Payment>({
        businessId: 0,
        invoiceId: null,
        categoryId: null,
        containerId: 0,
        partyId: 0,
        paymentType: '',
        paymentDate: "",
        note: "",
        amountPaid: 0,
        bankId: 0,
        paymentDetails: "",
        currency: "",
        createdBy: 0,
        updatedBy: 0,
        system: 1
    });

    useEffect(() => {
        if (user?.business?.id && payment) {
          setFormData({
            id: payment.id,
            businessId: user?.business?.id,
            invoiceId: payment.invoiceId,
            categoryId: payment.categoryId,
            containerId: payment.containerId,
            partyId: payment.partyId,
            paymentType: payment.paymentType,
            paymentDate: payment.paymentDate,
            note: payment.note,
            amountPaid: payment.amountPaid,
            bankId: payment.bankId,
            paymentDetails: payment.paymentDetails,
            currency: payment.currency,
            createdBy: payment.createdBy,
            updatedBy: user.id,
            system: 1
          });
        }
      }, [user, payment]);


    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "partyId" || name === "categoryId" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
       
        try {
            await dispatch(update(formData));
            toast.success("Expense updated successfully!");
            dispatch(fetchPayment());
            navigate(`/expense/list`);
        } catch (err) {
            toast.error("Failed to update expense.");
        }
    };

    return (
        <div>
        <PageMeta title="Expense Update" description="Form to create a expense" />
        <PageBreadcrumb pageTitle="Expense Update" />

        <div className="mb-4 flex justify-start">
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-red-400 text-white px-2 py-1 rounded-full hover:bg-red-700 mr-4"
                >
                    Back
                </button>

                <button
                    onClick={() => {navigate(`/expense/list`)}}
                    className="bg-fuchsia-400 text-white px-2 py-1 rounded-full hover:bg-fuchsia-700 mr-4"
                >
                    Expense List
                </button>
                
            </div>
        </div>
        
        <ComponentCard title="Modify fields to update a expense">
            <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Expense Type */}
                <div>
                    <Label>Select Expense Type</Label>
                    <Select
                        options={InvoiceTypeOptions}
                        placeholder="Select type"
                        value={InvoiceTypeOptions.find(option => option.value === formData.paymentType) || null}
                        onChange={(selectedOption) => {
                        if (selectedOption) {
                            setFormData((prev) => ({
                                ...prev,
                                paymentType: selectedOption.value,
                            }));
                        }
                        }}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.value}
                        styles={selectStyles}
                        classNamePrefix="react-select"
                    />
                </div>

                {/* Invoice Type */}
                { formData.paymentType !== "office_expense" && (
                <div>
                    <Label>Select Invoice Ref (if have)</Label>
                    <Select
                        options={invoices.map((i) => ({
                            label: `#${i.id} | ${i.party?.name ?? "No name"}`,
                            value: i.id,
                            invoiceType: i.invoiceType,
                            categoryId: i.categoryId,
                            partyId: i.partyId
                        }))}
                        placeholder="Select invoice type"
                        value={
                            invoices
                            .map((i) => ({
                                label: `#${i.invoiceNo}`,
                                value: i.id,
                                invoiceType: i.invoiceType,
                                categoryId: i.categoryId,
                                partyId: i.partyId
                            }))
                            .find((option) => option.value === formData.invoiceId) || null
                        }
                        onChange={(selectedOption) => {
                        setFormData((prev) => ({
                            ...prev,
                            invoiceId: Number(selectedOption!.value),
                            invoiceType: selectedOption?.invoiceType,
                            categoryId: Number(selectedOption?.categoryId),
                            partyId: Number(selectedOption?.partyId)
                        }));
                        }}
                        styles={selectStyles}
                        classNamePrefix="react-select"
                    />
                </div>
                )}

                

                {/* Date */}
                <div>
                    <DatePicker
                        id="date-picker"
                        label="Date"
                        placeholder="Select a date"
                        defaultDate={formData.paymentDate}
                        onChange={(dates, currentDateString) => {
                            console.log({ dates, currentDateString });
                            setFormData((prev) => ({
                            ...prev!,
                            paymentDate: currentDateString, 
                            }));
                        }}
                    />
                </div>

               {/* Currency */}
                <div>
                    <Label>Select Currency</Label>
                    <Select<OptionStringType>
                        options={CurrencyOptions}
                        placeholder="Select Currency"
                        value={
                        formData
                            ? CurrencyOptions.find((option) => option.value === formData.currency)
                            : null
                        }
                        onChange={(selectedOption) => {
                        setFormData((prev) => ({
                            ...prev!,
                            currency: selectedOption!.value,
                        }));
                        }}
                        styles={selectStyles}
                        classNamePrefix="react-select"
                    />
                </div>
                
                {/* Paid Amount */}
                <div>
                <Label>Amount</Label>
                <Input
                    type="number"
                    name="amountPaid"
                    placeholder="0"
                    value={formData.amountPaid}
                    onChange={handleChange}
                />
                </div>

                <div>
                    <Label>Select Payment Account</Label>
                    <Select
                        options={
                        paymentAccounts
                            .map((b) => ({
                                label: `${b.accountName}`,
                                value: b.id,
                            })) || []
                        }
                        placeholder="select Stock Accounts"
                        value={
                            paymentAccounts
                            ?.filter((b) => b.id === formData.bankId)
                            .map((b) => ({ label: b.accountName, value: b.id }))[0] || null
                        }
                        onChange={(selectedOption) =>
                            setFormData((prev) => ({
                                ...prev,
                                bankId: selectedOption?.value ?? 0,
                            }))
                        }
                        isClearable
                        styles={selectStyles}
                        classNamePrefix="react-select"
                    />
                </div>

                {/* Note */}
                <div className="md:col-span-2">
                    <Label>Description / Note</Label>
                    <Input
                        type="text"
                        name="note"
                        placeholder="Optional note"
                        value={formData.note}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" variant="success">
                Submit
                </Button>
            </div>
            </form>
        </ComponentCard>
        </div>
    );
}
