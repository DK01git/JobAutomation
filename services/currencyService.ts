/**
 * Simple Currency Conversion Utility
 * Using approximate market rates for LKR (Sri Lankan Rupee)
 */

const EXCHANGE_RATES: Record<string, number> = {
  "USD": 305.50,
  "EUR": 331.20,
  "GBP": 387.40,
  "SGD": 226.80,
  "AUD": 202.10,
  "CAD": 224.50,
  "INR": 3.65,
  "AED": 83.15,
  "QAR": 83.90,
  "SAR": 81.45,
  "JPY": 1.95,
  "LKR": 1.00
};

export const convertToLKR = (amount: number, fromCurrency: string = "USD"): number => {
  const currency = fromCurrency.toUpperCase().trim();
  const rate = EXCHANGE_RATES[currency] || EXCHANGE_RATES["USD"]; // Fallback to USD if unknown
  return Math.round(amount * rate);
};

export const getCurrencyList = () => Object.keys(EXCHANGE_RATES);

export const formatCurrency = (amount: number, currency: string = "LKR") => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
};
