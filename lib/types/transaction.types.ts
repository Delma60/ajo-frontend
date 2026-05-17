import { IGroup } from "./group.types";
import { IUser } from "./user.types";

export type TxStatus = 'pending'|'processing'|'success'|'failed'|'cancelled';
export type TxType = 'charge'|'payout'|'refund'|'topup'|'transfer';
export type Direction = 'debit'|'credit';

export interface ITransaction {
  readonly id: number|string;
  uuid: string;
  reference?: string;
  idempotency_key?: string;
  user_id?: number | null;
  user:IUser;
  group:IGroup;
  group_id?: number | null;
  pending_account_balance_id?: number | null;
  
  amount: string;       // decimal as string, eg "12000.00"
  fee: string;
  net_amount: string;
  label:string;
  short_label:string;
  currency: string;
  type: TxType;
  direction: Direction;
  provider?: string | null;
  method?: string | null;
  provider_reference?: string | null;
  status: TxStatus;
  attempts: number;
  meta?: Record<string, any>;
  scheduled_at?: string | null; // ISO
  processed_at?: string | null; // ISO
  expires_at?: string | null;   // ISO
  created_at: string;
  updated_at: string;
}
