"use client";

import { useEffect, useState } from "react";

export default function StadiumWeather({ lat, lng, compact = false }: { lat?: number; lng?: number; compact?: boolean }) {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!lat || !lng) {
      setLoading(false);
      setError(true);
      return;
    }

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data.current_weather) {
          setWeather({ temp: data.current_weather.temperature, code: data.current_weather.weathercode });
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  if (loading) return <span className="text-slate-400">Loading...</span>;
  if (error || !weather) return <span className="text-slate-400">Not available</span>;

  // Map WMO weather codes to emoji and descriptions
  const getWeatherDesc = (code: number) => {
    if (code === 0) return { icon: "☀️", text: "Clear" };
    if (code === 1 || code === 2 || code === 3) return { icon: "⛅", text: "Partly cloudy" };
    if (code >= 45 && code <= 48) return { icon: "🌫️", text: "Fog" };
    if (code >= 51 && code <= 55) return { icon: "🌧️", text: "Drizzle" };
    if (code >= 61 && code <= 65) return { icon: "🌧️", text: "Rain" };
    if (code >= 71 && code <= 77) return { icon: "❄️", text: "Snow" };
    if (code >= 80 && code <= 82) return { icon: "🌦️", text: "Showers" };
    if (code >= 95 && code <= 99) return { icon: "⛈️", text: "Thunderstorm" };
    return { icon: "🌤️", text: "Unknown" };
  };

  const desc = getWeatherDesc(weather.code);

  if (compact) {
    return <span className="font-semibold">{desc.icon} {Math.round(weather.temp)}°C</span>;
  }

  return (
    <span className="font-medium text-slate-700 dark:text-slate-300">
      {desc.icon} {Math.round(weather.temp)}°C — {desc.text}
    </span>
  );
}
