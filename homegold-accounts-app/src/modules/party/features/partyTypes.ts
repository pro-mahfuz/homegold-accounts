


export interface stockSummary {
  currency: string;
  stockInSum: number;
  stockOutSum: number;
}

export interface paymentSummary {
  currency: string;
  paymentInSum: number;
  paymentOutSum: number;
}

export interface advanceSummary {
  currency: string;
  advanceInSum: number;
  advanceOutSum: number;
}

export interface summaryByCurrency {
  currency: string;
  stockDebitSum: number;
  stockCreditSum: number;
  paymentDebitSum: number;
  paymentCreditSum: number;
  advanceInSum: number;
  advanceOutSum: number;
  stockNet?: number;
  paymentNet?: number;
  advanceNet?: number;
  netBalance: number;
  receivable?: number;
  payable?: number;
}


export interface Party {
  id?: number;
  businessId?: number;
  type?: "customer" | "supplier" | "party"; // for reuse
  name: string;
  company?: string;             // optional for customers
  email?: string;
  countryCode?: string;
  phoneCode?: string;
  phoneNumber?: string;
  trnNo?: string;
  address: string;
  city?: string;
  country?: string;  
  nationalId?: string;           // national ID
  tradeLicense?: string;        // for suppliers
  openingBalance?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  stockSummary?: stockSummary[];
  advanceSummary?: advanceSummary[];
  paymentSummary?: paymentSummary[];
  summaryByCurrency?: summaryByCurrency[];
}

// Receivable/Payable breakdown by currency
export interface BalanceByCurrency {
  currency: string;
  amount: number;
}

export interface ReceivablePayableTotal extends summaryByCurrency {}

export interface ReceivablePayableSummary {
  partyCount: number;
  partiesWithBalance: number;
  receivablePartyCount: number;
  payablePartyCount: number;
  currencies: number;
  totalReceivableByCurrency: BalanceByCurrency[];
  totalPayableByCurrency: BalanceByCurrency[];
}

// Each Party entry
export interface PartyReport {
  id?: number;
  name: string;
  receivableByCurrency: BalanceByCurrency[];
  payableByCurrency: BalanceByCurrency[];
  summaryByCurrency: summaryByCurrency[];
}

// Final API response
export interface ReceivablePayableReport {
  parties: PartyReport[];
  totals: ReceivablePayableTotal[];
  summary: ReceivablePayableSummary;
  message?: string;
}

export interface Customer extends Party {
  type: 'customer';
  // customer-specific fields here
}

export interface Supplier extends Party {
  type: 'supplier';
  tradeLicense: string;
}

export interface PartyState {
  parties: Party[];
  partiesPaginated: Party[];
  suppliers: Supplier[];
  customers: Customer[];
  receivablePayableReport: ReceivablePayableReport;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  totalItems: number,
  totalPages: number,
  currentPage: number,
}
