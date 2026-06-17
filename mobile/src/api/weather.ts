import type { WeatherCurrent, WeatherHour } from "../types";

// Maps WMO code to MaterialIcons name
function wmoIcon(code: number): string {
  if (code === 0 || code === 1) return "wb-sunny";
  if (code === 2) return "wb-cloudy";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "blur-on";
  if (code >= 51 && code <= 55) return "grain";
  if (code >= 61 && code <= 67) return "umbrella";
  if (code >= 71 && code <= 77) return "ac-unit";
  if (code >= 80 && code <= 82) return "beach-access";
  if (code === 85 || code === 86) return "ac-unit";
  if (code >= 95) return "flash-on";
  return "cloud";
}

// WMO weather interpretation codes
const WMO_DESC: Record<number, string> = {
  0: "Cielo despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna densa",
  61: "Lluvia leve",
  63: "Lluvia moderada",
  65: "Lluvia intensa",
  71: "Nevada leve",
  73: "Nevada moderada",
  75: "Nevada intensa",
  77: "Granizo",
  80: "Chubascos leves",
  81: "Chubascos moderados",
  82: "Chubascos violentos",
  85: "Chubascos de nieve",
  95: "Tormenta eléctrica",
  96: "Tormenta con granizo",
  99: "Tormenta intensa con granizo",
};

function wmoDesc(code: number): string {
  return WMO_DESC[code] ?? "Condición desconocida";
}

export interface WeatherData {
  current: WeatherCurrent;
  hourly: WeatherHour[];
  isRainAlert: boolean;
}

// La Paz, Bolivia — override per-deployment if needed
const LAT = -16.5;
const LON = -68.15;

export async function fetchWeather(): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${LAT}&longitude=${LON}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
    `&hourly=temperature_2m,weather_code` +
    `&forecast_days=2&timezone=America%2FLa_Paz`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo obtener el clima");
  const data = await res.json();

  const c = data.current;

  const current: WeatherCurrent = {
    temperature: Math.round(c.temperature_2m),
    humidity: Math.round(c.relative_humidity_2m),
    weatherCode: c.weather_code,
    windSpeed: Math.round(c.wind_speed_10m),
    description: wmoDesc(c.weather_code),
    icon: wmoIcon(c.weather_code),
  };

  const now = new Date();
  const hourly: WeatherHour[] = data.hourly.time
    .slice(0, 24)
    .map((t: string, i: number) => ({
      time: t,
      temperature: Math.round(data.hourly.temperature_2m[i]),
      weatherCode: data.hourly.weather_code[i],
      icon: wmoIcon(data.hourly.weather_code[i]),
    }))
    .filter((_: WeatherHour, i: number) => {
      const t = new Date(data.hourly.time[i]);
      return t >= now;
    })
    .slice(0, 12);

  const isRainAlert = [61, 63, 65, 80, 81, 82, 95, 96, 99].includes(c.weather_code);

  return { current, hourly, isRainAlert };
}
