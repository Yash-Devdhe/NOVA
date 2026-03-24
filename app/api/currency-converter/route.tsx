import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type CurrencyConversionPayload = {
  success: boolean;
  from: string;
  to: string;
  amount: number;
  rate: number;
  convertedAmount: number;
  timestamp: string;
  provider: string;
  message?: string;
};

// Cached exchange rates to reduce API calls
const exchangeRateCache: {
  [key: string]: {
    rate: number;
    timestamp: number;
  };
} = {};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Free currency conversion APIs
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest';
const FALLBACK_API = 'https://open.er-api.com/v1/latest';

async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<{ rate: number; provider: string }> {
  const cacheKey = `${fromCurrency}_${toCurrency}`;

  // Check cache
  if (exchangeRateCache[cacheKey]) {
    const cached = exchangeRateCache[cacheKey];
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return { rate: cached.rate, provider: 'cached' };
    }
  }

  try {
    // Try primary API
    try {
      const response = await fetch(`${EXCHANGE_RATE_API}/${fromCurrency.toUpperCase()}`);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      if (!data.rates || !data.rates[toCurrency.toUpperCase()]) {
        throw new Error(`Currency ${toCurrency} not found`);
      }

      const rate = data.rates[toCurrency.toUpperCase()];

      // Cache the rate
      exchangeRateCache[cacheKey] = {
        rate,
        timestamp: Date.now(),
      };

      return { rate, provider: 'exchangerate-api' };
    } catch (primaryError) {
      console.warn('Primary API failed, trying fallback:', primaryError);

      // Try fallback API
      const fallbackResponse = await fetch(`${FALLBACK_API}/${fromCurrency.toUpperCase()}`);

      if (!fallbackResponse.ok) {
        throw new Error(`Fallback API returned ${fallbackResponse.status}`);
      }

      const fallbackData = await fallbackResponse.json();

      if (!fallbackData.rates || !fallbackData.rates[toCurrency.toUpperCase()]) {
        throw new Error(`Currency ${toCurrency} not found in fallback`);
      }

      const rate = fallbackData.rates[toCurrency.toUpperCase()];

      // Cache the rate
      exchangeRateCache[cacheKey] = {
        rate,
        timestamp: Date.now(),
      };

      return { rate, provider: 'open-er-api-fallback' };
    }
  } catch (error) {
    throw new Error(
      `Failed to fetch exchange rate: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

function validateCurrency(currency: string): boolean {
  // ISO 4217 currency codes are 3 uppercase letters
  return /^[A-Z]{3}$/.test(currency);
}

// Main POST handler
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from, to, amount } = body;

    // Validate inputs
    if (!from || !to || amount === undefined || amount === null) {
      return NextResponse.json(
        {
          error: 'Missing required fields: from, to, amount',
          success: false,
        },
        { status: 400 }
      );
    }

    // Validate currencies
    if (!validateCurrency(from.toString().toUpperCase())) {
      return NextResponse.json(
        {
          error: `Invalid source currency code: ${from}. Must be a valid ISO 4217 code (e.g., USD, EUR).`,
          success: false,
        },
        { status: 400 }
      );
    }

    if (!validateCurrency(to.toString().toUpperCase())) {
      return NextResponse.json(
        {
          error: `Invalid target currency code: ${to}. Must be a valid ISO 4217 code (e.g., USD, EUR).`,
          success: false,
        },
        { status: 400 }
      );
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      return NextResponse.json(
        {
          error: 'Amount must be a positive number',
          success: false,
        },
        { status: 400 }
      );
    }

    if (numAmount === 0) {
      return NextResponse.json(
        {
          success: true,
          from: from.toUpperCase(),
          to: to.toUpperCase(),
          amount: 0,
          rate: 0,
          convertedAmount: 0,
          timestamp: new Date().toISOString(),
          provider: 'calculation',
        } as CurrencyConversionPayload
      );
    }

    const fromCurrency = from.toString().toUpperCase();
    const toCurrency = to.toString().toUpperCase();

    // Check if converting to the same currency
    if (fromCurrency === toCurrency) {
      return NextResponse.json(
        {
          success: true,
          from: fromCurrency,
          to: toCurrency,
          amount: numAmount,
          rate: 1,
          convertedAmount: numAmount,
          timestamp: new Date().toISOString(),
          provider: 'same-currency',
        } as CurrencyConversionPayload
      );
    }

    // Get exchange rate
    const { rate, provider } = await getExchangeRate(fromCurrency, toCurrency);

    // Calculate converted amount
    const convertedAmount = parseFloat((numAmount * rate).toFixed(2));

    return NextResponse.json(
      {
        success: true,
        from: fromCurrency,
        to: toCurrency,
        amount: numAmount,
        rate: rate,
        convertedAmount: convertedAmount,
        timestamp: new Date().toISOString(),
        provider: provider,
      } as CurrencyConversionPayload
    );
  } catch (error) {
    console.error('Currency Converter API error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while converting currency',
        success: false,
      },
      { status: 500 }
    );
  }
}

// GET handler for testing
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const amount = searchParams.get('amount');

  if (!from || !to || !amount) {
    return NextResponse.json(
      {
        error: 'Missing query parameters: from, to, amount',
        success: false,
        example: '/api/currency-converter?from=USD&to=EUR&amount=100',
      },
      { status: 400 }
    );
  }

  // Use POST handler logic
  const postReq = new Request(req.url, {
    method: 'POST',
    body: JSON.stringify({ from, to, amount }),
    headers: { 'Content-Type': 'application/json' },
  });

  return POST(postReq);
}
