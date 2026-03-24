/**
 * Currency Converter API - Usage Examples
 * This file demonstrates all the ways to use the Currency Converter API
 */

import { CurrencyConverterClient, SUPPORTED_CURRENCIES, COMMON_CONVERSIONS } from '@/types/currency-converter';

/**
 * ============================================================================
 * BASIC USAGE EXAMPLES
 * ============================================================================
 */

// Example 1: Simple currency conversion
async function example1_basicConversion() {
  const response = await fetch('/api/currency-converter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'USD', to: 'EUR', amount: 100 })
  });

  const data = await response.json();
  console.log(`100 USD = ${data.convertedAmount} EUR`);
  // Output: 100 USD = 92.34 EUR
}

// Example 2: Using the TypeScript client
async function example2_usingClient() {
  const client = new CurrencyConverterClient();
  
  try {
    const result = await client.convert('GBP', 'JPY', 50);
    console.log(`50 GBP = ${result.convertedAmount} JPY at rate ${result.rate}`);
  } catch (error) {
    console.error('Conversion failed:', error);
  }
}

// Example 3: Using async/await with error handling
async function example3_errorHandling() {
  try {
    const response = await fetch('/api/currency-converter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'USD',
        to: 'EUR',
        amount: 100
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    console.log('Conversion successful:', data);
  } catch (error) {
    console.error('Error during conversion:', error instanceof Error ? error.message : error);
  }
}

/**
 * ============================================================================
 * ADVANCED USAGE EXAMPLES
 * ============================================================================
 */

// Example 4: Batch conversions
async function example4_batchConversions() {
  const client = new CurrencyConverterClient();
  const amount = 100;
  const fromCurrency = 'USD';
  const toCurrencies = ['EUR', 'GBP', 'JPY', 'AUD'];

  const results = await Promise.all(
    toCurrencies.map(to =>
      client.convert(fromCurrency, to, amount)
    )
  );

  results.forEach(result => {
    console.log(
      `${result.amount} ${result.from} = ${result.convertedAmount} ${result.to}`
    );
  });
}

// Example 5: Create a currency conversion table
async function example5_conversionTable() {
  const client = new CurrencyConverterClient();
  const baseCurrency = 'USD';
  const amount = 1;

  console.table(
    SUPPORTED_CURRENCIES.map(async (currency) => {
      if (currency.code === baseCurrency) {
        return { code: currency.code, name: currency.name, rate: 1 };
      }

      const result = await client.convert(baseCurrency, currency.code, amount);
      return {
        code: currency.code,
        name: currency.name,
        rate: result.rate
      };
    })
  );
}

// Example 6: Convert with formatted output
async function example6_formattedOutput() {
  const client = new CurrencyConverterClient();
  
  const result = await client.convert('USD', 'EUR', 1000);
  
  const fromFormatted = client.formatCurrency(result.amount, result.from);
  const toFormatted = client.formatCurrency(result.convertedAmount, result.to);
  
  console.log(`${fromFormatted} = ${toFormatted}`);
  // Output: $ 1000.00 = € 926.40
}

// Example 7: Currency information lookup
async function example7_currencyInfo() {
  const client = new CurrencyConverterClient();
  
  const usdInfo = client.getCurrencyInfo('USD');
  const eurInfo = client.getCurrencyInfo('EUR');
  
  console.log(`${usdInfo?.name} (${usdInfo?.symbol})`);
  console.log(`${eurInfo?.name} (${eurInfo?.symbol})`);
  
  // Check if currency is supported
  if (client.isSupportedCurrency('GBP')) {
    console.log('GBP is supported');
  }
}

// Example 8: Add to React component
function Example8_ReactComponent() {
  return (
    <div>
      <h1>Currency Converter</h1>
      <CurrencyConverterForm
        onConvert={async (from, to, amount) => {
          const client = new CurrencyConverterClient();
          try {
            const result = await client.convert(from, to, amount);
            console.log('Conversion result:', result);
          } catch (error) {
            console.error('Conversion error:', error);
          }
        }}
      />
    </div>
  );
}

// Example 9: Polling for exchange rate updates
async function example9_pollingRates() {
  const client = new CurrencyConverterClient();
  let lastRate = 0;

  const pollInterval = setInterval(async () => {
    try {
      const result = await client.convert('USD', 'EUR', 1);
      
      if (result.rate !== lastRate) {
        console.log(`Rate changed: ${lastRate} → ${result.rate}`);
        lastRate = result.rate;
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 60000); // Poll every minute

  // Stop polling after 1 hour
  setTimeout(() => clearInterval(pollInterval), 3600000);
}

// Example 10: Cache validation
async function example10_cacheValidation() {
  const client = new CurrencyConverterClient();
  
  console.time('First call (cache miss)');
  const result1 = await client.convert('USD', 'EUR', 100);
  console.timeEnd('First call (cache miss)');
  
  console.time('Second call (cache hit)');
  const result2 = await client.convert('USD', 'EUR', 100);
  console.timeEnd('Second call (cache hit)');
  
  console.log('Same rate?', result1.rate === result2.rate); // true
}

/**
 * ============================================================================
 * REACT HOOKS EXAMPLES
 * ============================================================================
 */

// Example 11: useEffect hook for auto-conversion
import { useEffect, useState } from 'react';

function Example11_AutoConversion() {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const convertCurrency = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/currency-converter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to, amount })
        });
        const data = await response.json();
        if (data.success) {
          setResult(data);
        }
      } finally {
        setLoading(false);
      }
    };

    if (amount > 0) {
      convertCurrency();
    }
  }, [from, to, amount]);

  return (
    <div>
      <input value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      <select value={from} onChange={(e) => setFrom(e.target.value)}>
        {SUPPORTED_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
      </select>
      <select value={to} onChange={(e) => setTo(e.target.value)}>
        {SUPPORTED_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
      </select>
      
      {loading && <p>Converting...</p>}
      {result && <p>{result.amount} {result.from} = {result.convertedAmount} {result.to}</p>}
    </div>
  );
}

// Example 12: Custom hook for currency conversion
import { useCallback } from 'react';

function useCurrencyConverter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback(async (from: string, to: string, amount: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const client = new CurrencyConverterClient();
      const result = await client.convert(from, to, amount);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { convert, loading, error };
}

// Usage of custom hook
function Example12_CustomHook() {
  const { convert, loading, error } = useCurrencyConverter();
  
  const handleConvert = async () => {
    try {
      const result = await convert('USD', 'EUR', 100);
      console.log('Result:', result);
    } catch (err) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <button onClick={handleConvert} disabled={loading}>
        {loading ? 'Converting...' : 'Convert'}
      </button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}

/**
 * ============================================================================
 * AGENT BUILDER INTEGRATION EXAMPLES
 * ============================================================================
 */

// Example 13: Getting common conversions
function example13_commonConversions() {
  console.log('Common conversions:');
  COMMON_CONVERSIONS.forEach(conv => {
    console.log(`${conv.from} → ${conv.to}: ${conv.name}`);
  });
}

// Example 14: Building a conversion dropdown
function example14_conversionDropdown() {
  return (
    <select>
      <option value="">Select a conversion...</option>
      {COMMON_CONVERSIONS.map(conv => (
        <option key={`${conv.from}-${conv.to}`} value={`${conv.from}:${conv.to}`}>
          {conv.name}
        </option>
      ))}
    </select>
  );
}

// Example 15: Validation before API call
async function example15_validation() {
  const client = new CurrencyConverterClient();
  
  function validateInputs(from: string, to: string, amount: number): { valid: boolean; error?: string } {
    if (!client.isSupportedCurrency(from)) {
      return { valid: false, error: `${from} is not a supported currency` };
    }
    
    if (!client.isSupportedCurrency(to)) {
      return { valid: false, error: `${to} is not a supported currency` };
    }
    
    if (amount <= 0) {
      return { valid: false, error: 'Amount must be positive' };
    }
    
    if (!Number.isFinite(amount)) {
      return { valid: false, error: 'Amount must be a valid number' };
    }
    
    return { valid: true };
  }
  
  const validation = validateInputs('USD', 'EUR', 100);
  console.log('Validation:', validation);
}

/**
 * ============================================================================
 * EXPORTS FOR USE IN YOUR APPLICATION
 * ============================================================================
 */

export {
  example1_basicConversion,
  example2_usingClient,
  example3_errorHandling,
  example4_batchConversions,
  example5_conversionTable,
  example6_formattedOutput,
  example7_currencyInfo,
  example9_pollingRates,
  example10_cacheValidation,
  example13_commonConversions,
  example14_conversionDropdown,
  example15_validation,
  useCurrencyConverter,
};
