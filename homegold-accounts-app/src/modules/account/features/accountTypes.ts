export interface Account {
  id?: number;
  businessId?: number;
  accountName: string;
  accountNo: string;
  address: string;
  currency: string;
  openingBalance: number;
  stockInSum?: number;
  stockOutSum?: number;
  paymentInSum?: number;
  paymentOutSum?: number;
  isActive: boolean;
}

export interface AccountState {
  data: Account[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
