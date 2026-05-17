import { IUser } from "./user.types";

export interface IBank {
  readonly id: string;
  account_name:string;
  account_number:string;
  bank_name:string;
  user?:IUser;
  user_id?:string|number
}

export interface IVirtualBank extends IBank {
  readonly id: string;
  reference:string;
  status: 'active'| 'inactive'|'deleted';
  meta:Record<string, unknown>
  created_at: string;
  provider: string;
}

export interface ICard {
    readonly id:string|number;
    brand:string;
    bank_name?:string;
    country:string;
    currency:string;
    last4:string;
    isDefault:boolean;
    exp_month:string;
    exp_year:string;
    cvv:string;
    card_number:string;
    card_name:string;
    status:'active'|'inactive'|'deleted';
    meta:Record<string, unknown>
    is_default:boolean

    user_id:string;
}