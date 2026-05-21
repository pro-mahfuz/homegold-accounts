import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
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

import { Stock } from "../features/stockTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";

import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import {
  selectStockStatus,
  selectAllStock
} from "../features/stockSelectors.ts";
import { selectAllCategory } from "../../category/features/categorySelectors";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { fetchAllStock, destroy } from "../features/stockThunks.ts";
import { formatInvoiceTypeLabel, getMovementTypeLabel, isUnfixSaleTransterType } from "../../types.ts";

export default function StockList() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));

  const stocks = useSelector(selectAllStock);
  const status = useSelector(selectStockStatus);
  const categories = useSelector(selectAllCategory);

  const [filterText, setFilterText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  useEffect(() => {
    dispatch(fetchAllStock());
    dispatch(fetchAllCategory());
  }, [dispatch]);

  

  const filteredData = useMemo(() => {
    const search = filterText.toLowerCase();

    return stocks.filter((i) => {
      const invoiceDate = i.invoice?.date ? String(i.invoice.date) : "";
      const invoiceNo = i.invoiceRefNo ?? "";
      const itemName = i.item?.name ?? "";
      const stockRefNo = i.stockRefNo ?? "";
      const partyName = i.party?.name ?? "";

      return (
        invoiceDate.toLowerCase().includes(search) ||
        invoiceNo.toLowerCase().includes(search) ||
        itemName.toLowerCase().includes(search) ||
        stockRefNo.toLowerCase().includes(search) ||
        partyName.toLowerCase().includes(search)
      );
    });
  }, [stocks, filterText]);


  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);


  const handleEdit = (stock: Stock) => {

    navigate(`/stock/${stock.id}/edit`);
  };

  const handleDelete = async () => {
    if (!selectedStock) return;

    try {
      // You can implement a deleteSupplier thunk and use it here:
      await dispatch(destroy(selectedStock.id!)).unwrap();
      toast.success("Stock deleted successfully");
      closeAndResetModal();
    } catch (error) {
      toast.error("Failed to delete invoice");
    }
  };

  const closeAndResetModal = () => {
    setSelectedStock(null);
    closeModal();
  };

  const getStockTypeLabel = (stock: Stock) => {
    if (isUnfixSaleTransterType(stock.invoiceType)) {
      return formatInvoiceTypeLabel(stock.invoiceType);
    }

    return getMovementTypeLabel(stock.movementType);
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleListRefresh = () => {
    setCurrentPage(1);
    dispatch(fetchAllStock());
  };

  return (
    <>
      <PageMeta
        title="Stock List"
        description="Stock Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Stock List" />

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
            
        </div>

        <div>
          <button
            onClick={() => {navigate('/stock/create')}}
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
                <TableRow className="border border-gray-500">
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Sl</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Date</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Reference No</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Stock Type</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Invoice Ref</TableCell>
                  {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) ?
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Stock Money</TableCell>
                  : <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Item Details</TableCell>
                  }

                  {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) ?
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Stock Qty</TableCell>
                  : <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Qty</TableCell>
                  }

                  {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Unit</TableCell>
                  )}

                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">To Whom</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Stock Account</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Created By</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Updated By</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {status === 'loading' ? (
                    <TableRow>
                    <TableCell colSpan={13} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((stock, index) => (
                    <TableRow key={stock.id} className="border border-gray-500 dark:border-white/[0.05]">
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {((Number((filteredData.length / itemsPerPage)) - (currentPage - 1)) * itemsPerPage - index).toFixed(0)}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {stock.date}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {stock.stockRefNo}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {getStockTypeLabel(stock)}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {stock.invoiceRefNo ? stock.invoiceRefNo : "-"}
                      </TableCell>
                      
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {stock.item?.name}
                      </TableCell>
                      
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {stock.quantity}
                      </TableCell>
                      {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {stock.unit ? stock.unit.toUpperCase() : ''}
                      </TableCell>
                      )}
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {stock.party?.name ?? "-"}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {stock.warehouse?.name ?? stock.bank?.accountName}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {stock.createdByUser ? stock.createdByUser : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {stock.updatedByUser ? stock.updatedByUser : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm overflow-visible">
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
                                    onClick={() => handleView(stock)}
                                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                    View
                                  </button>
                                )}
                              </MenuItem> */}

                              { user?.role?.permissions?.some(p => p.action === "edit_stock") && (
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleEdit(stock)}
                                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                      Edit
                                    </button>
                                  )}
                                </MenuItem>
                              )}

                              { user?.role?.permissions?.some(p => p.action === "delete_stock") && (
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => {
                                        setSelectedStock(stock);
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
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
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
