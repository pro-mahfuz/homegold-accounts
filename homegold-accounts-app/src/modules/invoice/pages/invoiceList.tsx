import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid';
import {
  SearchControl,
  PaginationControl,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table/index.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { toast } from "react-toastify";

import { useModal } from "../../../hooks/useModal.ts";
import ConfirmationModal from "../../../components/ui/modal/ConfirmationModal.tsx";

import { Invoice } from "../features/invoiceTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";

import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import {
  selectAllInvoicePagination,
  selectInvoiceStatus,
  selectTotalPages
} from "../features/invoiceSelectors.ts";
import { fetchAllInvoicePagination, destroy } from "../features/invoiceThunks.ts";
import { selectAllCategory } from "../../category/features/categorySelectors";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { formatInvoiceTypeLabel, UNFIX_SALE_TRANSTER_TYPES } from "../../types.ts";

export default function InvoiceList() {
  const { invoiceType } = useParams() as { invoiceType: 'purchase' | 'sale' };
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser?.user?.id)));

  const invoices = useSelector(selectAllInvoicePagination);
  const status = useSelector(selectInvoiceStatus);
  const categories = useSelector(selectAllCategory);
  const hasVatInvoiceNoColumn = !categories.find((c) =>
    ["currency", "gold"].includes(c.name.toLowerCase())
  );
  const tableColumnCount = hasVatInvoiceNoColumn ? 19 : 18;

  const totalPages = useSelector(selectTotalPages);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Fetch data whenever page, limit, or invoiceType changes
  useEffect(() => {
    dispatch(fetchAllCategory());
    dispatch(fetchAllInvoicePagination({ page: currentPage, limit: itemsPerPage, type: invoiceType, filterText: filterText }));
  }, [dispatch, currentPage, itemsPerPage, invoiceType, filterText]);

  const handleView = (invoice: Invoice) => {
    navigate(`/invoice/${invoice.id}/view`);
  };

  const handleEdit = (invoice: Invoice) => {
    navigate(`/invoice/${invoice.id}/edit`);
  };

  const handleListRefresh = () => {
    setCurrentPage(1);
  };

  const handleFilterTextChange = (value: string) => {
    setFilterText(value);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!selectedInvoice) return;
    try {
      await dispatch(destroy(selectedInvoice.id!)).unwrap();
      toast.success("Invoice deleted successfully");
      dispatch(fetchAllInvoicePagination({ page: currentPage, limit: itemsPerPage, type: invoiceType }));
    } catch (error: any) {
      toast.error(error);
    }
    closeAndResetModal();
  };

  const closeAndResetModal = () => {
    setSelectedInvoice(null);
    closeModal();
  };

  // Reset current page if it exceeds total pages
  useEffect(() => {
    if (totalPages && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <>
      <PageMeta
        title={`${invoiceType ? invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1).toLowerCase() : ''} List`}
        description="Invoice Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle={`${invoiceType ? invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1).toLowerCase() : ''} List`} />

      {/* <div className="flex items-center space-x-4 mb-4">
        <Input
          type="number"
          name="invoiceId"
          value={filterText}
          onChange={(e) => setFilterText(Number(e.target.value))}
          placeholder="Invoice ID"
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={() => handleGoEdit(filterText)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>

        <button
          onClick={() => handleGoView(filterText)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          View
        </button>
      </div> */}

      {/* <div className="flex items-center space-x-4 mb-4">

        <div>
          <DatePicker
            id="from-date"
            label=""
            placeholder="Date"
            onChange={(dates, currentDateString) => {
                console.log({ dates, currentDateString });
                setFromDate(currentDateString);
            }}
          />
        </div>
        
        <Input
          type="number"
          name="filterText"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Invoice ID"
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={() => handleGoView(filterText)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Search
        </button>

        <button
          onClick={() => handleGoView(filterText)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Reset
        </button>
      </div> */}

      <div className="mb-4 flex justify-start">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-400 text-white px-2 py-1 rounded-full hover:bg-red-700 mr-4"
          >
              Back
          </button>

          <button
              onClick={() => {handleListRefresh()}}
              className="bg-fuchsia-400 text-white px-2 py-1 rounded-full hover:bg-fuchsia-700 mr-4"
          >
              Refresh
          </button>

          {invoiceType === "purchase" ? (
            <>
              <button
                onClick={() => {navigate('/invoice/unfix_purchase/create')}}
                className="bg-lime-600 text-white px-2 py-1 rounded-full hover:bg-lime-900 mr-4"
              >
                Unfix Purchase Add
              </button>

              <button
                onClick={() => {navigate('/invoice/fix_purchase/create')}}
                className="bg-emerald-600 text-white px-2 py-1 rounded-full hover:bg-emerald-900 mr-4"
              >
                Fix Purchase Add
              </button>
            </>
          ) : invoiceType === "sale" ? (
            <>
              <button
                onClick={() => {navigate('/invoice/unfix_sale/create')}}
                className="bg-lime-600 text-white px-2 py-1 rounded-full hover:bg-lime-900 mr-4"
              >
                Unfix Sale Add
              </button>

              <button
                onClick={() => {navigate('/invoice/unfix_sale_transter/create')}}
                className="bg-cyan-600 text-white px-2 py-1 rounded-full hover:bg-cyan-900 mr-4"
              >
                Unfix Sale Transfer Add
              </button>

              <button
                onClick={() => {navigate('/invoice/fix_sale/create')}}
                className="bg-emerald-600 text-white px-2 py-1 rounded-full hover:bg-emerald-900 mr-4"
              >
                Fix Sale Add
              </button>
            </>
          ) : (
            <button
              onClick={() => {navigate('/invoice/all/create')}}
              className="bg-lime-600 text-white px-2 py-1 rounded-full hover:bg-lime-900 mr-4"
            >
              Create
            </button>
          )}
            
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <SearchControl
            value={filterText}
            placeHolder="Search by date, invoice no, category, type, party, item"
            onChange={handleFilterTextChange}
          />

          <div className="px-4">
            <Table>
              <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-sky-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                <TableRow className="border border-gray-500">
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Sl</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Date</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Invoice No</TableCell>
                  {hasVatInvoiceNoColumn && (
                    <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Vat Invoice No</TableCell>
                  )}
                  
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Category</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Type</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Party Name</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Items</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Qty</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Unit</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Price</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Sub Total</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Vat Total</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Grand Total</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Discount</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Net Total</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Paid</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Due</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {status === 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={tableColumnCount} className="text-center py-4 text-gray-500 dark:text-gray-300">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tableColumnCount} className="text-center py-4 text-gray-500 dark:text-gray-300">
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice, index) => (
                    <TableRow key={invoice.id} className="border border-gray-500 dark:border-white/[0.05]">
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">{index + 1 + (currentPage - 1) * itemsPerPage}</TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">{invoice.date}</TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">{invoice.invoiceNo}</TableCell>
                      {hasVatInvoiceNoColumn && (
                        <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">{invoice.vatInvoiceRefNo}</TableCell>
                      )}
                      
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">{invoice.category?.name}</TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">{formatInvoiceTypeLabel(invoice.invoiceType)}</TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">{invoice.party?.name}</TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.items.map((item, idx) => (
                          <div key={idx}>{item.name}</div>
                        ))}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.items.map((item, idx) => (
                          <div key={idx}>{item.quantity}</div>
                        ))}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.items.map((item, idx) => (
                          <div key={idx}>{item.unit}</div>
                        ))}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.items.map((item, idx) => (
                          <div key={idx}>{item.price}</div>
                        ))}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.vatAmount?.toFixed(2)}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.grandTotal?.toFixed(2)}
                      </TableCell>

                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {Number(invoice.discount) > 0 ? invoice.discount?.toFixed(2) : '-'}
                      </TableCell>

                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {(Number(invoice.grandTotal) - Number(invoice.discount)).toFixed(2)}
                      </TableCell>
                      
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-green-700 dark:text-gray-400">
                        {["sale", "wholesale_sale", ...UNFIX_SALE_TRANSTER_TYPES].includes(invoice.invoiceType ?? "") 
                          ? Number(invoice.paymentInSum) > 0 ? invoice.paymentInSum?.toFixed(2) : '-'
                          : Number(invoice.paymentOutSum) > 0 ? invoice.paymentOutSum?.toFixed(2) : '-'
                        }
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-red-500 dark:text-gray-400">
                        {["sale", "wholesale_sale", ...UNFIX_SALE_TRANSTER_TYPES].includes(invoice.invoiceType ?? "") 
                          ? Number(invoice.paymentInSum) - Number(invoice.grandTotal) != 0 ? (Number(invoice.paymentInSum) + Number(invoice.discount) - Number(invoice.grandTotal)).toFixed(2) : '-'
                          : Number(invoice.paymentOutSum) - Number(invoice.grandTotal) != 0 ? (Number(invoice.paymentOutSum) + Number(invoice.discount) - Number(invoice.grandTotal)).toFixed(2) : '-'
                        }
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm overflow-visible">
                        <Menu as="div" className="relative inline-block text-left">
                          <MenuButton className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-1 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none">
                            Actions
                            <ChevronDownIcon className="h-4 w-4 text-white" />
                          </MenuButton>

                          <MenuItems className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-sky-500 ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              { user?.role?.permissions?.some(p => ["view_purchase","view_sale"].includes(p.action)) && (
                                <MenuItem>{({ active }) => (
                                  <button onClick={() => handleView(invoice)} className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-1 py-2 text-sm`}>
                                    <EyeIcon className="h-4 w-4" /> View
                                  </button>
                                )}</MenuItem>
                              )}
                              { user?.role?.permissions?.some(p => ["edit_purchase","edit_sale"].includes(p.action)) && (
                                <MenuItem>{({ active }) => (
                                  <button onClick={() => handleEdit(invoice)} className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-1 py-2 text-sm`}>
                                    <PencilIcon className="h-4 w-4" /> Edit
                                  </button>
                                )}</MenuItem>
                              )}
                              { user?.role?.permissions?.some(p => ["delete_purchase","delete_sale"].includes(p.action)) && (
                                <MenuItem>{({ active }) => (
                                  <button onClick={() => { setSelectedInvoice(invoice); openModal(); }} className={`${active ? 'bg-red-100 text-red-700' : 'text-red-600'} flex w-full items-center gap-2 px-1 py-2 text-sm`}>
                                    <TrashIcon className="h-4 w-4" /> Delete
                                  </button>
                                )}</MenuItem>
                              )}
                            </div>
                          </MenuItems>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages || 1}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
            showFirstLast={true}
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={isOpen}
        title="Are you sure you want to delete this invoice?"
        width="400px"
        onCancel={closeAndResetModal}
        onConfirm={handleDelete}
      />
    </>
  );
}
