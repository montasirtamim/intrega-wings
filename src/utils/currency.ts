import type { CurrencyCode } from '../types';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromUsd: number;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromUsd: 1, decimals: 0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateFromUsd: 0.92, decimals: 0 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateFromUsd: 0.79, decimals: 0 },
  AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', rateFromUsd: 3.67, decimals: 0 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateFromUsd: 152.5, decimals: 0 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateFromUsd: 1.34, decimals: 0 },
  CHF: { code: 'CHF', symbol: 'CHF ', name: 'Swiss Franc', rateFromUsd: 0.88, decimals: 0 },
};

export function formatPrice(amountUsd: number, currency: CurrencyCode): string {
  const cfg = CURRENCIES[currency];
  const converted = amountUsd * cfg.rateFromUsd;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: cfg.decimals,
    maximumFractionDigits: cfg.decimals,
  }).format(Math.round(converted));
  return `${cfg.symbol}${formatted}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}
