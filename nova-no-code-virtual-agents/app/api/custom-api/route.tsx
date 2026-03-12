
import { NextResponse } from 'next/server';

// Custom API Tool - allows users to call any external API with their own API keys
// Supports GET, POST, PUT, DELETE methods with custom headers and body

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      url, 
      method, 
      apiKey, 
      headers, 
      body: requestBody,
      contentType 
    } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'API URL is required' },
        { status: 400 }
      );
    }

    if (!method) {
      return NextResponse.json(
        { error: 'HTTP method is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format. Please include http:// or https://' },
        { status: 400 }
      );
    }

    // Build headers
    const requestHeaders: Record<string, string> = {
      'Accept': 'application/json',
      ...(headers || {}),
    };

    // Add API key if provided
    if (apiKey) {
      if (headers?.Authorization) {
        // Use existing Authorization header
      } else if (headers?.['X-API-Key']) {
        // Use X-API-Key header
      } else {
        // Default to Bearer token
        requestHeaders['Authorization'] = `Bearer ${apiKey}`;
      }
    }

    // Set content type
    if (contentType && !requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = contentType;
    } else if (!requestHeaders['Content-Type'] && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    // Make the API request
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: requestHeaders,
    };

    // Add body for POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && requestBody) {
      if (typeof requestBody === 'string') {
        fetchOptions.body = requestBody;
      } else {
        fetchOptions.body = JSON.stringify(requestBody);
      }
    }

    const response = await fetch(validatedUrl.toString(), fetchOptions);

    // Get response content type
    const responseContentType = response.headers.get('content-type') || '';
    
    let responseData;
    
    if (responseContentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch {
        responseData = { raw: await response.text(), error: 'Failed to parse JSON' };
      }
    } else {
      const rawText = await response.text();
      // Check if it's an HTML error page
      if (rawText.toLowerCase().includes('<!doctype') || rawText.toLowerCase().includes('<html')) {
        return NextResponse.json({
          success: false,
          status: response.status,
          statusText: response.statusText,
          error: `API returned HTML instead of JSON (status ${response.status}). Check your API URL is correct.`,
          data: { raw: rawText.slice(0, 500) },
          url: url,
          method: method.toUpperCase(),
          hint: 'For weather, use: https://api.openweathermap.org/data/2.5/weather?q={{city}}&appid={{apiKey}}'
        }, { status: 400 });
      }
      responseData = { raw: rawText };
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      url: url,
      method: method.toUpperCase(),
    });
  } catch (error) {
    console.error('Custom API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to call API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle preflight OPTIONS requests
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    },
  });
}

