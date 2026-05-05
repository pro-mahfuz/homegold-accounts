import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid';
import {
  PaginationControl,
  SearchControl,
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

import { Payment } from "../features/paymentTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";

import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectPaymentStatus, selectAllPaymentPaginated, selectTotalPages } from "../features/paymentSelectors.ts";
import { fetchAllPaginated, destroy } from "../features/paymentThunks.ts";

export default function PaymentList() {
  
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));

  const payments = useSelector(selectAllPaymentPaginated);
  const status = useSelector(selectPaymentStatus);
  const totalPages = useSelector(selectTotalPages);

  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    dispatch(fetchAllPaginated({ page: currentPage, limit: itemsPerPage, system:1, filterText: filterText }));
  }, [dispatch, filterText, itemsPerPage, currentPage]);

  const handleEdit = (payment: Payment) => {
    navigate(`/payment/${payment.id}/edit`);
  };

  const handleDelete = async () => {
    if (!selectedPayment) return;

    try {
      // You can implement a deleteSupplier thunk and use it here:
      dispatch(destroy(selectedPayment.id!)).unwrap();
      toast.success("Payment deleted successfully");
      //navigate(`/payment/list`);
    } catch (error) {
      toast.error("Failed to delete payment");
    }
    closeAndResetModal();
    dispatch(fetchAllPaginated({ page: currentPage, limit: itemsPerPage, system:1, filterText: filterText }));
  };

  const handleView = (payment: Payment) => {
    navigate(`/payment/${payment.id}/view`);
  };

  const closeAndResetModal = () => {
    setSelectedPayment(null);
    closeModal();
  };

  // Reset current page if it exceeds total pages
  useEffect(() => {
    if (totalPages && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleListRefresh = () => {
    setCurrentPage(1);
  };

  return (
    <>
      <PageMeta
        title="Payment List"
        description="Invoice Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Payment List" />

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

          <button
            onClick={() => {navigate('/payment/create')}}
            className="bg-lime-600 text-white px-2 py-1 rounded-full hover:bg-lime-900 mr-4"
          >
            Create
          </button>
            
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          
          <SearchControl value={filterText} onChange={setFilterText} />

          <div className="px-4">
            <Table>
              <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-sky-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                <TableRow>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Sl</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Date</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Reference No</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Payment Type</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Invoice Ref</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Party Name</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Payment Currency</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Amount</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Payment Account</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Created By</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Updated By</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-1 py-1">Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {status === 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={12} className="border border-gray-500 text-center px-1 py-1 text-gray-500 dark:text-gray-300">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="border border-gray-500 text-center px-1 py-1 text-gray-500 dark:text-gray-300">
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment, index) => (
                    <TableRow key={index} className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400 min-w-min">
                        {payment.paymentDate}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.paymentRefNo}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.paymentType}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.invoiceRefNo ? payment.invoiceRefNo : "-"}
                      </TableCell>
                      
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.party?.name}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.currency}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.amountPaid}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.bank?.accountName}
                      </TableCell>
                      
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.createdByUser ? payment.createdByUser : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.updatedByUser ? payment.updatedByUser : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm overflow-visible">
                        <Menu as="div" className="relative inline-block text-left">
                          <MenuButton className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-1 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none">
                            Actions
                            <ChevronDownIcon className="h-4 w-4 text-white" />
                          </MenuButton>

                          <MenuItems className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-sky-500 ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              {/* <MenuItem>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleView(payment)}
                                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                    View
                                  </button>
                                )}
                              </MenuItem> */}
                              <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleView(payment)}
                                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                    >
                                      <EyeIcon className="h-4 w-4" />
                                      View
                                    </button>
                                  )}
                                </MenuItem>
                              {/* )} */}

                              { user?.role?.permissions?.some(p => p.action === "edit_payment") && (
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleEdit(payment)}
                                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                      Edit
                                    </button>
                                  )}
                                </MenuItem>
                              )}

                              { user?.role?.permissions?.some(p => p.action === "delete_payment") && (
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => {
                                        setSelectedPayment(payment);
                                        openModal();
                                      }}
                                      className={`${active ? 'bg-red-100 text-red-700' : 'text-red-600'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                      Delete
                                    </button>
                                  )}
                                </MenuItem>
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
          

          {/* Pagination Controls */}
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
        title="Are you sure you want to delete this supplier?"
        width="400px"
        onCancel={closeAndResetModal}
        onConfirm={handleDelete}
      />
    </>
  );
}
