import { IGroup } from "./group.types";
import { IUser } from "./user.types";

export interface IInvite {
  created_at:string|Date;
  updated_at:string|Date;
  group_id:number;
  group:IGroup;
  message?:string;
  id:number;
  recipient_id:number;
  recipient:IUser;
  sender_id:number;
  sender:IUser;
  role:"member"|"admin";
  status: 'pending'|'accepted'|'rejected'|'cancelled';
  token: string|null;
  type: 'request'|'invite'
}
