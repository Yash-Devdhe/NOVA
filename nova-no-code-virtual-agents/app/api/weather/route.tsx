import { NextResponse } from 'next/server';

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
      // OpenWeatherMap API
      if (!apiKey) {
        return NextResponse.json(
          { error: 'OpenWeatherMap API key is required' },
          { status: 400 }
        );
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
      );

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: data.message || 'Failed to fetch weather data' },
          { status: response.status }
        );
      }

      weatherData = {
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
    } else if (provider === 'open-meteo') {
      // Open-Meteo API (free, no API key needed)
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        return NextResponse.json(
          { error: 'City not found' },
          { status: 404 }
        );
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_surface_level`
      );

      const weather = await weatherResponse.json();

      weatherData = {
        provider: 'Open-Meteo (Free)',
        city: name,
        country: country,
        temperature: Math.round(weather.current.temperature_2m),
        feelsLike: Math.round(weather.current.apparent_temperature),
        humidity: weather.current.relative_humidity_2m,
        description: getWeatherDescription(weather.current.weather_code),
        windSpeed: weather.current.wind_speed_10m,
        pressure: Math.round(weather.current.pressure_surface_level),
      };
    } else {
      // Default to Open-Meteo (free)
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        return NextResponse.json(
          { error: 'City not found' },
          { status: 404 }
        );
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_surface_level`
      );

      const weather = await weatherResponse.json();

      weatherData = {
        provider: 'Open-Meteo (Free)',
        city: name,
        country: country,
        temperature: Math.round(weather.current.temperature_2m),
        feelsLike: Math.round(weather.current.apparent_temperature),
        humidity: weather.current.relative_humidity_2m,
        description: getWeatherDescription(weather.current.weather_code),
        windSpeed: weather.current.wind_speed_10m,
        pressure: Math.round(weather.current.pressure_surface_level),
      };
    }

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

