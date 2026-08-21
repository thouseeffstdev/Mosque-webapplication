import React, { useState, useEffect } from "react";

const getWeatherInfo = (code, isDay = 1) => {
  switch (code) {
    case 0:
      return { label: "Clear Sky", icon: isDay ? "☀️" : "🌙" };
    case 1:
      return { label: "Mainly Clear", icon: isDay ? "🌤️" : "🌙" };
    case 2:
      return { label: "Partly Cloudy", icon: "⛅" };
    case 3:
      return { label: "Overcast", icon: "☁️" };
    case 45:
    case 48:
      return { label: "Foggy", icon: "🌫️" };
    case 51:
    case 53:
    case 55:
      return { label: "Light Drizzle", icon: "🌦️" };
    case 61:
    case 63:
    case 65:
      return { label: "Rain Showers", icon: "🌧️" };
    case 71:
    case 73:
    case 75:
      return { label: "Snow", icon: "❄️" };
    case 80:
    case 81:
    case 82:
      return { label: "Heavy Rain", icon: "🌧️" };
    case 95:
    case 96:
    case 99:
      return { label: "Thunderstorm", icon: "⛈️" };
    default:
      return { label: "Fair", icon: isDay ? "🌤️" : "🌙" };
  }
};

const LiveWeatherWidget = ({ compact = false, theme = "light" }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = (lat, lon) => {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph`
      )
        .then((r) => r.json())
        .then((d) => {
          if (d && d.current_weather) {
            setWeather(d.current_weather);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => fetchWeather(coords.latitude, coords.longitude),
      () => fetchWeather(32.1149, -81.2348) // Pooler, GA
    );
  }, []);

  if (loading) {
    return (
      <div className={`p-4 rounded-2xl flex items-center gap-3 animate-pulse ${
        theme === "dark" ? "bg-slate-800/60 text-slate-400" : "bg-cyan-50/80 border border-cyan-100 text-cyan-700"
      }`}>
        <span className="text-xl">🌤️</span>
        <span className="text-xs">Loading weather...</span>
      </div>
    );
  }

  if (!weather) return null;

  const info = getWeatherInfo(weather.weathercode, weather.is_day);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm ${
        theme === "dark"
          ? "bg-slate-800/80 border border-white/10 text-white"
          : "bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-100 text-slate-800"
      }`}>
        <span className="text-lg">{info.icon}</span>
        <span className="font-bold">{Math.round(weather.temperature)}°F</span>
        <span className="text-gray-400">·</span>
        <span className={theme === "dark" ? "text-yellow-400" : "text-sky-700"}>{info.label}</span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-400 font-normal">Pooler, GA</span>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-5 border transition-all duration-300 transform hover:scale-[1.02] shadow-sm ${
      theme === "dark"
        ? "bg-gradient-to-br from-slate-800 to-slate-900 border-teal-500/30 text-white"
        : "bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 border-sky-100 text-slate-900"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner ${
            theme === "dark" ? "bg-teal-500/20" : "bg-sky-500/10"
          }`}>
            {info.icon}
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-sky-600 uppercase">Live Weather</p>
            <h4 className="text-2xl font-black">{Math.round(weather.temperature)}°F</h4>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
          theme === "dark" ? "bg-teal-500/20 text-teal-300" : "bg-sky-100 text-sky-800"
        }`}>
          {info.label}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/40">
        <span>📍 Pooler, GA</span>
        <span>💨 Wind: {weather.windspeed} mph</span>
      </div>
    </div>
  );
};

export default LiveWeatherWidget;
