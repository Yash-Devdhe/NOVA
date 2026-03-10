import { NextResponse } from 'next/server';

type WeatherPayload = {
  provider: string;
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  windSpeed: number;
  pressure: number;
  icon?: string;
  visibility?: number;
  sunrise?: string;
  sunset?: string;
  warning?: string;
};

async function parseResponseSafely(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const raw = await response.text();
  throw new Error(
    `Upstream weather provider returned non-JSON content (${response.status}): ${raw.slice(0, 120)}`
  );
}

async function fetchOpenMeteoWeather(city: string): Promise<WeatherPayload> {
  const geoResponse = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  );
  const geoData = await parseResponseSafely(geoResponse);

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error('City not found');
  }

  const { latitude, longitude, name, country } = geoData.results[0];
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_surface_level`
  );
  const weather = await parseResponseSafely(weatherResponse);
  const current = weather?.current;

  if (
    !current ||
    typeof current.temperature_2m !== 'number' ||
    typeof current.apparent_temperature !== 'number' ||
    typeof current.relative_humidity_2m !== 'number'
  ) {
    throw new Error('Open-Meteo response missing current weather fields');
  }

  return {
    provider: 'Open-Meteo (Free)',
    city: name,
    country: country,
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    description: getWeatherDescription(current.weather_code),
    windSpeed: current.wind_speed_10m,
    pressure: Math.round(current.pressure_surface_level),
  };
}

async function fetchOpenWeatherMapWeather(
  city: string,
  apiKey: string
): Promise<WeatherPayload> {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
  );
  const data = await parseResponseSafely(response);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch weather data');
  }

  return {
    provider: 'OpenWeatherMap',
    city: data.name,
    country: data.sys.country,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    windSpeed: data.wind.speed,
    pressure: data.main.pressure,
    visibility: data.visibility,
    sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
    sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
  };
}

// Weather API - supports multiple providers
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { city, apiKey, provider } = body;

    if (!city) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      );
    }

    let weatherData;

    if (provider === 'openweathermap') {
      if (apiKey) {
        try {
          weatherData = await fetchOpenWeatherMapWeather(city, apiKey);
        } catch (error) {
          const fallback = await fetchOpenMeteoWeather(city);
          weatherData = {
            ...fallback,
            warning:
              error instanceof Error
                ? `OpenWeatherMap failed, auto-fallback used: ${error.message}`
                : 'OpenWeatherMap failed, auto-fallback used.',
          };
        }
      } else {
        weatherData = await fetchOpenMeteoWeather(city);
        weatherData.warning = 'OpenWeatherMap API key missing, auto-fallback used.';
      }
    } else if (provider === 'open-meteo') {
      weatherData = await fetchOpenMeteoWeather(city);
    } else {
      weatherData = await fetchOpenMeteoWeather(city);
    }

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

function getWeatherDescription(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return weatherCodes[code] || 'Unknown';
}

