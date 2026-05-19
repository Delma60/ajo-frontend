import { IBank, ICard, IVirtualBank } from "./bank.types";
import { IGroup } from "./group.types";
import { Investment } from "./investment.types";
import { IInvite } from "./invite.types";
import { INotification } from "./notification.types";
import { ITransaction } from "./transaction.types";

export interface IUser {
  readonly id: string;
  imageUrl: string;
  name: string;
  email: string;
  phone: string;
  banks?: IBank[];
  virtual_bank?: IVirtualBank;
  cards?: ICard[];
  groups?: IGroup[];
  balance: IBalance
  referral_count: number;
  referral_code: string;
  status: "active" | 'pending' | "suspended" | "banned";
  settings: Record<string, unknown>;
  transactions:ITransaction[];
  inviteSent:IInvite[];
  inviteReceived:IInvite[];
  next_due?:{
    amount_due:number;
    due_by:string;
    group_id:number;  
    group_name:string;
    period_start:string;
    period_end:string;
    group_saved:number;
    group_goal:number;

  }
  kyc_level: string;
  isVerified: boolean;
  created_at: Date | string;
  created_at_human: string;
  notifications:INotification[]
  updated_at: Date | string;
  referral?:{
    code:string;
    invited_count:number;
    referred_users: IUser[]
  },
  investments?:Investment[]
}

export interface IBalance {
    available_wallet: string;
    pending_wallet: string;
    available_referral: string;
    pending_referral: string;
    total_saved: number;
}

