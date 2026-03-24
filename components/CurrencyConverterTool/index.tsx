'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'ZAR', name: 'South African Rand' },
];

interface ConversionResult {
  success: boolean;
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  provider: string;
  timestamp: string;
}

interface CurrencyConverterToolProps {
  onSave?: (config: CurrencyConverterConfig) => void;
  initialConfig?: CurrencyConverterConfig;
}

interface CurrencyConverterConfig {
  fromCurrency: string;
  toCurrency: string;
  defaultAmount?: number;
}

export function CurrencyConverterTool({
  onSave,
  initialConfig,
}: CurrencyConverterToolProps) {
  const [fromCurrency, setFromCurrency] = useState(initialConfig?.fromCurrency || 'USD');
  const [toCurrency, setToCurrency] = useState(initialConfig?.toCurrency || 'EUR');
  const [amount, setAmount] = useState<string>(
    initialConfig?.defaultAmount?.toString() || '100'
  );
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Auto-convert on amount or currency change
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      handleConvert();
    }
  }, [fromCurrency, toCurrency]);

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/currency-converter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromCurrency,
          to: toCurrency,
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Conversion failed');
        setResult(null);
      } else {
        setResult(data);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert currency');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        fromCurrency,
        toCurrency,
        defaultAmount: parseFloat(amount),
      });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="p-6 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">💱 Currency Converter</h2>
            <p className="text-sm text-gray-600 mt-1">Real-time exchange rates</p>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 mb-2 block">
            Amount to Convert
          </Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="text-lg border-2 border-gray-300 focus:border-teal-500 focus:ring-teal-500"
          />
        </div>

        {/* Currency Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* From Currency */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              From Currency
            </Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="border-2 border-gray-300 focus:border-teal-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POPULAR_CURRENCIES.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Swap Button */}
          <div className="flex items-end pb-0">
            <Button
              onClick={handleSwapCurrencies}
              variant="outline"
              size="sm"
              className="w-full border-2 border-gray-300 hover:bg-teal-100 hover:border-teal-500"
            >
              ⇄ Swap
            </Button>
          </div>
        </div>

        {/* To Currency */}
        <div className="mb-6">
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">
            To Currency
          </Label>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger className="border-2 border-gray-300 focus:border-teal-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POPULAR_CURRENCIES.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.code} - {curr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-2 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* Result Display */}
        {result && !error && (
          <Card className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">
                  {result.amount} {result.from}
                </span>
                <span className="text-gray-400">→</span>
                <span className="text-2xl font-bold text-teal-600">
                  {result.convertedAmount} {result.to}
                </span>
              </div>
              <div className="pt-2 border-t border-teal-200">
                <div className="text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Exchange Rate:</span> 1 {result.from} =
                    {' '}
                    <span className="font-bold text-teal-700">{result.rate.toFixed(4)}</span>{' '}
                    {result.to}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Updated: {new Date(result.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-6 flex items-center justify-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <Loader className="h-5 w-5 animate-spin text-blue-600 mr-2" />
            <span className="text-blue-700 font-medium">Converting...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleConvert}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2"
          >
            {loading ? 'Converting...' : 'Convert'}
          </Button>
          <Button
            onClick={handleSave}
            variant="outline"
            className="flex-1 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold"
          >
            {isSaved ? '✓ Saved' : 'Save Configuration'}
          </Button>
        </div>
      </Card>

      {/* Info Text */}
      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="font-semibold text-gray-700 mb-2">ℹ️ About This Tool</p>
        <ul className="space-y-1 text-gray-600 list-disc list-inside">
          <li>Supports all major world currencies (ISO 4217 codes)</li>
          <li>Real-time exchange rates with 5-minute caching</li>
          <li>Automatic fallback to secondary API for reliability</li>
          <li>No API key required - free service</li>
        </ul>
      </div>
    </div>
  );
}
