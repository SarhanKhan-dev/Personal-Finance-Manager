// Common types for both frontend and backend

export type AccountType = 'cash' | 'bank' | 'jazzcash' | 'easypaisa' | 'sadapay' | 'other';

export interface FinanceAccount {
  id: number;
  name: string;
  type: AccountType;
  color: string;
  balance: number;
  created_at: string;
}

export interface Person {
  id: number;
  name: string;
  phone?: string;
  notes?: string;
  created_at: string;
}

export type TransactionType = 'inflow' | 'outflow' | 'transfer';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  date: string;
  account_id?: number | null;
  to_account_id?: number | null;
  category?: string | null;
  source_label?: string | null;
  person_id?: number | null;
  notes?: string | null;
  created_at: string;
  // Joins
  account_name?: string;
  account_color?: string;
  to_account_name?: string;
  to_account_color?: string;
  person_name?: string;
}

export type LoanDirection = 'given' | 'taken';
export type LoanStatus = 'open' | 'partial' | 'settled';

export interface Loan {
  id: number;
  direction: LoanDirection;
  person_id: number;
  account_id: number;
  amount: number;
  remaining: number;
  reason?: string | null;
  due_date?: string | null;
  status: LoanStatus;
  created_at: string;
  // Joins
  person_name?: string;
  account_name?: string;
  account_color?: string;
}

export interface LoanPayment {
  id: number;
  loan_id: number;
  amount: number;
  date: string;
  notes?: string | null;
  created_at: string;
}

export interface ReportSummary {
  inflow: number;
  outflow: number;
  byCategory: { category: string; total: number }[];
  byAccount: { name: string; color: string; type: string; total_inflow: number; total_outflow: number }[];
  daily: { date: string; inflow: number; outflow: number }[];
}
