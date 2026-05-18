// Optional: import User interface if it exists in another file
// import { User } from './User';

import { IUser } from "./user.types";

export interface Investment {
    id: number;
    title: string; // or 'name' depending on your migration
    description?: string | null;
    
    // Financials
    amount: number; // Could be target_amount or total_pool
    minimum_investment?: number;
    roi_percentage?: number; 
    
    // Lifecycle
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    start_date: string | null;
    end_date: string | null;
    
    // Relationships (Loaded via InvestmentResource)
    users?: IUser[]; 
    
    // If you are passing pivot data from the investment_user table
    pivot?: InvestmentUserPivot;

    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface InvestmentUserPivot {
    investment_id: number;
    user_id: number;
    amount_invested: number;
    expected_returns?: number;
    status?: string;
    created_at: string;
    updated_at: string;
}

