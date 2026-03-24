'use client';

import { CurrencyConverterTool } from '@/components/CurrencyConverterTool';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CurrencyConverterDemo() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testUrl, setTestUrl] = useState('/api/currency-converter');
  const [testPayload, setTestPayload] = useState(
    JSON.stringify({ from: 'USD', to: 'EUR', amount: 100 }, null, 2)
  );

  const handleRunTest = async () => {
    try {
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: testPayload,
      });

      const data = await response.json();

      setTestResults([
        {
          timestamp: new Date().toISOString(),
          status: response.status,
          payload: JSON.parse(testPayload),
          response: data,
          success: response.ok,
        },
        ...testResults,
      ]);
    } catch (error) {
      setTestResults([
        {
          timestamp: new Date().toISOString(),
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false,
        },
        ...testResults,
      ]);
    }
  };

  const runBatchTest = async () => {
    const testCases = [
      { from: 'USD', to: 'EUR', amount: 100 },
      { from: 'EUR', to: 'GBP', amount: 50 },
      { from: 'JPY', to: 'USD', amount: 10000 },
      { from: 'AUD', to: 'CAD', amount: 75 },
      { from: 'CHF', to: 'CNY', amount: 1 },
    ];

    for (const testCase of testCases) {
      try {
        const response = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testCase),
        });

        const data = await response.json();

        setTestResults((prev) => [
          {
            timestamp: new Date().toISOString(),
            status: response.status,
            payload: testCase,
            response: data,
            success: response.ok,
          },
          ...prev,
        ]);
      } catch (error) {
        setTestResults((prev) => [
          {
            timestamp: new Date().toISOString(),
            status: 'ERROR',
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false,
          },
          ...prev,
        ]);
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💱 Currency Converter API</h1>
          <p className="text-lg text-gray-600">
            Professional, fully-working currency conversion tool for your NOVA agents
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="demo" className="text-base">
              🎯 Live Demo
            </TabsTrigger>
            <TabsTrigger value="tester" className="text-base">
              🧪 API Tester
            </TabsTrigger>
            <TabsTrigger value="docs" className="text-base">
              📚 Documentation
            </TabsTrigger>
          </TabsList>

          {/* Demo Tab */}
          <TabsContent value="demo" className="space-y-6">
            <Card className="p-6 bg-white">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Live Converter</h2>
              <CurrencyConverterTool
                onSave={(config) => {
                  console.log('Configuration saved:', config);
                  alert(
                    `✓ Configuration saved!\n\nFrom: ${config.fromCurrency}\nTo: ${config.toCurrency}\nAmount: ${config.defaultAmount}`
                  );
                }}
              />
            </Card>
          </TabsContent>

          {/* Tester Tab */}
          <TabsContent value="tester" className="space-y-6">
            <Card className="p-6 bg-white">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">API Tester</h2>

              {/* Test Configuration */}
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="testUrl" className="font-semibold">
                    API Endpoint
                  </Label>
                  <Input
                    id="testUrl"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="testPayload" className="font-semibold">
                    Request Body (JSON)
                  </Label>
                  <textarea
                    id="testPayload"
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg font-mono text-sm h-40"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleRunTest}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  >
                    Run Test
                  </Button>
                  <Button
                    onClick={runBatchTest}
                    variant="outline"
                    className="border-teal-600 text-teal-600 hover:bg-teal-50"
                  >
                    Run Batch Test
                  </Button>
                </div>
              </div>

              {/* Test Results */}
              {testResults.length > 0 && (
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-800">Test Results</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-4 border-l-4 rounded-lg ${
                          result.success
                            ? 'border-green-600 bg-green-50'
                            : 'border-red-600 bg-red-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-800">
                            {result.success ? '✓ Success' : '✗ Failed'}
                          </span>
                          <span className="text-xs text-gray-600">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        {result.payload && (
                          <div className="mb-2 text-sm">
                            <p className="text-gray-700">
                              <strong>Request:</strong> {result.payload.from} → {result.payload.to}{' '}
                              ({result.payload.amount})
                            </p>
                          </div>
                        )}

                        {result.response && (
                          <div className="bg-white p-2 rounded text-sm font-mono whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                            {JSON.stringify(result.response, null, 2)}
                          </div>
                        )}

                        {result.error && (
                          <div className="bg-white p-2 rounded text-sm text-red-600">
                            {result.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="space-y-6">
            <Card className="p-6 bg-white space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">📚 Documentation</h2>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">API Endpoint</h3>
                    <div className="bg-gray-100 p-3 rounded font-mono text-sm border border-gray-300">
                      POST /api/currency-converter
                      <br />
                      GET /api/currency-converter?from=USD&to=EUR&amount=100
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Request Format</h3>
                    <div className="bg-gray-100 p-3 rounded font-mono text-sm border border-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(
                        { from: 'USD', to: 'EUR', amount: 100 },
                        null,
                        2
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Success Response</h3>
                    <div className="bg-green-50 p-3 rounded font-mono text-sm border border-green-300 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(
                        {
                          success: true,
                          from: 'USD',
                          to: 'EUR',
                          amount: 100,
                          rate: 0.9234,
                          convertedAmount: 92.34,
                          timestamp: '2024-03-22T10:30:45.123Z',
                          provider: 'exchangerate-api',
                        },
                        null,
                        2
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Real-time exchange rates</li>
                      <li>18+ major world currencies</li>
                      <li>Automatic fallback to secondary API</li>
                      <li>5-minute response caching</li>
                      <li>Professional error handling</li>
                      <li>ISO 4217 validation</li>
                      <li>No authentication required</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Integration Example</h3>
                    <div className="bg-gray-100 p-3 rounded font-mono text-sm border border-gray-300 whitespace-pre-wrap overflow-x-auto">
{`async function convert(from, to, amount) {
  const response = await fetch('/api/currency-converter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, amount })
  });
  return response.json();
}`}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Supported Currencies</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                      <div>USD - US Dollar</div>
                      <div>EUR - Euro</div>
                      <div>GBP - British Pound</div>
                      <div>JPY - Japanese Yen</div>
                      <div>AUD - Australian Dollar</div>
                      <div>CAD - Canadian Dollar</div>
                      <div>CHF - Swiss Franc</div>
                      <div>CNY - Chinese Yuan</div>
                      <div>SEK - Swedish Krona</div>
                      <div>NZD - New Zealand Dollar</div>
                      <div>INR - Indian Rupee</div>
                      <div>BRL - Brazilian Real</div>
                      <p className="col-span-2 text-gray-600 italic mt-2">
                        ...plus all other ISO 4217 currencies
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">✨ Ready to Use in Agent Builder</h3>
          <ol className="space-y-2 text-gray-700 list-decimal list-inside">
            <li>Add an <strong>API Tool node</strong> in the Agent Builder</li>
            <li>
              Configure API URL: <code className="bg-white px-2 py-1 rounded">/api/currency-converter</code>
            </li>
            <li>
              Set HTTP Method: <code className="bg-white px-2 py-1 rounded">POST</code>
            </li>
            <li>Connect it to your workflow</li>
            <li>Pass user inputs for from, to, and amount</li>
            <li>Deploy and test your currency converter agent! 🚀</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
