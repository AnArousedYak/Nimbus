const WEATHER_TIMEOUT_MS = 10_000;

function weatherCodeToText(code) {
  const map = {
    0: "Clear", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    56: "Freezing drizzle", 57: "Freezing drizzle",
    61: "Light rain", 63: "Moderate rain", 65: "Heavy rain",
    66: "Freezing rain", 67: "Freezing rain",
    71: "Light snow", 73: "Moderate snow", 75: "Heavy snow",
    77: "Snow grains",
    80: "Light showers", 81: "Moderate showers", 82: "Violent showers",
    85: "Light snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail"
  };
  return map[code] ?? "Unknown";
}

async function fetchWithTimeout(url, { headers, timeoutMs = WEATHER_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function getCurrentWeather(lat, lon) {
  try {
    const currentParams = [
      "temperature_2m",
      "apparent_temperature",
      "is_day",
      "weather_code",
      "relative_humidity_2m",
      "precipitation",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m"
    ].join(",");

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=${encodeURIComponent(currentParams)}` +
      `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`;

    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const c = data.current ?? {};
    const code = Number(c.weather_code ?? NaN);

    return {
      temp: c.temperature_2m ?? null,
      feelsLike: c.apparent_temperature ?? null,
      isDay: c.is_day === 1,
      weatherCode: code,
      description: weatherCodeToText(code),
      humidity: c.relative_humidity_2m ?? null,
      precip: c.precipitation ?? null,
      cloudCover: c.cloud_cover ?? null,
      pressureMsl: c.pressure_msl ?? null,
      windSpeed: c.wind_speed_10m ?? null,
      windDir: c.wind_direction_10m ?? null,
      error: null,
    };
  } catch (err) {
    return { error: { code: "WEATHER_ERROR", message: err?.message || "Weather fetch failed." } };
  }
}
