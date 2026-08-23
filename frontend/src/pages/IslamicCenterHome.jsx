import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Mosque3DWalkthrough from "../components/3d/Mosque3DWalkthrough";
import Kaaba3DExperience from "../components/3d/Kaaba3DExperience";

/* ─── helpers ─── */
const to12 = (t) => {
  if (!t) return "--:--";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const IQAMAH = {
  Fajr: "05:30 AM",
  Dhuhr: "01:30 PM",
  Asr: "05:00 PM",
  Maghrib: "+5 min",
  Isha: "09:15 PM",
};

const PRAYER_ICONS = {
  Fajr: "🌙", Dhuhr: "☀️", Asr: "🌤️", Maghrib: "🌇", Isha: "🌃",
};

const EVENTS = [
  { title: "Jumu'ah Khutbah", date: "Every Friday", time: "2:30 PM (Adhan 2:00 PM)", tag: "Weekly", color: "gold" },
  { title: "Weekend Islamic School", date: "Every Saturday", time: "10:00 AM", tag: "Education", color: "blue" },
  { title: "Quran Hifz Program", date: "Mon – Thu", time: "6:30 PM", tag: "Quran", color: "green" },
  { title: "Sisters' Halaqah", date: "Every Sunday", time: "11:00 AM", tag: "Community", color: "purple" },
  { title: "Youth Night", date: "2nd & 4th Saturday", time: "7:00 PM", tag: "Youth", color: "orange" },
  { title: "Ramadan Iftaar Program", date: "During Ramadan", time: "Sunset", tag: "Ramadan", color: "gold" },
];

const SERVICES = [
  { icon: "💍", title: "Matrimonial Services", desc: "Connecting Muslim singles within our community with proper Islamic guidance, photo profile, and family involvement.", link: "/nikah" },
  { icon: "🌟", title: "Kids Islamic Quiz & Adventure", desc: "Interactive Islamic trivia for children and youth of all ages. Win badges, streak scores, and certificates!", link: "/kids-quiz" },
  { icon: "🕌", title: "Funeral / Janazah", desc: "Janazah prayers, ghusl, and burial coordination. We are here for you in your time of need." },
  { icon: "📖", title: "Quran Classes", desc: "Tajweed, Hifz, and Arabic classes for all ages — children through adults." },
  { icon: "👦", title: "Youth Programs", desc: "Mentorship, sports, Islamic enrichment, and leadership programs for our next generation.", link: "/kids-quiz" },
  { icon: "🤲", title: "Charity / Zakat", desc: "Zakat collection and distribution to those in need locally and globally." },
  { icon: "🏫", title: "Weekend School", desc: "Full Islamic studies curriculum for K–12 students every Saturday morning." },
];

const TAG_COLORS = {
  gold: "bg-yellow-100 text-yellow-800 border-yellow-300",
  blue: "bg-blue-100 text-blue-800 border-blue-300",
  green: "bg-green-100 text-green-800 border-green-300",
  purple: "bg-purple-100 text-purple-800 border-purple-300",
  orange: "bg-orange-100 text-orange-800 border-orange-300",
};

/* ─── Weather Helper (WMO Codes) ─── */
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
      return { label: "Rain", icon: "🌧️" };
    case 71:
    case 73:
    case 75:
      return { label: "Snow", icon: "❄️" };
    case 80:
    case 81:
    case 82:
      return { label: "Rain Showers", icon: "🌧️" };
    case 95:
    case 96:
    case 99:
      return { label: "Thunderstorm", icon: "⛈️" };
    default:
      return { label: "Fair", icon: isDay ? "🌤️" : "🌙" };
  }
};

/* ─── main component ─── */
const IslamicCenterHome = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState({});
  const [nextPrayer, setNextPrayer] = useState(null);
  const [weather, setWeather] = useState(null);
  const [now, setNow] = useState(new Date());
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [active3DTab, setActive3DTab] = useState("kaaba"); // "kaaba" | "mosque"
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch Prayer Times & Live Weather
  useEffect(() => {
    const fetchTimes = (lat, lon) => {
      fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`)
        .then(r => r.json())
        .then(d => setPrayerTimes(d.data.timings))
        .catch(() => { });
    };

    const fetchWeather = (lat, lon) => {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph`)
        .then(r => r.json())
        .then(d => {
          if (d && d.current_weather) {
            setWeather(d.current_weather);
          }
        })
        .catch(() => { });
    };

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        fetchTimes(coords.latitude, coords.longitude);
        fetchWeather(coords.latitude, coords.longitude);
      },
      () => {
        // Pooler, GA fallback coordinates
        fetchTimes(32.1149, -81.2348);
        fetchWeather(32.1149, -81.2348);
      }
    );
  }, []);

  useEffect(() => {
    if (!Object.keys(prayerTimes).length) return;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    for (const name of PRAYER_ORDER) {
      const t = prayerTimes[name];
      if (!t) continue;
      const [h, m] = t.split(":").map(Number);
      if (h * 60 + m > nowMins) { setNextPrayer(name); return; }
    }
    setNextPrayer("Fajr");
  }, [prayerTimes, now]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const NAV_LINKS = [
    { label: "Home", id: "hero" },
    { label: "About Us", id: "about" },
    { label: "3D Virtual Tour", id: "virtual-tour" },
    { label: "Prayer Times", id: "prayer-times" },
    { label: "Services", id: "services" },
    { label: "Events", id: "events" },
    { label: "Contact", id: "contact" },
  ];

  const isFriday = now.getDay() === 5;

  return (
    <div style={{ fontFamily: "'Outfit', 'Poppins', sans-serif" }} className="bg-white text-gray-800">

      {/* ── FRIDAY SPECIAL BANNER ── */}
      {isFriday && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 60,
            background: "linear-gradient(90deg, #d97706, #eab308, #d97706)",
            color: "#0f172a",
            fontWeight: 900,
            padding: "8px 16px",
            textAlign: "center",
            fontSize: "clamp(12px, 2.5vw, 14px)",
            boxShadow: "0 4px 20px rgba(234, 179, 8, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span className="animate-bounce">🕌</span>
          <span>
            <strong>✨ TODAY IS FRIDAY — JUMU'AH MUBARAK! ✨</strong> Special Congregation: <strong>Adhan 2:00 PM</strong> · <strong>Iqamah 2:30 PM</strong>
          </span>
          <button
            onClick={() => scrollTo("prayer-times")}
            style={{
              background: "#0f172a",
              color: "#fde68a",
              border: "none",
              borderRadius: 9999,
              padding: "3px 12px",
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              marginLeft: 8,
            }}
          >
            View Times ↓
          </button>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: isFriday ? 36 : 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: scrolled ? "#0f172a" : "transparent",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.3)" : "none",
        padding: scrolled ? "12px 0" : "20px 0",
        transition: "all 0.3s ease",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => scrollTo("hero")} style={{ display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer" }}>
            <img src="/assets/logo.jpg" alt="Logo" style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid #eab308", objectFit: "cover" }} />
            <div style={{ textAlign: "left" }}>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 14, margin: 0, lineHeight: 1 }}>Islamic Center</p>
              <p style={{ color: "#eab308", fontWeight: 700, fontSize: 12, margin: 0, lineHeight: 1.4 }}>of Pooler</p>
            </div>
          </button>

          {/* Desktop links */}
          <div className="hidden lg:flex" style={{ alignItems: "center", gap: 20 }}>
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)}
                style={{ color: "#d1d5db", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, transition: "color 0.2s" }}
                onMouseOver={e => e.currentTarget.style.color = "#eab308"}
                onMouseOut={e => e.currentTarget.style.color = "#d1d5db"}>
                {l.label}
              </button>
            ))}
            <button onClick={() => navigate("/kids-quiz")}
              style={{ background: "rgba(16,185,129,0.18)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.4)", fontWeight: 700, padding: "8px 16px", borderRadius: 9999, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
              onMouseOver={e => { e.currentTarget.style.background = "#10b981"; e.currentTarget.style.color = "#0f172a"; }}
              onMouseOut={e => { e.currentTarget.style.background = "rgba(16,185,129,0.18)"; e.currentTarget.style.color = "#6ee7b7"; }}>
              <span>🌟</span> Kids Quiz
            </button>
            <button onClick={() => navigate("/nikah")}
              style={{ background: "rgba(234,179,8,0.15)", color: "#fde68a", border: "1px solid rgba(234,179,8,0.4)", fontWeight: 700, padding: "8px 16px", borderRadius: 9999, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
              onMouseOver={e => { e.currentTarget.style.background = "#eab308"; e.currentTarget.style.color = "#0f172a"; }}
              onMouseOut={e => { e.currentTarget.style.background = "rgba(234,179,8,0.15)"; e.currentTarget.style.color = "#fde68a"; }}>
              <span>💍</span> Matrimonial
            </button>
            <button onClick={() => navigate("/login")}
              style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", fontWeight: 700, padding: "8px 16px", borderRadius: 9999, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
              onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.borderColor = "#eab308"; }}
              onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}>
              <span>👤</span> Portal
            </button>
            <button onClick={() => scrollTo("contact")}
              style={{ background: "#eab308", color: "#0f172a", fontWeight: 800, padding: "9px 20px", borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 13 }}
              onMouseOver={e => e.currentTarget.style.background = "#fbbf24"}
              onMouseOut={e => e.currentTarget.style.background = "#eab308"}>
              💛 Donate
            </button>
          </div>

          {/* Mobile burger */}
          <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 24, height: 2, background: "#fff", marginBottom: i < 2 ? 5 : 0 }} />
            ))}
          </button>
        </div>

        {menuOpen && (
          <div style={{ background: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.1)", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)}
                style={{ color: "#d1d5db", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 500, padding: "4px 0" }}>
                {l.label}
              </button>
            ))}
            <button onClick={() => { setMenuOpen(false); navigate("/kids-quiz"); }}
              style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.4)", fontWeight: 700, padding: "10px", borderRadius: 9999, cursor: "pointer", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span>🌟</span> Kids Islamic Quiz
            </button>
            <button onClick={() => { setMenuOpen(false); navigate("/nikah"); }}
              style={{ background: "rgba(234,179,8,0.2)", color: "#fde68a", border: "1px solid rgba(234,179,8,0.4)", fontWeight: 700, padding: "10px", borderRadius: 9999, cursor: "pointer", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span>💍</span> Matrimonial & Nikah
            </button>
            <button onClick={() => { setMenuOpen(false); navigate("/login"); }}
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 700, padding: "10px", borderRadius: 9999, border: "none", cursor: "pointer", textAlign: "center" }}>
              👤 Member Portal
            </button>
            <button onClick={() => scrollTo("contact")}
              style={{ background: "#eab308", color: "#0f172a", fontWeight: 800, padding: "10px", borderRadius: 9999, border: "none", cursor: "pointer" }}>
              💛 Donate
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="hero" ref={heroRef} style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/assets/hero-banner.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(15,23,42,0.85), rgba(15,23,42,0.65), rgba(15,23,42,0.95))" }} />

        {/* Animated background particles */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-yellow-300 rounded-full animate-twinkle" />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-yellow-200 rounded-full animate-twinkle" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white rounded-full animate-twinkle" style={{ animationDelay: "2s" }} />
          <div className="absolute top-20 right-1/6 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-twinkle" style={{ animationDelay: "1.5s" }} />
        </div>

        <div style={{ position: "relative", zIndex: 10, textAlign: "center", color: "#fff", padding: "100px 24px 60px", maxWidth: 880, margin: "0 auto" }}>

          {/* Floating Logo Badge */}
          <div className="animate-float mb-4 inline-block">
            <img
              src="/assets/logo.jpg"
              alt="Islamic Center Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-400 object-cover mx-auto shadow-2xl shadow-yellow-500/30 ring-4 ring-yellow-400/20"
            />
          </div>

          <p style={{ color: "#eab308", fontSize: 22, letterSpacing: 6, marginBottom: 16, fontWeight: 400 }} className="animate-pulse">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
          </p>

          <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 5.2rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16, margin: "0 0 16px 0" }}>
            Islamic Center
            <span style={{ display: "block", color: "#eab308", textShadow: "0 0 30px rgba(234,179,8,0.3)" }}>of Pooler</span>
          </h1>

          <p style={{ fontSize: 18, color: "#d1d5db", maxWidth: 620, margin: "0 auto 16px", lineHeight: 1.7 }}>
            A welcoming home for the Muslim community of Pooler, Georgia. Rooted in faith. United in community. Serving with purpose.
          </p>

          <p style={{ color: "#fde68a", fontSize: 14, marginBottom: 36, fontWeight: 600 }}>
            📍 Pooler, Georgia &nbsp;·&nbsp; Est. 2012
          </p>

          {/* Call to Action Buttons */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
            <button
              onClick={() => scrollTo("prayer-times")}
              style={{ background: "#eab308", color: "#0f172a", fontWeight: 800, padding: "15px 36px", borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 16 }}
              className="transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/40 transition-all duration-300 active:scale-95"
            >
              🕌 Daily Prayer Times
            </button>
            <button
              onClick={() => scrollTo("events")}
              style={{ background: "rgba(255,255,255,0.12)", color: "#fff", fontWeight: 600, padding: "15px 36px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16, backdropFilter: "blur(8px)" }}
              className="transform hover:scale-105 hover:bg-white/20 hover:border-yellow-400/50 transition-all duration-300 active:scale-95"
            >
              📅 Upcoming Events
            </button>
          </div>

          {/* Live Weather & Time Capsule with hover lift */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Live Weather Widget */}
            {weather ? (
              <div
                style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "rgba(15,23,42,0.75)", backdropFilter: "blur(14px)", border: "1px solid rgba(234,179,8,0.35)", borderRadius: 20, padding: "12px 22px" }}
                className="transform hover:scale-105 transition-transform duration-300 shadow-xl shadow-black/40"
              >
                <span style={{ fontSize: 26 }} className="animate-float">
                  {getWeatherInfo(weather.weathercode, weather.is_day).icon}
                </span>
                <div style={{ textAlign: "left" }}>
                  <p style={{ margin: 0, color: "#fff", fontWeight: 800, fontSize: 15, lineHeight: 1.1 }}>
                    {Math.round(weather.temperature)}°F
                    <span style={{ color: "#eab308", fontSize: 12, fontWeight: 700, marginLeft: 6 }}>
                      {getWeatherInfo(weather.weathercode, weather.is_day).label}
                    </span>
                  </p>
                  <p style={{ margin: 0, color: "#9ca3af", fontSize: 11, fontWeight: 500 }}>
                    📍 Pooler, GA · Wind: {weather.windspeed} mph
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(15,23,42,0.5)", borderRadius: 20, padding: "10px 18px", fontSize: 12, color: "#9ca3af" }}>
                <span>🌤️</span>
                <span>Loading Pooler weather...</span>
              </div>
            )}

            {/* Live Clock & Next Prayer */}
            <div
              style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "rgba(15,23,42,0.75)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 20, padding: "12px 22px" }}
              className="transform hover:scale-105 transition-transform duration-300 shadow-xl shadow-black/40"
            >
              <div style={{ width: 10, height: 10, background: "#4ade80", borderRadius: "50%", animation: "pulse 2s infinite" }} />
              <div style={{ textAlign: "left" }}>
                <p style={{ margin: 0, color: "#fff", fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>
                  {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  <span style={{ color: "#9ca3af", fontSize: 11, fontWeight: 400, marginLeft: 6 }}>
                    {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                </p>
                {nextPrayer && prayerTimes[nextPrayer] && (
                  <p style={{ margin: 0, color: "#fde68a", fontSize: 11, fontWeight: 700 }}>
                    Next Prayer: {nextPrayer} at {to12(prayerTimes[nextPrayer])}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", textAlign: "center", color: "rgba(255,255,255,0.4)", animation: "bounce 2s infinite" }}>
          <div style={{ fontSize: 10, marginBottom: 2 }}>scroll</div>
          <div style={{ fontSize: 16 }}>↓</div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: "90px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "center" }}>
          <div>
            <span style={{ color: "#eab308", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 4 }}>About Us</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, color: "#0f172a", margin: "12px 0 20px", lineHeight: 1.2 }}>
              A Community Built on <span style={{ color: "#eab308" }}>Faith & Brotherhood</span>
            </h2>
            <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 16 }}>
              The Islamic Center of Pooler serves as the spiritual and cultural heart of the Muslim community in Pooler, Georgia. Founded in 2012, our center has grown into a vibrant hub for worship, education, and community service.
            </p>
            <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 32 }}>
              We welcome Muslims and non-Muslims alike, offering an open, inclusive environment rooted in the teachings of Islam — compassion, justice, and service to all of humanity.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[["500+", "Families"], ["12+", "Years Serving"], ["7", "Days a Week"]].map(([num, label]) => (
                <div key={label} style={{ textAlign: "center", padding: 18, background: "#f9fafb", borderRadius: 16, border: "1px solid #f3f4f6" }} className="transform hover:scale-105 hover:shadow-md transition-all duration-300">
                  <p style={{ fontSize: 26, fontWeight: 900, color: "#eab308", margin: "0 0 4px" }}>{num}</p>
                  <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative" }} className="group">
            <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
              <img
                src="/assets/hero-banner.jpg"
                alt="Community"
                style={{ width: "100%", height: 380, objectFit: "cover" }}
                className="transform group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div style={{ position: "absolute", bottom: -20, right: -20, background: "#0f172a", border: "2px solid #eab308", borderRadius: 18, padding: "16px 24px", color: "#fff", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }} className="animate-float-slow hidden sm:block">
              <p style={{ fontSize: 24, fontWeight: 900, color: "#eab308", margin: 0 }}>All Welcome</p>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, fontWeight: 600 }}>Daily 5 Salah · Jumu'ah · Classes</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3D VIRTUAL TOUR & MAKKAH KAABA ── */}
      <section id="virtual-tour" style={{ padding: "90px 24px 70px", background: "#060d1a", position: "relative" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <span style={{ color: "#eab308", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 4 }}>
              Interactive 3D Spiritual Immersion
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.7rem)", fontWeight: 900, color: "#fff", margin: "12px 0 10px" }}>
              {active3DTab === "kaaba" ? (
                <>The Holy Kaaba <span style={{ color: "#eab308" }}>Makkah al-Mukarramah in 3D</span></>
              ) : (
                <>Step Inside Our Masjid <span style={{ color: "#eab308" }}>in 3D</span></>
              )}
            </h2>
            <p style={{ color: "#9ca3af", fontSize: 14, maxWidth: 660, margin: "0 auto", lineHeight: 1.7 }}>
              {active3DTab === "kaaba"
                ? "Experience the sacred Holy Kaaba, the golden Bab al-Kaaba, Hajar al-Aswad, and the continuous Tawaf orbit of pilgrims in Masjid al-Haram."
                : "Experience walking through our grand arched entrance, past the marble pillars and glowing lanterns, directly into the prayer hall towards the Mihrab."}
            </p>
          </div>

          {/* 3D Tab Switcher */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setActive3DTab("kaaba")}
              style={{
                background: active3DTab === "kaaba" ? "linear-gradient(135deg, #eab308, #ca8a04)" : "rgba(255,255,255,0.06)",
                color: active3DTab === "kaaba" ? "#0f172a" : "#d1d5db",
                fontWeight: 900,
                fontSize: 14,
                padding: "12px 24px",
                borderRadius: 9999,
                border: active3DTab === "kaaba" ? "2px solid #fde047" : "1px solid rgba(255,255,255,0.15)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: active3DTab === "kaaba" ? "0 10px 30px rgba(234,179,8,0.35)" : "none",
                transform: active3DTab === "kaaba" ? "scale(1.04)" : "scale(1)",
                transition: "all 0.3s ease",
              }}
            >
              <span style={{ fontSize: 18 }}>🕋</span>
              <span>Holy Kaaba (Makkah)</span>
            </button>

            <button
              type="button"
              onClick={() => setActive3DTab("mosque")}
              style={{
                background: active3DTab === "mosque" ? "linear-gradient(135deg, #eab308, #ca8a04)" : "rgba(255,255,255,0.06)",
                color: active3DTab === "mosque" ? "#0f172a" : "#d1d5db",
                fontWeight: 900,
                fontSize: 14,
                padding: "12px 24px",
                borderRadius: 9999,
                border: active3DTab === "mosque" ? "2px solid #fde047" : "1px solid rgba(255,255,255,0.15)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: active3DTab === "mosque" ? "0 10px 30px rgba(234,179,8,0.35)" : "none",
                transform: active3DTab === "mosque" ? "scale(1.04)" : "scale(1)",
                transition: "all 0.3s ease",
              }}
            >
              <span style={{ fontSize: 18 }}>🕌</span>
              <span>Mosque Entrance Walkthrough</span>
            </button>
          </div>

          {/* 3D Render Canvas Container */}
          <div>
            {active3DTab === "kaaba" ? (
              <Kaaba3DExperience />
            ) : (
              <Mosque3DWalkthrough />
            )}
          </div>
        </div>
      </section>

      {/* ── PRAYER TIMES ── */}
      <section id="prayer-times" style={{ padding: "90px 24px", background: "#0f172a", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ color: "#eab308", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 4 }}>Salah Schedule</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, color: "#fff", margin: "12px 0 8px" }}>Daily Prayer Times</h2>
            <p style={{ color: "#9ca3af", fontSize: 13 }}>
              {Object.keys(prayerTimes).length ? "Live times for Pooler, GA · ISNA Calculation Method" : "⏳ Fetching prayer times..."}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
            {PRAYER_ORDER.map(name => {
              const isNext = name === nextPrayer;
              return (
                <div
                  key={name}
                  style={{
                    position: "relative",
                    borderRadius: 20,
                    padding: "26px 16px",
                    textAlign: "center",
                    background: isNext ? "#eab308" : "rgba(255,255,255,0.05)",
                    border: isNext ? "2px solid #fbbf24" : "1px solid rgba(255,255,255,0.1)",
                    transform: isNext ? "scale(1.06)" : "scale(1)",
                    transition: "all 0.3s ease",
                  }}
                  className={`${isNext ? "animate-pulse-glow z-10" : "hover:scale-105 hover:bg-white/10"}`}
                >
                  {isNext && (
                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#fff", color: "#0f172a", fontSize: 10, fontWeight: 900, padding: "3px 12px", borderRadius: 9999, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                      NEXT PRAYER ▶
                    </div>
                  )}
                  <div style={{ fontSize: 34, marginBottom: 8 }} className={isNext ? "animate-bounce" : ""}>
                    {PRAYER_ICONS[name]}
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: isNext ? "#0f172a" : "#d1d5db", marginBottom: 12, margin: "0 0 12px" }}>
                    {name}
                  </p>
                  <p style={{ fontSize: 11, color: isNext ? "#78350f" : "#6b7280", margin: "0 0 2px", fontWeight: 700 }}>Adhan</p>
                  <p style={{ fontWeight: 900, fontSize: 19, color: isNext ? "#0f172a" : "#fff", margin: "0 0 8px" }}>
                    {to12(prayerTimes[name])}
                  </p>
                  <p style={{ fontSize: 11, color: isNext ? "#78350f" : "#6b7280", margin: "0 0 2px", fontWeight: 700 }}>Iqamah</p>
                  <p style={{ fontWeight: 800, fontSize: 15, color: isNext ? "#0f172a" : "#eab308", margin: 0 }}>
                    {IQAMAH[name]}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Jumu'ah card */}
          <div
            style={{
              background: isFriday
                ? "linear-gradient(135deg, rgba(234,179,8,0.25), rgba(217,119,6,0.35), rgba(234,179,8,0.25))"
                : "rgba(234,179,8,0.12)",
              border: isFriday ? "2px solid #eab308" : "1px solid rgba(234,179,8,0.3)",
              borderRadius: 24,
              padding: "26px 32px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              position: "relative",
            }}
            className={isFriday ? "animate-pulse-glow shadow-2xl shadow-yellow-500/20" : ""}
          >
            {isFriday && (
              <div
                style={{
                  position: "absolute",
                  top: -13,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#eab308",
                  color: "#0f172a",
                  fontSize: 11,
                  fontWeight: 900,
                  padding: "4px 16px",
                  borderRadius: 9999,
                  letterSpacing: 1,
                  boxShadow: "0 4px 15px rgba(234,179,8,0.4)",
                }}
              >
                🌟 TODAY IS FRIDAY — JUMU'AH PRAYER TODAY 🌟
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 44 }} className={isFriday ? "animate-bounce" : ""}>
                🕌
              </span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={{ color: "#eab308", fontWeight: 900, fontSize: 20, margin: 0 }}>
                    Jumu'ah — Friday Prayer
                  </p>
                  {isFriday && (
                    <span style={{ background: "#4ade80", color: "#0f172a", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 9999 }}>
                      TODAY
                    </span>
                  )}
                </div>
                <p style={{ color: "#d1d5db", fontSize: 13, margin: "4px 0 0" }}>
                  Khutbah sermon begins promptly · Followed by 2 Rak'ah congregation
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
              {[
                ["Adhan", "2:00 PM", "#fff"],
                ["Khutbah & Iqamah", "2:30 PM", "#eab308"],
              ].map(([label, time, color]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px", fontWeight: 700, textTransform: "uppercase" }}>
                    {label}
                  </p>
                  <p style={{ fontWeight: 900, fontSize: 24, color, margin: 0, textShadow: isFriday ? "0 0 20px rgba(234,179,8,0.4)" : "none" }}>
                    {time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section id="events" style={{ padding: "80px 24px", background: "#f9fafb" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ color: "#eab308", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 4 }}>Community</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900, color: "#0f172a", margin: "12px 0 8px" }}>Announcements & Events</h2>
            <p style={{ color: "#6b7280", fontSize: 14 }}>Stay connected with our weekly programs, special events, and community gatherings.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {EVENTS.map(ev => (
              <div key={ev.title} style={{ background: "#fff", borderRadius: 20, border: "1px solid #f3f4f6", padding: 24, transition: "all 0.3s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", cursor: "pointer" }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${TAG_COLORS[ev.color]}`}>{ev.tag}</span>
                  <span style={{ fontSize: 24 }}>{ev.color === "gold" ? "✨" : ev.color === "green" ? "📖" : ev.color === "blue" ? "🎓" : ev.color === "purple" ? "🌸" : "🌟"}</span>
                </div>
                <h3 style={{ fontWeight: 800, color: "#0f172a", fontSize: 18, margin: "0 0 12px" }}>{ev.title}</h3>
                <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 4px" }}>📅 {ev.date}</p>
                <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>🕐 {ev.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ color: "#eab308", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 4 }}>What We Offer</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900, color: "#0f172a", margin: "12px 0 8px" }}>Community Services</h2>
            <p style={{ color: "#6b7280", fontSize: 14 }}>Comprehensive Islamic services for every member of your family and community.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {SERVICES.map(s => {
              const isMatrimonial = s.title.toLowerCase().includes("matrimonial") || s.link === "/nikah";
              return (
                <div
                  key={s.title}
                  onClick={() => {
                    if (s.link) navigate(s.link);
                  }}
                  style={{
                    background: isMatrimonial ? "linear-gradient(to bottom right, #0f172a, #1e293b)" : "#f9fafb",
                    borderRadius: 20,
                    border: isMatrimonial ? "2px solid #eab308" : "1px solid #f3f4f6",
                    padding: 28,
                    transition: "all 0.3s",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: isMatrimonial ? "0 10px 30px rgba(234,179,8,0.15)" : "none",
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    if (!isMatrimonial) {
                      e.currentTarget.style.background = "#0f172a";
                      e.currentTarget.style.boxShadow = "0 20px 40px rgba(15,23,42,0.2)";
                      Array.from(e.currentTarget.querySelectorAll("h3,p")).forEach(el => el.style.color = el.tagName === "H3" ? "#eab308" : "#9ca3af");
                    }
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    if (!isMatrimonial) {
                      e.currentTarget.style.background = "#f9fafb";
                      e.currentTarget.style.boxShadow = "none";
                      Array.from(e.currentTarget.querySelectorAll("h3")).forEach(el => el.style.color = "#0f172a");
                      Array.from(e.currentTarget.querySelectorAll("p")).forEach(el => el.style.color = "#6b7280");
                    }
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <span style={{ fontSize: 38 }}>{s.icon}</span>
                      {isMatrimonial && (
                        <span style={{ background: "rgba(234,179,8,0.2)", border: "1px solid #eab308", color: "#fde68a", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 9999, textTransform: "uppercase" }}>
                          Active Registry
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontWeight: 800, color: isMatrimonial ? "#eab308" : "#0f172a", fontSize: 19, margin: "0 0 10px", transition: "color 0.3s" }}>
                      {s.title}
                    </h3>
                    <p style={{ color: isMatrimonial ? "#d1d5db" : "#6b7280", fontSize: 14, lineHeight: 1.7, margin: 0, transition: "color 0.3s" }}>
                      {s.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: isMatrimonial ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.06)" }}>
                    {s.link ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(s.link);
                        }}
                        style={{
                          width: "100%",
                          background: "#eab308",
                          color: "#0f172a",
                          fontWeight: 800,
                          fontSize: 13,
                          padding: "10px 16px",
                          borderRadius: 12,
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          boxShadow: "0 4px 15px rgba(234,179,8,0.3)",
                        }}
                      >
                        <span>💍</span>
                        <span>Register & Submit Profile →</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 700, color: isMatrimonial ? "#eab308" : "#9ca3af", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        Contact Masjid Office →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DONATE BANNER ── */}
      <section style={{ padding: "64px 24px", background: "linear-gradient(135deg, #eab308, #fbbf24)", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900, color: "#0f172a", margin: "0 0 12px" }}>Support Your Masjid</h2>
        <p style={{ color: "#1e293b", fontSize: 16, maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7 }}>
          Your generous donations keep our doors open, our programs running, and our community thriving. Every dollar counts. Sadaqah Jariyah.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{ background: "#0f172a", color: "#fff", fontWeight: 800, padding: "14px 32px", borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 15 }}>
            💳 Donate Online
          </button>
          <button style={{ background: "rgba(255,255,255,0.4)", color: "#0f172a", fontWeight: 800, padding: "14px 32px", borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 15 }}>
            📦 Donate Zakat
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" style={{ background: "#060d1a", color: "#9ca3af" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <img src="/assets/logo.jpg" alt="Logo" style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #eab308", objectFit: "cover" }} />
              <div>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: 13, margin: 0 }}>Islamic Center</p>
                <p style={{ color: "#eab308", fontSize: 11, fontWeight: 700, margin: 0 }}>of Pooler</p>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
              Serving the Muslim community of Pooler, Georgia with faith, education, and compassion.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {["FB", "TW", "IG", "YT"].map(s => (
                <a key={s} href="#" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", color: "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, textDecoration: "none", transition: "all 0.2s" }}
                  onMouseOver={e => { e.currentTarget.style.background = "#eab308"; e.currentTarget.style.color = "#0f172a"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#9ca3af"; }}>
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: "#fff", fontWeight: 800, marginBottom: 16, fontSize: 15 }}>Quick Links</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "About Us", link: "#about" },
                { label: "Prayer Times", link: "#prayer-times" },
                { label: "Matrimonial & Nikah", route: "/nikah" },
                { label: "Community Services", link: "#services" },
                { label: "Upcoming Events", link: "#events" },
                { label: "Member Portal", route: "/login" },
                { label: "Donate", link: "#contact" },
              ].map(l => (
                <li key={l.label}>
                  {l.route ? (
                    <button
                      onClick={() => navigate(l.route)}
                      style={{ background: "none", border: "none", padding: 0, color: "#6b7280", cursor: "pointer", fontSize: 13, transition: "color 0.2s", textAlign: "left" }}
                      onMouseOver={e => e.currentTarget.style.color = "#eab308"}
                      onMouseOut={e => e.currentTarget.style.color = "#6b7280"}
                    >
                      › {l.label}
                    </button>
                  ) : (
                    <a
                      href={l.link}
                      style={{ color: "#6b7280", textDecoration: "none", fontSize: 13, transition: "color 0.2s" }}
                      onMouseOver={e => e.currentTarget.style.color = "#eab308"}
                      onMouseOut={e => e.currentTarget.style.color = "#6b7280"}
                    >
                      › {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: "#fff", fontWeight: 800, marginBottom: 16, fontSize: 15 }}>Contact Us</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
              <p style={{ margin: 0 }}>📍 123 Pooler Parkway, Pooler, GA 31322</p>
              <p style={{ margin: 0 }}>📞 <a href="tel:+19125550100" style={{ color: "#9ca3af", textDecoration: "none" }}>(912) 555-0100</a></p>
              <p style={{ margin: 0 }}>✉️ <a href="mailto:info@icpooler.org" style={{ color: "#9ca3af", textDecoration: "none" }}>info@icpooler.org</a></p>
              <p style={{ margin: 0 }}>🕌 Open daily for all 5 prayers</p>
            </div>
          </div>

          <div>
            <h4 style={{ color: "#fff", fontWeight: 800, marginBottom: 16, fontSize: 15 }}>Newsletter</h4>
            <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>Stay updated with announcements, events, and prayer time changes.</p>
            {subscribed ? (
              <div style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 12, padding: 16, color: "#4ade80", fontSize: 13 }}>
                ✅ JazakAllah Khair! You're subscribed.
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); if (email) setSubscribed(true); }} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 16px", color: "#fff", fontSize: 13, outline: "none" }} />
                <button type="submit"
                  style={{ background: "#eab308", color: "#0f172a", fontWeight: 800, padding: "10px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14 }}>
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 24px", textAlign: "center", fontSize: 12, color: "#4b5563" }}>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} Islamic Center of Pooler. All rights reserved.</p>
          <p style={{ margin: "4px 0 0" }}>Built with 💛 for the Muslim community of Pooler, Georgia.</p>
        </div>
      </footer>
    </div>
  );
};

export default IslamicCenterHome;
