import { IInvite } from "./invite.types";
import { ITransaction } from "./transaction.types";
import { IUser } from "./user.types";

export type Frequency = "daily" | "weekly" | "bi-weekly" | "monthly";
export type PayoutOrder = "rotational" | "random" | "bidding";
export type GroupStatus = "active" | "paused" | "closed";
export type MemberStatus = "active" | "defaulted" | "pending";

export interface IGroup {
  readonly id: string;
  name:string;
  description:string;
  nextDue:string;
  goal:number;
  saved:number;
  admin?:IMember;
  contribution:string|number;
  members:IMember[],
  membersCount:number,
  frequency:Frequency
  max_members:number
  start_date:Date|string;
  payout_order:PayoutOrder,
  imageUrl:string;
  owner_id:string|number;
  status: GroupStatus;
  created_at:string|Date;
  nextPayout:string|Date;
  joined?:boolean;
  group_transaction: { who:string, date:string; amount:number }[];
  transactions: ITransaction[];
  isPrivate:boolean;
  cycles:IGroupCycle[];
  help?:boolean;
  creation_fee:string|number;
  pendingInvites :IInvite[]
  pendingRequests :IInvite[]
}


export interface IGroupCycle {
    readonly id:string|number;
    cycle_number:string;
    amount:string;
    recipient:string;
    recipient_user:IUser;
    created_at:string|Date
}
export interface IMember extends Omit<IUser, "status"> {
    role:"admin"| 'member' | 'pending';
    joined_at_human:string;
    hasPaid:boolean;
    last_payment_at:Date
    myTurn:string
    status: MemberStatus;
}
