import { FormEvent, ChangeEvent, useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Textarea from "../../../components/form/input/TextArea.tsx";
import DatePicker from "../../../components/form/date-picker.tsx";
import Button from "../../../components/ui/button/Button";
import Select from "react-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Checkbox from "../../../components/form/input/Checkbox.tsx";

import { OptionStringType } from "../../types.ts";
import { Invoice } from "../features/invoiceTypes";
import { Item } from "../../item/features/itemTypes.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { update, fetchById, fetchAllInvoicePagination, fetchAllInvoice } from "../features/invoiceThunks";

import { AppDispatch } from "../../../store/store";
import { selectAllParties } from "../../party/features/partySelectors";
import {
  selectAllCategory,
  selectCategoryById,
} from "../../category/features/categorySelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectInvoiceById } from "../features/invoiceSelectors";
import { selectAllInvoice, selectInvoiceStatus } from "../../invoice/features/invoiceSelectors.ts";

import { selectStyles, CurrencyOptions, formatInvoiceTypeLabel, isUnfixSaleTransterType, normalizeInvoiceTypeValue, UNFIX_SALE_TRANSTER_TYPES } from "../../types.ts";
import { selectAllUnitByBusiness } from "../../unit/features/unitSelectors.ts";
import { fetchAllUnit } from "../../unit/features/unitThunks.ts";
import { selectAllWarehouse } from "../../warehouse/features/warehouseSelectors.ts";
import { fetchAllWarehouse } from "../../warehouse/features/warehouseThunks.ts";
import { selectAllAccount } from "../../account/features/accountSelectors.ts";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";
import { selectAllItemByBusiness } from "../../item/features/itemSelectors.ts";
import { fetchAllItem } from "../../item/features/itemThunks.ts";
import { fetchParty } from "../../party/features/partyThunks.ts";

const MANDATORY_WHOLESALE_PAID_TYPES = ["wholesale_purchase", "wholesale_sale"];

export default function InvoiceEditForm() {
    const { id } = useParams();

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Invoice>({
        id: 0,
        businessId: 0,
        categoryId: 0,
        invoiceType: "",
        invoiceRefId: 0,
        partyId: 0,
        date: "",
        note: "",
        items: [],
        currency: "AED",
        totalAmount: 0,
        isVat: false,
        isFullPaid: false,
        bankId: 0,
        vatPercentage: 0,
        discount: null,
        grandTotal: 0,
        paidTotal: null,
        createdBy: 0,
        updatedBy: 0,
        system: 2,
        ounceRate: undefined,
        ounceRateGram: undefined,
        discountTotal: 0
    });

    const authUser = useSelector(selectAuth);
    const user = useSelector(selectUserById(Number(authUser?.user?.id)));
    const invoice = useSelector(selectInvoiceById);
    const invoices = useSelector(selectAllInvoice);
    const matchingParties = useSelector(selectAllParties);
    const categories = useSelector(selectAllCategory);
    const goldCategoryId = categories.find((category) => category.name.toLowerCase() === "gold")?.id ?? 0;
    const UnitOptions = useSelector(selectAllUnitByBusiness(Number(user?.business?.id)));
    const itemData = useSelector(selectAllItemByBusiness(user?.business?.id || 0));
    const status = useSelector(selectInvoiceStatus);

    const [currentItem, setCurrentItem] = useState<Item>({
        itemId: 0,
        name: "",
        price: 0,
        vatPercentage: 0,
        quantity: 0,
        subTotal: 0,
        warehouseId: null,
        warehouseName: '',
        itemGrandTotal: 0,
        system: 1,
        itemVat: 0
    });

    useEffect(() => {
        if ( matchingParties.length === 0) dispatch(fetchParty({ type: "all" }));
        dispatch(fetchAllCategory());
        dispatch(fetchAllItem());
        dispatch(fetchAllUnit());
        dispatch(fetchAllWarehouse());
        dispatch(fetchAllAccount());
        if (id) dispatch(fetchById(Number(id)));
    }, [dispatch, id]);

    useEffect(() => {
        if (["unfix_sale", ...UNFIX_SALE_TRANSTER_TYPES].includes(invoice?.invoiceType?.toLowerCase() ?? "")) {
            dispatch(fetchAllInvoice());
        }
    }, [dispatch, invoice?.invoiceType]);

    useEffect(() => {
        if (user?.business?.id && invoice) {
            setFormData({
                id: invoice.id,
                businessId: user.business.id,
                categoryId: Number(invoice.categoryId) || goldCategoryId || 0,
                invoiceType: normalizeInvoiceTypeValue(invoice.invoiceType),
                invoiceRefId: invoice.invoiceRefId,
                partyId: invoice.partyId,
                date: invoice.date,
                note: invoice.note,
                items: invoice.items,
                currency: invoice.currency,
                totalAmount: invoice.totalAmount,
                isVat: invoice.isVat,
                isFullPaid: invoice.isFullPaid,
                bankId: invoice.bankId,
                vatPercentage: invoice.vatPercentage,
                discount: invoice.discount,
                grandTotal: invoice.grandTotal,
                vatAmount: invoice.vatAmount,
                paidTotal: invoice.paidTotal,
                createdBy: invoice.createdBy,
                updatedBy: user.id,
                system: 1,
                ounceRate: invoice.ounceRate,
                ounceRateGram: invoice.ounceRateGram,
            });
        }

    }, [user, invoice, goldCategoryId]);

    const categoryItem = useSelector(selectCategoryById(Number(formData.categoryId)));
    const normalizedInvoiceType = formData.invoiceType?.toLowerCase() ?? "";
    const invoiceTitle = formatInvoiceTypeLabel(formData.invoiceType);
    const selectedCategoryName = categoryItem?.name?.toLowerCase() ?? "gold";
    const isStockCategory = ["currency", "gold"].includes(selectedCategoryName);
    const isMandatoryWholesalePaidType = MANDATORY_WHOLESALE_PAID_TYPES.includes(normalizedInvoiceType);
    const supportsInvoicePayment = ["sale", "wholesale_purchase", "wholesale_sale"].includes(normalizedInvoiceType);
    const isSalePaymentType = ["sale", "wholesale_sale"].includes(normalizedInvoiceType);
    const requiresWarehousePerItem = !isStockCategory && ["sale", "wholesale_sale"].includes(normalizedInvoiceType);
    const paymentActionLabel = isSalePaymentType ? "Received" : "Paid";
    const paymentCheckboxLabel = isSalePaymentType ? "Is Full Received" : "Is Full Paid";
    const getFinalInvoiceAmount = (grandTotal: number, discount: number | null | undefined) =>
        Math.max(0, (grandTotal ?? 0) - (discount ?? 0));
    const transferSourceOptions = useMemo(
        () =>
            invoices
                .filter((entry) => ["unfix_sale", ...UNFIX_SALE_TRANSTER_TYPES].includes(entry.invoiceType?.toLowerCase() ?? "") && Number(entry.id) !== Number(formData.id))
                .map((entry) => ({
                    label: `${entry.invoiceNo ?? `${entry.prefix ?? "INV"}-${entry.id}`} - ${entry.party?.name ?? "Unknown Party"}`,
                    value: Number(entry.id),
                    partyId: Number(entry.partyId) || 0,
                })),
        [formData.id, invoices]
    );
    const selectedTransferSource = useMemo(
        () =>
            transferSourceOptions.find((option) => option.value === Number(formData.invoiceRefId)) ?? null,
        [formData.invoiceRefId, transferSourceOptions]
    );
    const selectedTransferSourceParty = useMemo(
        () =>
            matchingParties.find((party) => party.id === Number(selectedTransferSource?.partyId)) ?? null,
        [matchingParties, selectedTransferSource]
    );
    const warehouses = useSelector(selectAllWarehouse);
    const paymentAccounts = useSelector(selectAllAccount);

    useEffect(() => {
        if (!formData.isFullPaid) return;

        const finalAmount = getFinalInvoiceAmount(formData.grandTotal ?? 0, formData.discount);
        if ((formData.paidTotal ?? 0) === finalAmount) return;

        setFormData((prev) => ({
            ...prev,
            paidTotal: finalAmount,
        }));
    }, [formData.isFullPaid, formData.grandTotal, formData.discount]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
        ...prev,
        [name]: name === "partyId" || name === "categoryId" ? Number(value) : value,
        }));
    };

    const calculateTotals = (items: Item[], isVat: boolean, discount: number) => {
            
        const updatedItems = items.map(item => {
            const getItem = itemData.find(i => i.id === item.itemId);

            const subTotal = (item.price ?? 0) * (item.quantity ?? 0);
            const vatAmount = isVat === true ? (subTotal * Number(getItem?.vatPercentage)) / 100 : 0;

            return {
                ...item,
                itemVat: vatAmount,
                subTotal,
                itemGrandTotal: subTotal + vatAmount,
            };
        });

        const totalSubTotal = updatedItems.reduce((sum, i) => sum + i.subTotal, 0);
        const totalVatTotal = updatedItems.reduce((sum, i) => sum + i.itemVat, 0);
        const totalGrandTotal = updatedItems.reduce((sum, i) => sum + i.itemGrandTotal, 0);
        const discountedTotal = Math.max(0, totalGrandTotal - discount);

        return { updatedItems, totalSubTotal, totalVatTotal, totalGrandTotal, discountedTotal };
    };
    
    const addItem = () => {
        // if (
        //     !currentItem.itemId ||
        //     (currentItem.price ?? 0) <= 0 ||
        //     (currentItem.quantity ?? 0) <= 0
        // ) {
        //     toast.error("Please fill all item fields properly");
        //     return;
        // }

        const newItems = [...formData.items, { ...currentItem, uniqueId: Date.now() }];
        const { updatedItems, totalSubTotal, totalVatTotal, totalGrandTotal } = calculateTotals(newItems, formData.isVat ?? false, formData.discount ?? 0);

        const vatRate = formData.isVat ? user?.business?.vatPercentage ?? 0 : 0;
        setFormData(prev => ({
            ...prev,
            items: updatedItems,
            totalAmount: totalSubTotal,
            grandTotal: totalGrandTotal,
            vatAmount: totalVatTotal,
            vatPercentage: vatRate,
        }));

        setCurrentItem({
            itemId: 0,
            uniqueId: Date.now(),
            name: '',
            price: 0,
            quantity: 0,
            vatPercentage: 0,
            unit: '',
            subTotal: 0,
            warehouseId: null,
            warehouseName: "",
            itemGrandTotal: 0,
            system: 1,
            itemVat: 0
        });
    };

    const removeItem = (item: Item) => { 
        const newItems = formData.items.filter(i => 
            i.uniqueId !== item.uniqueId
        );

        console.log("removeItem- ", newItems);

        const { updatedItems, totalSubTotal, totalVatTotal, totalGrandTotal } = calculateTotals(
            newItems,
            formData.isVat ?? false,
            formData.discount ?? 0
        );

        setFormData(prev => ({
            ...prev,
            items: updatedItems,
            totalAmount: totalSubTotal,
            grandTotal: totalGrandTotal,
            vatAmount: totalVatTotal,
        }));
    };

    const handleVatChange = (checked: boolean) => {
        const { updatedItems, totalSubTotal, totalVatTotal, totalGrandTotal } = calculateTotals(formData.items, checked, formData.discount ?? 0);
        setFormData(prev => ({
            ...prev,
            isVat: checked,
            items: updatedItems,
            totalAmount: totalSubTotal,
            grandTotal: totalGrandTotal,
            vatAmount: totalVatTotal,
            vatPercentage: totalVatTotal > 0 ? user?.business?.vatPercentage : 0,
            paidTotal: null,
            isFullPaid: false
        }));
    };

    const handleFullPaidChange = (isfullPaid: boolean) => {
        const finalAmount = getFinalInvoiceAmount(formData.grandTotal ?? 0, formData.discount);
        
        setFormData(prev => ({
            ...prev,
            paidTotal : isfullPaid ? finalAmount : null,
            isFullPaid : isfullPaid
        }));
        
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true); // start loading
        try {
            const effectiveCategoryId = Number(formData.categoryId) || goldCategoryId;
            if (!effectiveCategoryId) {
                toast.error("Gold category not found.");
                setLoading(false);
                return;
            }

            if (isMandatoryWholesalePaidType && !formData.isFullPaid) {
                toast.error("Is Full Paid is mandatory for wholesale purchase and wholesale sale invoices.");
                setLoading(false);
                return;
            }

            if (isMandatoryWholesalePaidType && !(Number(formData.bankId) > 0)) {
                toast.error("Paid Account is mandatory for wholesale purchase and wholesale sale invoices.");
                setLoading(false);
                return;
            }

            if (requiresWarehousePerItem && formData.items.some((item) => Number(item.itemId) > 0 && !(Number(item.warehouseId) > 0))) {
                toast.error("Warehouse is mandatory for all wholesale sale items.");
                setLoading(false);
                return;
            }

            if (isUnfixSaleTransterType(normalizedInvoiceType) && !(Number(formData.invoiceRefId) > 0)) {
                toast.error("Transfer source invoice is required.");
                setLoading(false);
                return;
            }

            const payload: Invoice = {
                ...formData,
                categoryId: effectiveCategoryId,
            };
            if (isMandatoryWholesalePaidType) {
                payload.paidTotal = getFinalInvoiceAmount(formData.grandTotal ?? 0, formData.discount);
                payload.isFullPaid = true;
            }

            console.log("formData: ", payload);
            await dispatch(update(payload));
            toast.success("Invoice updated successfully!");
            //const categoryId = 0;
            const saleTypes = ["sale", "fix_sale", "unfix_sale", "wholesale_sale", ...UNFIX_SALE_TRANSTER_TYPES];
            const invoiceType = saleTypes.includes(formData.invoiceType ?? '') ? "sale" : "purchase";
            dispatch(fetchAllInvoicePagination({ page: 1, limit: 10, type: invoiceType }));
            navigate(`/invoice/${invoice?.id}/view`);
        } catch (err) {
            toast.error("Failed to update invoice.");
        } finally {
            setLoading(false); // stop loading
        }
    };

    const handleView = (invoice: Invoice) => {
        invoice.invoiceType === "clearance_bill"
        ? navigate(`/bill/${invoice.id}/view`)
        : navigate(`/invoice/${invoice.id}/view`);
    };

    const handleList = (invoice: Invoice) => {
        if (!invoice.invoiceType) return; // stop if undefined

        if (invoice.invoiceType === "clearance_bill") {
            navigate("/invoice/all/0/list");
            return;
        }

        const purchaseTypes = ["purchase", "wholesale_purchase", "fix_purchase", "unfix_purchase"];
        const path = purchaseTypes.includes(invoice.invoiceType)
            ? "/invoice/purchase/0/list"
            : "/invoice/sale/0/list";

        navigate(path);
    };

  return (
    <div>
      <PageMeta title={`${invoiceTitle || "Invoice"} Update`} description="Edit Invoice" />
      <PageBreadcrumb pageTitle={`${invoiceTitle || "Invoice"} Update`} />
      
      <div className="mb-4 flex justify-start">
        <div>
            <button
                onClick={() => navigate(-1)}
                className="bg-red-400 text-white px-2 py-1 rounded-full hover:bg-red-700 mr-4"
            >
                Back
            </button>

            <button
                onClick={() => {if (invoice)  handleList(invoice)}}
                className="bg-fuchsia-400 text-white px-2 py-1 rounded-full hover:bg-fuchsia-700 mr-4"
            >
                Invoice List
            </button>

            <button
                onClick={() => {
                    if (invoice) handleView(invoice);
                }}
                className="bg-blue-600 text-white px-2 py-1 rounded-full hover:bg-blue-700"
            >
                View
            </button>
            
        </div>
      </div>
      <ComponentCard title={`Edit Invoice #${invoice?.invoiceNo}`}>
        {status === 'loading' && matchingParties.length === 0 ? (
            <div className="flex justify-center py-10">
                <p className="text-gray-500 text-lg font-medium animate-pulse">
                Loading data...
                </p>
            </div>
        ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Invoice Details */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Date */}
                <div>
                    <DatePicker
                        id="date-picker"
                        label="Date"
                        placeholder="Select a date"
                        defaultDate={formData.date}
                        onChange={(dates, currentDateString) => {
                            // Handle your logic
                            console.log({ dates, currentDateString });
                            setFormData((prev) => ({
                                ...prev!,
                                date: currentDateString,
                            }))
                        }}
                    />
                    
                </div>

                {/* Invoice Ref ID */}
                { isUnfixSaleTransterType(normalizedInvoiceType) && (
                    <div>
                        <Label>Transfer From Invoice</Label>
                        <Select
                            options={transferSourceOptions}
                            placeholder="Select source invoice"
                            value={selectedTransferSource}
                            isClearable
                            onChange={(selectedOption) => {
                                setFormData(prev => ({
                                    ...prev,
                                    invoiceRefId: Number(selectedOption?.value) || 0,
                                }));
                            }}
                            styles={selectStyles}
                            classNamePrefix="react-select"
                        />
                        {selectedTransferSourceParty && (
                            <p className="mt-1 text-xs text-gray-500">
                                Source party: {selectedTransferSourceParty.name}
                            </p>
                        )}
                    </div>
                )}

                {/* Currency */}
                <div>
                    <Label>Payment Currency</Label>
                    <Select<OptionStringType>
                        options={CurrencyOptions}
                        placeholder="Select currency"
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

                {/* Search Party */}
                <div>
                    <Label>Select Party</Label>
                    <Select
                        options={matchingParties.map((p) => ({
                            label: p.name,
                            value: p.id,
                        }))}
                        placeholder="Select party"
                        value={
                            matchingParties
                                .filter((p) => p.id === formData.partyId)
                                .map((p) => ({ label: p.name, value: p.id }))[0] || null
                        }
                        onChange={(selectedOption) =>
                            setFormData((prev) => ({
                                ...prev,
                                partyId: selectedOption?.value ?? 0,
                            }))
                        }
                        isClearable
                        styles={selectStyles}
                        classNamePrefix="react-select"
                    />
                </div>

                {/* isVat */}
                { formData.invoiceType !== "clearance_bill" && (
                <div className="flex flex-col items-center text-center">
                    <Label>Select Vat (if have)</Label>
                    <Checkbox
                        key={formData.id}
                        id={`is-vat-check`}
                        label={`Is Vated`}
                        checked={!!formData.isVat}
                        onChange={handleVatChange}
                    />
                </div>
                )}

                { categories.find((c) => c.id === formData.categoryId && c.name.toLowerCase() === "gold" ) && (
                    <div className="flex">
                        <div>
                            <Label>Gold Rate (Ounce)</Label>
                            <Input
                                type="number"
                                name="ounceRate"
                                value={formData.ounceRate}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    const value = Number(e.target.value);
                                    const gramRate = Number(((value / 31.1034768) * 3.67).toFixed(2));

                                    setFormData(prev => ({
                                        ...prev,
                                        ounceRate: value,
                                        ounceRateGram: gramRate
                                    }));

                                    // Get category name
                                    const selectedCategory = categories.find(
                                        (c) => c.id === formData.categoryId
                                    )?.name.toLowerCase() ?? "";

                                    // Update ALL items' prices if category is gold
                                    const updatedItems = formData.items.map((item) => ({
                                        ...item,
                                        price:
                                            selectedCategory === "gold" && Number(item.purity) > 0
                                                ? gramRate            // gold → price = ounceRate
                                                : item.price,      // others → keep existing price
                                    }));

                                    // Recalculate totals
                                    const { updatedItems: recalculated, totalSubTotal, totalVatTotal, totalGrandTotal } =
                                    calculateTotals(updatedItems, formData.isVat ?? false, formData.discount ?? 0);

                                    setFormData((prev) => ({
                                        ...prev,
                                        items: recalculated,
                                        totalAmount: totalSubTotal,
                                        grandTotal: totalGrandTotal,
                                        vatAmount: totalVatTotal,
                                    }));
                                }}
                                placeholder="0.00"
                                min="0"
                                step={0.01}
                                className="max-w-40"
                            />
                        </div>
                        <div className="flex items-center pt-5 pl-2">=</div>
                        <div className="ml-2">
                            <Label>Gold Rate (Gram)</Label>
                            <Input
                                type="number"
                                name="ounceRateGram"
                                value={formData.ounceRateGram}
                                placeholder="0.00"
                                min="0"
                                step={0.01}
                                className="max-w-40"
                                readonly={true}
                            />
                        </div>
                    </div>
                    
                    
                )}
            </div>

            {/* Items Table */}
            <Table className="mt-15">
                <TableHeader className="border-b border-t border-gray-100 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                    <TableRow>
                        <TableCell isHeader className="text-center px-4 py-2">Sl</TableCell>
                        <TableCell isHeader className="text-center px-4 py-2">Item</TableCell>
                        <TableCell isHeader className="text-center px-4 py-2">Quantity</TableCell>
                        <TableCell isHeader className="text-center px-4 py-2">Unit</TableCell>
                        <TableCell isHeader className="text-center px-4 py-2">Price</TableCell>
                        <TableCell isHeader className="text-center px-4 py-2">Sub-Total</TableCell>
                        { requiresWarehousePerItem && (
                        <TableCell isHeader className="text-center px-4 py-2">Warehouse</TableCell>
                        )}
                        <TableCell isHeader className="text-center px-4 py-2">Action</TableCell>
                    </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {formData.items.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                            No items added yet.
                        </TableCell>
                    </TableRow>
                ) : (
                    formData.items.map((item, index) => (
                        <TableRow key={item.uniqueId}>
                            <TableCell className="text-center px-4 py-2">{index + 1}</TableCell>
                            <TableCell className="text-center px-4 py-2">
                                <Select
                                    options={
                                        categoryItem?.items?.map((i) => ({
                                            label: i.name,
                                            value: i.id,
                                            unit: i.unit,
                                            itemVat: i.vatPercentage,
                                            itemType: i.itemType,
                                        })) || []
                                    }
                                    placeholder="Select item"
                                    value={
                                        categoryItem?.items?.filter((i) => i.id === formData.items[index].itemId)
                                        .map((i) => ({
                                            label: i.name,
                                            value: i.id,
                                            unit: i.unit,
                                            itemVat: i.vatPercentage,
                                            itemType: i.itemType,
                                        }))[0] || null
                                    }
                                    onChange={(selectedOption) => {
                                        
                                        // Prevent duplicate itemType
                                        const duplicate = formData.items.some(
                                            (itm, idx) => idx !== index && itm.itemType === selectedOption?.itemType
                                        );

                                        if (duplicate) {
                                            toast.error("You can not add same type of item");
                                            return;
                                        }

                                        // Update selected item
                                        const updatedItems = [...formData.items];
                                        updatedItems[index] = {
                                            ...updatedItems[index],
                                            itemId: selectedOption?.value,
                                            name: selectedOption?.label,
                                            unit: selectedOption?.unit ?? "",
                                            vatPercentage: selectedOption?.itemVat ?? 0,
                                            itemType: selectedOption?.itemType ?? "",
                                        };

                                        // Recalculate totals
                                        const {
                                            updatedItems: recalculated,
                                            totalSubTotal,
                                            totalVatTotal,
                                            totalGrandTotal,
                                        } = calculateTotals(
                                            updatedItems,
                                            formData.isVat ?? false,
                                            formData.discount ?? 0
                                        );

                                        setFormData((prev) => ({
                                            ...prev,
                                            items: recalculated,
                                            totalAmount: totalSubTotal,
                                            grandTotal: totalGrandTotal,
                                            vatAmount: totalVatTotal,
                                            vatPercentage: formData.isVat ? user?.business?.vatPercentage : 0,
                                        }));
                                    }}
                                    isClearable
                                    styles={selectStyles}
                                    classNamePrefix="react-select"
                                />
                            </TableCell>

                            <TableCell className="text-center px-4 py-2">
                                <Input
                                    type="number"
                                    name="quantity"
                                    value={formData.items[index]?.quantity || ''}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        const value = Number(e.target.value);
                                        const updatedItems = [...formData.items];
                                        updatedItems[index] = {
                                        ...updatedItems[index],
                                        quantity: value,
                                        };

                                        // Recalculate totals
                                        const { updatedItems: recalculated, totalSubTotal, totalVatTotal, totalGrandTotal } =
                                        calculateTotals(updatedItems, formData.isVat ?? false, formData.discount ?? 0);

                                        setFormData((prev) => ({
                                        ...prev,
                                        items: recalculated,
                                        totalAmount: totalSubTotal,
                                        grandTotal: totalGrandTotal,
                                        vatAmount: totalVatTotal,
                                        }));
                                    }}
                                    placeholder="0"
                                    min="0"
                                    step={0.01}
                                    className="max-w-40"
                                />
                            </TableCell>

                            <TableCell className="text-center px-4 py-2">
                                <Select
                                    options={
                                        UnitOptions?.map((i) => ({
                                        label: i.name,
                                        value: i.name,
                                        })) || []
                                    }
                                    placeholder="Select unit"
                                    value={
                                        UnitOptions?.map((u) => ({ label: u.name, value: u.name }))
                                        .find((option) => option.value === formData.items[index]?.unit) || null
                                    }
                                    onChange={(selectedOption) => {
                                        const updatedItems = [...formData.items];
                                        updatedItems[index] = {
                                        ...updatedItems[index],
                                        unit: selectedOption?.value ?? '',
                                        };
                                        setFormData((prev) => ({
                                        ...prev,
                                        items: updatedItems,
                                        }));
                                    }}
                                    isClearable
                                    styles={selectStyles}
                                    classNamePrefix="react-select"
                                />
                            </TableCell>

                            <TableCell className="text-center px-4 py-2">
                                <Input
                                    type="number"
                                    name="price"
                                    value={formData.items[index]?.price || ''}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        const value = Number(e.target.value);
                                        const updatedItems = [...formData.items];
                                        updatedItems[index] = {
                                            ...updatedItems[index],
                                            price: value,
                                        };

                                        // Recalculate totals
                                        const { updatedItems: recalculated, totalSubTotal, totalVatTotal, totalGrandTotal } =
                                        calculateTotals(updatedItems, formData.isVat ?? false, formData.discount ?? 0);

                                        setFormData((prev) => ({
                                        ...prev,
                                        items: recalculated,
                                        totalAmount: totalSubTotal,
                                        grandTotal: totalGrandTotal,
                                        vatAmount: totalVatTotal,
                                        }));
                                    }}
                                    placeholder="0.00"
                                    min="0"
                                    step={0.01}
                                    className="max-w-40"
                                />
                            </TableCell>

                            <TableCell className="text-center px-4 py-2">{((item?.price ?? 0) * (item?.quantity ?? 0)).toFixed(2)}</TableCell>

                            { requiresWarehousePerItem && (
                                <TableCell className="text-center px-4 py-2">
                                    <Select
                                        options={
                                            warehouses?.map((w) => ({
                                            label: w.name,
                                            value: w.id,
                                            })) || []
                                        }
                                        placeholder="Select warehouse"
                                        value={
                                            warehouses
                                            .map((w) => ({ label: w.name, value: w.id }))
                                            .find((option) => option.value === formData.items[index]?.warehouseId) || null
                                        }
                                        onChange={(selectedOption) => {
                                            const updatedItems = [...formData.items];
                                            updatedItems[index] = {
                                            ...updatedItems[index],
                                            warehouseId: selectedOption ? Number(selectedOption.value) : null,
                                            warehouseName: selectedOption?.label ?? "",
                                            };
                                            setFormData((prev) => ({
                                            ...prev,
                                            items: updatedItems,
                                            }));
                                        }}
                                        isClearable
                                        styles={selectStyles}
                                        classNamePrefix="react-select"
                                    />

                                </TableCell>
                            )}

                            <TableCell className="text-center px-4 py-2">
                                <button
                                    onClick={() => removeItem(item)}
                                    className="text-red-500 hover:underline"
                                    type="button"
                                >
                                Remove
                                </button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
                </TableBody>
            </Table>

            <div className="flex justify-end items-end mt-4 mb-15">
                <Button 
                    type="button" 
                    onClick={addItem} 
                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md shadow"
                >
                    Add Item
                </Button>
            </div>


            <div className="grid grid-cols-2 gap-6">
                {/* Note */}
                <div>
                    <Label>Note</Label>
                    <Textarea
                        placeholder="Enter your note here"
                        value={formData.note}
                        onChange={(value) => {
                            setFormData(prev => ({
                                ...prev,
                                note: value
                            }));
                        }}
                    />
                </div>

                <Table>
                    <TableHeader className="border border-gray-500 dark:border-white/[0.05] text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                        <TableRow>
                            <TableCell isHeader className="border border-gray-500 text-center px-4 py-2">Total Amount</TableCell>
                            <TableCell isHeader className="border border-gray-500 text-center px-4 py-2">Vat Amount</TableCell>
                            <TableCell isHeader className="border border-gray-500 text-center px-4 py-2">Net Amount</TableCell>
                            <TableCell isHeader className="border border-gray-500 text-center px-4 py-2">Discount</TableCell>
                            <TableCell isHeader className="border border-gray-500 text-center px-4 py-2">Grand Total</TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        <TableRow>
                            <TableCell className="border border-gray-500 text-center px-4 py-2 font-semibold">{formData.totalAmount?.toFixed(2)}</TableCell>
                            <TableCell className="border border-gray-500 text-center px-4 py-2 font-semibold">{formData.vatAmount?.toFixed(2)}</TableCell>
                            <TableCell className="border border-gray-500 text-center px-4 py-2 font-semibold">{formData.grandTotal?.toFixed(2)}</TableCell>
                            <TableCell className="border border-gray-500 text-center px-4 py-2 font-semibold w-40">
                                    <Input
                                        type="number"
                                        name="discount"
                                        placeholder="0.00"
                                        value={formData.discount ?? ''}  // show empty if undefined
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                            const value = e.target.value;

                                            setFormData(prev => {
                                                const updatedForm = {
                                                    ...prev,
                                                    discount: value === '' ? null : Number(value) // ensure number
                                                };

                                                // Recalculate totals with new discount
                                                const {
                                                    updatedItems: recalculated,
                                                    totalSubTotal,
                                                    totalVatTotal,
                                                    totalGrandTotal,
                                                    discountedTotal
                                                } = calculateTotals(
                                                    updatedForm.items,
                                                    updatedForm.isVat ?? false,
                                                    updatedForm.discount ?? 0
                                                );

                                                return {
                                                    ...updatedForm,
                                                    items: recalculated,
                                                    totalAmount: totalSubTotal,
                                                    grandTotal: totalGrandTotal,
                                                    vatAmount: totalVatTotal,
                                                    discountTotal: discountedTotal
                                                };
                                            });
                                        }}
                                        min="0"
                                        step={0.01}
                                    />
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-4 py-2 font-semibold">{((formData.grandTotal ?? 0) - (formData.discount ?? 0)).toFixed(2)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mt-2">
                <div></div>
                <div></div>
                <div></div>
                { supportsInvoicePayment && (
                <>
                    {/* isFull Paid */}
                    <div className="flex items-center pt-5 pl-2">
                        <Checkbox className="justify-center"
                            key={`is-fullpaid-check-${formData.id}`}
                            id={`is-fullpaid-check`}
                            label={paymentCheckboxLabel}
                            checked={!!formData.isFullPaid}
                            onChange={handleFullPaidChange}
                        />
                    </div>

                    {/* Paid Amount */}
                    <div>
                        <Label>{paymentActionLabel} Amount</Label>
                        <Input
                            type="number"
                            name="paidTotal"
                            placeholder="0"
                            onChange={handleChange}
                            value={formData.paidTotal ?? ''}
                        />
                    </div>

                    {/* Payment Account */}
                    <div>
                        <Label>{paymentActionLabel} Account</Label>
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
                </>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    variant="success"
                    disabled={loading}
                    >
                    {loading ? 'Submitting...' : 'Submit'}
                </Button>
            </div>
            </form>
        )}
      </ComponentCard>
    </div>
  );
}
