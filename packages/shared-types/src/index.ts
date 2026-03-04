// Common types for both frontend and backend
export interface FinanceAccount {
  id: number;
  name: string;
  type: "cash" | "bank" | "jazzcash" | "easypaisa" | "sadapay" | "other";
  color: string;
  balance: number;
}

