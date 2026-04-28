import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon, PencilIcon, TrashIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import ConfirmationModal from "../../../components/ui/modal/ConfirmationModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useModal } from "../../../hooks/useModal";
import { AppDispatch } from "../../../store/store";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import {
  selectAllGoldPriceInByBusiness,
  selectGoldPriceInStatus,
  selectLatestGoldPriceIn,
} from "../features/goldPriceInSelectors";
import {
  createGoldPriceIn,
  destroyGoldPriceIn,
  fetchAllGoldPriceIn,
  fetchLatestGoldPriceIn,
  updateGoldPriceIn,
} from "../features/goldPriceInThunks";
import { GoldPriceIn } from "../features/goldPriceInTypes";

type FieldConfig = {
  name: keyof GoldPriceIn;
  label: string;
  value?: number | string | null;
};

const fieldGroups: { title: string; fields: FieldConfig[] }[] = [
  {
    title: "Market Base",
    fields: [
      { name: "goldSpotRate", label: "Gold Spot Rate ($)", value: "" },
      { name: "dollarRate", label: "Dollar Rate (AED)", value: 3.674 },
      { name: "ounceRateDirham", label: "Ounce Rate Dirham (AED)" },
      
    ],
  },
  {
    title: "Rate Base",
    fields: [
      { name: "ounceGram", label: "Ounce Gram" },
      { name: "999_rateGram", label: "999 Rate / Gram" },
      { name: "995_rateGram", label: "995 Rate / Gram" },
      { name: "920_rateGram", label: "920 Rate / Gram" },
    ],
  },
  {
    title: "Rate Matrix",
    fields: [
      { name: "buyRate", label: "Buy Rate" },
      { name: "sellRate", label: "Sell Rate" },
      { name: "carretRate", label: "Carret Rate" },
      { name: "buy_MC", label: "Buy MC" },
      { name: "sell_MC", label: "Sell MC" },
      { name: "carret_MC", label: "Carret MC" },
      { name: "buy_CC", label: "Buy CC" },
      { name: "sell_CC", label: "Sell CC" },
      { name: "carret_CC", label: "Carret CC" },
      { name: "buyAddProfit", label: "Buy Add Profit" },
      { name: "sellAddProfit", label: "Sell Add Profit" },
      { name: "carretAddProfit", label: "Carret Add Profit" },
      { name: "buyPricePerGram", label: "Buy Price / Gram" },
      { name: "sellPricePerGram", label: "Sell Price / Gram" },
      { name: "carretPricePerGram", label: "Carret Price / Gram" },
      { name: "boriGram", label: "Bori Gram" },
      { name: "buyTotalDirham", label: "Buy Total Dirham" },
      { name: "sellTotalDirham", label: "Sell Total Dirham" },
      { name: "carretTotalDirham", label: "Carret Total Dirham" },
      { name: "buyBdtRate", label: "Buy BDT Rate" },
      { name: "sellBdtRate", label: "Sell BDT Rate" },
      { name: "carretBdtRate", label: "Carret BDT Rate" },
      { name: "buyTotalBdtBori", label: "Buy Total BDT / Bori" },
      { name: "sellTotalBdtBori", label: "Sell Total BDT / Bori" },
      { name: "carretTotalBdtBori", label: "Carret Total BDT / Bori" },
    ],
  },
  
];

const createInitialFormData = (businessId = 0): GoldPriceIn => ({
  businessId,
  goldSpotRate: "",
  dollarRate: 3.674,
  ounceRateDirham: "",
  ounceGram: 31.1035,
  "999_rateGram": "",
  "995_rateGram": "",
  "920_rateGram": "",
  buyRate: "",
  sellRate: "",
  carretRate: "",
  buy_MC: "",
  sell_MC: "",
  carret_MC: "",
  buy_CC: "",
  sell_CC: "",
  carret_CC: "",
  buyAddProfit: "",
  sellAddProfit: "",
  carretAddProfit: "",
  buyPricePerGram: "",
  sellPricePerGram: "",
  carretPricePerGram: "",
  boriGram: 11.664,
  buyTotalDirham: "",
  sellTotalDirham: "",
  carretTotalDirham: "",
  buyBdtRate: "",
  sellBdtRate: "",
  carretBdtRate: "",
  buyTotalBdtBori: "",
  sellTotalBdtBori: "",
  carretTotalBdtBori: "",
});

const formatNumeric = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "--:--";
  return value;
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

const calculateOunceRateDirham = (
  goldSpotRate?: string | number | null,
  dollarRate?: string | number | null
) => {
  const spot = Number(goldSpotRate);
  const dollar = Number(dollarRate);

  if (!Number.isFinite(spot) || !Number.isFinite(dollar)) return "";

  return (spot * dollar).toFixed(6).replace(/\.?0+$/, "");
};

const calculateBdtPerGram = (
  totalBdtPerBori?: string | number | null,
  boriGram?: string | number | null
) => {
  const total = Number(totalBdtPerBori);
  const gramsPerBori = Number(boriGram) || 11.664;

  if (!Number.isFinite(total) || !Number.isFinite(gramsPerBori) || gramsPerBori === 0) {
    return "";
  }

  return (total / gramsPerBori).toFixed(3);
};

export default function GoldPriceInList() {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const businessId = Number(user?.business?.id ?? 0);

  const [formData, setFormData] = useState<GoldPriceIn>(createInitialFormData(businessId));
  const [selectedEntry, setSelectedEntry] = useState<GoldPriceIn | null>(null);
  const [filterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { isOpen, openModal, closeModal } = useModal();

  const goldPrices = useSelector(selectAllGoldPriceInByBusiness(businessId));
  const latestGoldPrice = useSelector(selectLatestGoldPriceIn);
  const status = useSelector(selectGoldPriceInStatus);

  useEffect(() => {
    dispatch(fetchAllGoldPriceIn());
    dispatch(fetchLatestGoldPriceIn());
  }, [dispatch]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      businessId,
    }));
  }, [businessId]);

  const filteredData = useMemo(() => {
    const search = filterText.toLowerCase().trim();
    if (!search) return goldPrices;

    return goldPrices.filter((entry) =>
      [
        entry.goldSpotRate,
        entry.dollarRate,
        entry.buyRate,
        entry.sellRate,
        entry.carretRate,
        entry.createdAt,
      ]
        .map((value) => String(value ?? "").toLowerCase())
        .some((value) => value.includes(search))
    );
  }, [goldPrices, filterText]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

const toNum = (val: any) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    const next = {
      ...prev,
      [name]: value,
    };

    // =========================
    // 1. MARKET BASE CALCULATION
    // =========================
    if (name === "goldSpotRate" || name === "dollarRate") {
      const ounce = calculateOunceRateDirham(
        next.goldSpotRate,
        next.dollarRate
      );

      next.ounceRateDirham = ounce;

      const ounceNum = toNum(ounce);

      const rate999 = ounceNum ? ounceNum / 31.1035 : 0;
      const rate995 = rate999 * 0.995;
      const rate920 = rate999 * 0.92;

      next["999_rateGram"] = rate999 ? rate999.toFixed(3) : "";
      next["995_rateGram"] = rate995 ? rate995.toFixed(3) : "";
      next["920_rateGram"] = rate920 ? rate920.toFixed(3) : "";

      // base rate sync
      next.buyRate = next["920_rateGram"];
      next.sellRate = next["920_rateGram"];
      next.carretRate = next["920_rateGram"];
    }

    // =========================
    // 2. RATE MATRIX CALCULATION
    // =========================
    if (next["920_rateGram"] || name === "buy_MC" ||
        name === "sell_MC" ||
        name === "carret_MC" ||
        name === "buy_CC" ||
        name === "sell_CC" ||
        name === "carret_CC" ||
        name === "buyAddProfit" ||
        name === "sellAddProfit" ||
        name === "carretAddProfit" ||
        name === "buyBdtRate" ||
        name === "sellBdtRate" ||
        name === "carretBdtRate"
    ) {
      const buyRate = toNum(next.buyRate);
      const sellRate = toNum(next.sellRate);
      const carretRate = toNum(next.carretRate);

      const buyMC = toNum(next.buy_MC);
      const sellMC = toNum(next.sell_MC);
      const carretMC = toNum(next.carret_MC);

      const buyCC = toNum(next.buy_CC);
      const sellCC = toNum(next.sell_CC);
      const carretCC = toNum(next.carret_CC);

      const buyProfit = toNum(next.buyAddProfit);
      const sellProfit = toNum(next.sellAddProfit);
      const carretProfit = toNum(next.carretAddProfit);

      // =========================
      // PRICE PER GRAM
      // =========================
      next.buyPricePerGram =
        buyRate || buyMC || buyCC || buyProfit
          ? (buyRate + buyMC + buyCC + buyProfit).toFixed(3)
          : "";

      next.sellPricePerGram =
        sellRate || sellMC || sellCC || sellProfit
          ? (sellRate + sellMC + sellCC + sellProfit).toFixed(3)
          : "";

      next.carretPricePerGram =
        carretRate || carretMC || carretCC || carretProfit
          ? (carretRate + carretMC + carretCC + carretProfit).toFixed(3)
          : "";

      // =========================
      // TOTAL DIRHAM (PER BORI)
      // =========================
      const bori = toNum(next.boriGram);

      next.buyTotalDirham =
        next.buyPricePerGram && bori
          ? (toNum(next.buyPricePerGram) * bori).toFixed(3)
          : "";

      next.sellTotalDirham =
        next.sellPricePerGram && bori
          ? (toNum(next.sellPricePerGram) * bori).toFixed(3)
          : "";

      next.carretTotalDirham =
        next.carretPricePerGram && bori
          ? (toNum(next.carretPricePerGram) * bori).toFixed(3)
          : "";

      // =========================
      // TOTAL BDT PER BORI
      // =========================
      const buyBdt = toNum(next.buyBdtRate);
      const sellBdt = toNum(next.sellBdtRate);
      const carretBdt = toNum(next.carretBdtRate);

      next.buyTotalBdtBori =
        next.buyTotalDirham && buyBdt
          ? (toNum(next.buyTotalDirham) * buyBdt).toFixed(3)
          : "";

      next.sellTotalBdtBori =
        next.sellTotalDirham && sellBdt
          ? (toNum(next.sellTotalDirham) * sellBdt).toFixed(3)
          : "";

      next.carretTotalBdtBori =
        next.carretTotalDirham && carretBdt
          ? (toNum(next.carretTotalDirham) * carretBdt).toFixed(3)
          : "";
    }

    if (next.buyTotalDirham || next.sellTotalDirham || next.carretTotalDirham || name === "buyBdtRate" ||
        name === "sellBdtRate" ||
        name === "carretBdtRate"
    ) {
      const buyBdt = toNum(next.buyBdtRate);
      const sellBdt = toNum(next.sellBdtRate);
      const carretBdt = toNum(next.carretBdtRate);

      next.buyTotalBdtBori = next.buyTotalDirham && buyBdt
        ? (toNum(next.buyTotalDirham) * buyBdt).toFixed(3)
        : "";

      next.sellTotalBdtBori = next.sellTotalDirham && sellBdt
        ? (toNum(next.sellTotalDirham) * sellBdt).toFixed(3)
        : "";

      next.carretTotalBdtBori = next.carretTotalDirham && carretBdt
        ? (toNum(next.carretTotalDirham) * carretBdt).toFixed(3)
        : "";
    }

    return next;
  });
};

  const resetForm = () => {
    setFormData(createInitialFormData(businessId));
    setSelectedEntry(null);
  };

  const handleEdit = (entry: GoldPriceIn) => {
    setSelectedEntry(entry);
    setFormData({
      ...createInitialFormData(businessId),
      ...entry,
      businessId,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (selectedEntry?.id) {
        await dispatch(updateGoldPriceIn({ ...formData, id: selectedEntry.id })).unwrap();
        toast.success("Gold price data updated successfully");
      } else {
        await dispatch(createGoldPriceIn(formData)).unwrap();
        toast.success("Gold price data created successfully");
      }

      resetForm();
      dispatch(fetchAllGoldPriceIn());
      dispatch(fetchLatestGoldPriceIn());
    } catch (error: any) {
      toast.error(error || "Failed to save gold price data");
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry?.id) return;

    try {
      await dispatch(destroyGoldPriceIn(selectedEntry.id)).unwrap();
      toast.success("Gold price data deleted successfully");
      dispatch(fetchAllGoldPriceIn());
      dispatch(fetchLatestGoldPriceIn());
      closeModal();
      resetForm();
    } catch (error: any) {
      toast.error(error || "Failed to delete gold price data");
    }
  };

  return (
    <>
      <PageMeta title="Gold Price In" description="Gold price create and list module" />
      <PageBreadcrumb pageTitle="Gold Price In" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full">
            {/* <SearchControl value={filterText} onChange={setFilterText} placeHolder="Search saved snapshots..." /> */}

            <div className="">
              <Table>
                <TableHeader className="border-b border-t border-gray-100 bg-gray-200 text-sm text-black dark:border-white/[0.05] dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell isHeader className="px-4 py-2 text-center">Sl</TableCell>
                    <TableCell isHeader className="px-4 py-2 text-center">Created</TableCell>
                    <TableCell isHeader className="px-4 py-2 text-center">Spot ($)</TableCell>
                    <TableCell isHeader className="px-4 py-2 text-center">Dollar (AED)</TableCell>
                    <TableCell isHeader className="px-4 py-2 text-center">Buy (BDT)</TableCell>
                    <TableCell isHeader className="px-4 py-2 text-center">Sell (BDT)</TableCell>
                    <TableCell isHeader className="px-4 py-2 text-center">Carret (BDT)</TableCell>
                    <TableCell isHeader className="px-4 py-2 text-center">Action</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {status === "loading" ? (
                    <TableRow>
                      <TableCell colSpan={16} className="py-4 text-center text-gray-500 dark:text-gray-300">
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={16} className="py-4 text-center text-gray-500 dark:text-gray-300">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((entry, index) => (
                      <TableRow key={entry.id} className="relative border-b border-gray-100 dark:border-white/[0.05]">
                        <TableCell className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                          {formatDateTime(entry.createdAt)}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                          {formatNumeric(
                            Number.isFinite(Number(entry.goldSpotRate))
                              ? Number(entry.goldSpotRate).toFixed(3)
                              : entry.goldSpotRate ?? ""
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                          {formatNumeric(
                            Number.isFinite(Number(entry.dollarRate))
                              ? Number(entry.dollarRate).toFixed(3)
                              : entry.dollarRate ?? ""
                          )}
                        </TableCell>
                        
                        
                        <TableCell className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                          {formatNumeric(
                            Number.isFinite(Number(entry.buyTotalBdtBori))
                              ? Number(entry.buyTotalBdtBori).toFixed(3)
                              : entry.buyTotalBdtBori ?? ""
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                          {formatNumeric(
                            Number.isFinite(Number(entry.sellTotalBdtBori))
                              ? Number(entry.sellTotalBdtBori).toFixed(3)
                              : entry.sellTotalBdtBori ?? ""
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                          {formatNumeric(
                            Number.isFinite(Number(entry.carretTotalBdtBori))
                              ? Number(entry.carretTotalBdtBori).toFixed(3)
                              : entry.carretTotalBdtBori ?? ""
                          )}
                        </TableCell>
                        <TableCell className="overflow-visible px-4 py-2 text-center text-sm">
                          <Menu as="div" className="relative inline-block text-left">
                            <MenuButton className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-1 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none">
                              Actions
                              <ChevronDownIcon className="h-4 w-4 text-white" />
                            </MenuButton>

                            <MenuItems className="absolute right-0 top-full z-9999 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-sky-500 ring-opacity-5 focus:outline-none">
                              <div className="py-1">
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleEdit(entry)}
                                      className={`${active ? "bg-gray-100 text-gray-900" : "text-gray-700"} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                      Edit
                                    </button>
                                  )}
                                </MenuItem>
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => {
                                        setSelectedEntry(entry);
                                        openModal();
                                      }}
                                      className={`${active ? "bg-red-100 text-red-700" : "text-red-600"} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                      Delete
                                    </button>
                                  )}
                                </MenuItem>
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
          </div>

          {/* <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          /> */}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {selectedEntry ? "Update Gold Price Snapshot" : "Create Gold Price Snapshot"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Store market rates, margin values, and total calculations in one place.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              Latest saved:
              {" "}
              <span className="font-semibold">
                Spot {formatNumeric(
                  Number.isFinite(Number(latestGoldPrice?.goldSpotRate))
                    ? Number(latestGoldPrice?.goldSpotRate).toFixed(3)
                    : latestGoldPrice?.goldSpotRate ?? ""
                )}
              </span>
              {" | "}
              <span className="font-semibold">
                Dollar {formatNumeric(
                  Number.isFinite(Number(latestGoldPrice?.dollarRate))
                    ? Number(latestGoldPrice?.dollarRate).toFixed(3)
                    : latestGoldPrice?.dollarRate ?? ""
                )}
              </span>
              {" | "}
              <span>{formatDateTime(latestGoldPrice?.createdAt)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {fieldGroups.map((group) => {
              // Special table layout for Rate Matrix
              if (group.title === "Rate Matrix") {
                return (
                  <div
                    key={group.title}
                    className=""
                  >
                    {/* Header */}
                    <div className="mb-4 border-b border-gray-200 pb-2 dark:border-white/[0.05]">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                        {group.title}
                      </h3>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 text-sm dark:border-white/[0.05]">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                          <tr>
                            <th className="px-3 py-2 text-left">Description</th>
                            <th className="px-3 py-2 text-left">BUY</th>
                            <th className="px-3 py-2 text-left">SELL</th>
                            <th className="px-3 py-2 text-left">CARRET</th>
                          </tr>
                        </thead>

                        <tbody>
                          {/* RATE */}
                          <tr className="border-t dark:border-white/[0.05]">
                            <td className="px-3 py-2 font-medium">Rate</td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">{formatNumeric(formData.buyRate)} AED</span>
                              </div>
                            </td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">{formatNumeric(formData.sellRate)} AED</span>
                              </div>
                            </td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">{formatNumeric(formData.carretRate)} AED</span>
                              </div>
                            </td>
                          </tr>

                          {/* AVERAGE MC */}
                          <tr className="border-t dark:border-white/[0.05]">
                            <td className="px-3 py-2 font-medium">Average MC</td>

                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                step={0.001}
                                name="buy_MC"
                                value={formData.buy_MC ?? ""}
                                onChange={handleChange}
                              />
                            </td>

                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                step={0.001}
                                name="sell_MC"
                                value={formData.sell_MC ?? ""}
                                onChange={handleChange}
                              />
                            </td>

                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                step={0.001}
                                name="carret_MC"
                                value={formData.carret_MC ?? ""}
                                onChange={handleChange}
                              />
                            </td>
                          </tr>

                          {/* AVERAGE CARRYING */}
                          <tr className="border-t dark:border-white/[0.05]">
                            <td className="px-3 py-2 font-medium">Average Carrying</td>

                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                step={0.000001}
                                name="buy_CC"
                                value={formData.buy_CC ?? ""}
                                onChange={handleChange}
                              />
                            </td>

                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                step={0.000001}
                                name="sell_CC"
                                value={formData.sell_CC ?? ""}
                                onChange={handleChange}
                              />
                            </td>

                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                step={0.000001}
                                name="carret_CC"
                                value={formData.carret_CC ?? ""}
                                onChange={handleChange}
                              />
                            </td>
                          </tr>

                          {/* ADD PROFIT */}
                          <tr className="border-t dark:border-white/[0.05]">
                            <td className="px-3 py-2 font-medium">Add Profit</td>

                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                step={0.000001}
                                name="buyAddProfit"
                                value={formData.buyAddProfit ?? ""}
                                onChange={handleChange}
                              />
                            </td>

                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                step={0.000001}
                                name="sellAddProfit"
                                value={formData.sellAddProfit ?? ""}
                                onChange={handleChange}
                              />
                            </td>

                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                step={0.000001}
                                name="carretAddProfit"
                                value={formData.carretAddProfit ?? ""}
                                onChange={handleChange}
                              />
                            </td>
                          </tr>

                          {/* PRICE PER GRAM */}
                          <tr className="border-t dark:border-white/[0.05]">
                            <td className="px-3 py-2 font-medium">Price Per Gram</td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">{formatNumeric(formData.buyPricePerGram)} AED</span>
                              </div>
                            </td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">{formatNumeric(formData.sellPricePerGram)} AED</span>
                              </div>
                            </td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">{formatNumeric(formData.carretPricePerGram)} AED</span>
                              </div>
                            </td>
                          </tr>

                          {/* BORI */}
                          <tr className="border-t dark:border-white/[0.05]">
                            <td className="px-3 py-2 font-medium">1 Bori (Gram)</td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">{formatNumeric(formData.boriGram)} g</span>
                              </div>
                            </td>

                            
                          </tr>

                          {/* TOTAL DH */}
                          <tr className="border-t dark:border-white/[0.05]">
                            <td className="px-3 py-2 font-medium">Total DH</td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">{formatNumeric(formData.buyTotalDirham)} AED</span>
                              </div>
                            </td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">{formatNumeric(formData.sellTotalDirham)} AED</span>
                              </div>
                            </td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">{formatNumeric(formData.carretTotalDirham)} AED</span>
                              </div>
                            </td>
                          </tr>

                          {/* BDT RATE */}
                          <tr className="border-t dark:border-white/[0.05]">
                            <td className="px-3 py-2 font-medium">BDT Rate</td>

                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                step={0.000001}
                                name="buyBdtRate"
                                value={formData.buyBdtRate ?? ""}
                                onChange={handleChange}
                              />
                            </td>

                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                step={0.000001}
                                name="sellBdtRate"
                                value={formData.sellBdtRate ?? ""}
                                onChange={handleChange}
                              />
                            </td>

                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                step={0.000001}
                                name="carretBdtRate"
                                value={formData.carretBdtRate ?? ""}
                                onChange={handleChange}
                              />
                            </td>
                          </tr>

                          {/* TOTAL BDT PER BORI */}
                          <tr className="border-t dark:border-white/[0.05]">
                            <td className="px-3 py-2 font-medium">Total BDT Per Bori</td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">{formatNumeric(formData.buyTotalBdtBori)} BDT</span>
                              </div>
                            </td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">{formatNumeric(formData.sellTotalBdtBori)} BDT</span>
                              </div>
                            </td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">{formatNumeric(formData.carretTotalBdtBori)} BDT</span>
                              </div>
                            </td>
                          </tr>

                          {/* BDT PER GRAM */}
                          <tr className="border-t dark:border-white/[0.05]">
                            <td className="px-3 py-2 font-medium">BDT Per Gram</td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">
                                  {formatNumeric(calculateBdtPerGram(formData.buyTotalBdtBori, formData.boriGram))} BDT
                                </span>
                              </div>
                            </td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">
                                  {formatNumeric(calculateBdtPerGram(formData.sellTotalBdtBori, formData.boriGram))} BDT
                                </span>
                              </div>
                            </td>

                            <td className="px-3 py-2">
                              <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                                <span className="mr-2 font-bold text-gray-500">=</span>
                                <span className="font-bold">
                                  {formatNumeric(calculateBdtPerGram(formData.carretTotalBdtBori, formData.boriGram))} BDT
                                </span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }

              // Default layout for other groups
              return (
                <div
                  key={group.title}
                  className=""
                >
                  <div className="mb-4 border-b border-gray-200 pb-2 dark:border-white/[0.05]">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      {group.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {group.fields.map((field) => (
                      <div key={String(field.name)}>
                        <Label>{field.label}</Label>

                        {field.name === "ounceRateDirham" ? (
                          <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                            <span className="mr-2 font-bold text-gray-500">=</span>
                            <span className="font-bold">{formatNumeric(formData.ounceRateDirham)} AED</span>
                          </div>
                        ) : 
                        field.name === "ounceGram" ? (
                          <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                            <span className="mr-2 font-bold text-gray-500">=</span>
                            <span className="font-bold">{formatNumeric(formData.ounceGram)} g</span>
                          </div>
                        ) :
                        field.name === "999_rateGram" ? (
                          <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                            <span className="mr-2 font-bold text-gray-500">=</span>
                            <span className="font-bold">{formatNumeric(formData["999_rateGram"])} AED</span>
                          </div>
                        ) : 
                        field.name === "995_rateGram" ? (
                          <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                            <span className="mr-2 font-bold text-gray-500">=</span>
                            <span className="font-bold">{formatNumeric(formData["995_rateGram"])} AED</span>
                          </div>
                        ) : 
                        field.name === "920_rateGram" ? (
                          <div className="flex h-11 items-center rounded-lg px-4 text-sm text-bold dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                            <span className="mr-2 font-bold text-gray-500">=</span>
                            <span className="font-bold">{formatNumeric(formData["920_rateGram"])} AED</span>
                          </div>
                        ) : (
                          <Input
                            type="number"
                            step={0.000001}
                            name={String(field.name)}
                            value={
                              (formData[field.name] as string | number | undefined) ?? ""
                            }
                            onChange={handleChange}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700"
              >
                {selectedEntry ? "Update Snapshot" : "Save Snapshot"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        
      </div>

      <ConfirmationModal
        isOpen={isOpen}
        title="Are you sure you want to delete this gold price snapshot?"
        width="400px"
        onCancel={closeModal}
        onConfirm={handleDelete}
      />
    </>
  );
}
