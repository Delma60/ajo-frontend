// Optional: import User interface if it exists in another file
// import { User } from './User';

import { IUser } from "./user.types";

export interface Investment {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  min_investment: number;
  raised: number;
  target: number;
  remaining: number;
  is_funding_complete: boolean;
  progress_percent: number;
  /** Format: YYYY-MM-DD HH:mm:ss */
  start_date: string;
  /** Format: YYYY-MM-DD HH:mm:ss */
  end_date: string;
  days_remaining: number;
  days_active: number;
  is_expired: boolean;
  apy: number;
  apy_display: string;
  /** Duration in months */
  duration: number;
  risk: 'low' | 'medium' | 'high';
  risk_label: string;
  risk_color: 'green' | 'yellow' | 'red' | string;
  status: 'active' | 'completed' | 'paused' | string;
  status_label: string;
  status_color: 'green' | 'yellow' | 'red' | string;
  investors_count: number;
}


export interface InvestmentUserPivot {
    investment_id: number;
    user_id: number;
    users?: IUser[]; 
    amount_invested: number;
    expected_returns?: number;
    status?: string;
    created_at: string;
    updated_at: string;
}

