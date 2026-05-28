export interface FeeConfig {
  contribution_fee_pct: number;
  withdrawal_fee_pct: number;
  withdrawal_fee_flat: number;
  withdrawal_fee_cap: number;
  creation_fee_pct: number;
  topup_fee_pct: number;
  referral_reward: number;
}


export interface PayoutConfig {
  processing_window_hours: number;
  payout_day: "same_day" | "next_day" | "scheduled";
  cycle_grace_period_hours: number;
  auto_trigger: boolean;
  max_payout_per_cycle: number;
  min_pool_before_payout: number;
}

export interface LimitConfig {
  min_contribution: number;
  max_contribution: number;
  min_withdrawal: number;
  max_withdrawal_daily: number;
  max_group_size: number;
  min_group_size: number;
  max_cycles_per_group: number;
}

export interface PenaltyConfig {
  late_payment_fee_pct: number;
  grace_period_hours: number;
  max_defaults_before_removal: number;
  penalty_applies_after_hours: number;
  auto_remove_on_default: boolean;
  freeze_on_default: boolean;
}

export interface MethodConfig {
  card: boolean;
  bank_transfer: boolean;
  ussd: boolean;
  wallet: boolean;
  mobile_money: boolean;
}

export interface ProviderConfig {
  default_provider: "flutterwave" | "paystack" | "monnify";
  fallback_provider: "flutterwave" | "paystack" | "monnify" | "none";
  auto_failover: boolean;
  failover_threshold_pct: number;
}


export interface ISettings {
    fees: FeeConfig;
    payout: PayoutConfig;
    limits: LimitConfig;
    penalties: PenaltyConfig;
    payment_methods: MethodConfig;
    provider: ProviderConfig;
}