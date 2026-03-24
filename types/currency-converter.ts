/**
 * Currency Converter API Types
 * TypeScript interfaces for type-safe currency conversion
 */

/**
 * Currency conversion request payload
 */
export interface CurrencyConversionRequest {
  /** Source currency code (ISO 4217, e.g., "USD") */
  from: string;

  /** Target currency code (ISO 4217, e.g., "EUR") */
  to: string;

  /** Amount to convert */
  amount: number;
}

/**
 * Successful currency conversion response
 */
export interface CurrencyConversionResponse {
  /** Whether the conversion was successful */
  success: true;

  /** Source currency code */
  from: string;

  /** Target currency code */
  to: string;

  /** Original amount */
  amount: number;

  /** Current exchange rate (from -> to) */
  rate: number;

  /** Calculated converted amount */
  convertedAmount: number;

  /** ISO timestamp of conversion */
  timestamp: string;

  /** Which API provider was used */
  provider: 'exchangerate-api' | 'open-er-api-fallback' | 'cached' | 'same-currency' | 'calculation';
}

/**
 * Error currency conversion response
 */
export interface CurrencyConversionErrorResponse {
  /** Whether the conversion was successful */
  success: false;

  /** Error message describing what went wrong */
  error: string;
}

/**
 * Currency information
 */
export interface Currency {
  /** ISO 4217 currency code */
  code: string;

  /** Human-readable currency name */
  name: string;

  /** Optional currency symbol */
  symbol?: string;
}

/**
 * Supported currencies list
 */
export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

/**
 * Currency converter client utility functions
 */
export class CurrencyConverterClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/currency-converter') {
    this.baseUrl = baseUrl;
  }

  /**
   * Convert amount from one currency to another
   * @throws Error if conversion fails
   */
  async convert(
    from: string,
    to: string,
    amount: number
  ): Promise<CurrencyConversionResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Currency conversion failed');
    }

    return data as CurrencyConversionResponse;
  }

  /**
   * Check if a currency code is supported
   */
  isSupportedCurrency(code: string): boolean {
    return SUPPORTED_CURRENCIES.some((c) => c.code === code.toUpperCase());
  }

  /**
   * Get currency information
   */
  getCurrencyInfo(code: string): Currency | undefined {
    return SUPPORTED_CURRENCIES.find((c) => c.code === code.toUpperCase());
  }

  /**
   * Get all supported currencies
   */
  getAllCurrencies(): Currency[] {
    return SUPPORTED_CURRENCIES;
  }

  /**
   * Format currency value for display
   */
  formatCurrency(amount: number, currencyCode: string): string {
    const currency = this.getCurrencyInfo(currencyCode);
    const symbol = currency?.symbol || currencyCode;

    return `${symbol} ${amount.toFixed(2)}`;
  }
}

/**
 * Predefined configurations for common currency pairs
 */
export const COMMON_CONVERSIONS = [
  { from: 'USD', to: 'EUR', name: 'US Dollar to Euro' },
  { from: 'EUR', to: 'GBP', name: 'Euro to British Pound' },
  { from: 'GBP', to: 'JPY', name: 'British Pound to Japanese Yen' },
  { from: 'USD', to: 'JPY', name: 'US Dollar to Japanese Yen' },
  { from: 'USD', to: 'AUD', name: 'US Dollar to Australian Dollar' },
  { from: 'USD', to: 'CAD', name: 'US Dollar to Canadian Dollar' },
  { from: 'EUR', to: 'CHF', name: 'Euro to Swiss Franc' },
  { from: 'USD', to: 'CNY', name: 'US Dollar to Chinese Yuan' },
  { from: 'USD', to: 'INR', name: 'US Dollar to Indian Rupee' },
  { from: 'USD', to: 'BRL', name: 'US Dollar to Brazilian Real' },
];
