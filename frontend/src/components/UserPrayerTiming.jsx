import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axiosInstance';
import { getUserData } from '../utils/storageHelper';
import useToast from '../hooks/useToast';

const MASJID_ADDRESS = "200 Governor Treutlen Dr Suite 9, Pooler, GA 31322";

const PRAYER_LABELS = {
  fajr:      "Fajr",
  dhuhr:     "Dhuhr",
  asr:       "Asr",
  maghrib:   "Maghrib",
  isha:      "Isha",
  jummah:    "Jummah",
  eidUlFitr: "Eid-Ul-Fitr",
  eidUlAdha: "Eid-Ul-Adha"
};

const PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const getPrayerIcon = (prayer) => {
  switch (prayer.toLowerCase()) {
    case 'fajr':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
        </svg>
      );
    case 'dhuhr':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2.5" />
          <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95l-1.41-1.41M6.46 6.46L5.05 5.05m12.02 0l-1.41 1.41M6.46 17.54l-1.41 1.41" />
        </svg>
      );
    case 'asr':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95l-1.41-1.41M6.46 6.46L5.05 5.05m12.02 0l-1.41 1.41M6.46 17.54l-1.41 1.41" />
        </svg>
      );
    case 'maghrib':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
        </svg>
      );
    case 'isha':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    case 'jummah':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
  }
};

/**
 * Calculate which prayer is next and how long until it starts.
 */
const calculateNextPrayer = (prayerTimes) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const minutesMap = {};
  PRAYER_ORDER.forEach(prayer => {
    const time = prayerTimes[prayer];
    if (time) {
      const [h, m] = time.split(':').map(Number);
      minutesMap[prayer] = h * 60 + m;
    }
  });

  let nextName = null;
  let nextMinutes = null;

  for (const prayer of PRAYER_ORDER) {
    if (minutesMap[prayer] > currentMinutes) {
      nextName    = prayer;
      nextMinutes = minutesMap[prayer];
      break;
    }
  }

  // All prayers done today — next is tomorrow's Fajr
  if (!nextName) {
    nextName    = 'fajr';
    nextMinutes = minutesMap.fajr + 24 * 60;
  }

  const diff    = nextMinutes - currentMinutes;
  const hours   = Math.floor(diff / 60);
  const minutes = diff % 60;

  return {
    name:      PRAYER_LABELS[nextName],
    key:       nextName,
    timeLeft:  hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  };
};

const UserPrayerTiming = ({ masjidId }) => {
  const [timings, setTimings]         = useState(null);
  const [nextPrayer, setNextPrayer]   = useState(null);
  const [source, setSource]           = useState("aladhan");
  const [loading, setLoading]         = useState(true);
  const { userToken }                 = getUserData();
  const { showToast }                 = useToast();

  const fetchTimings = useCallback(async () => {
    try {
      const res = await axios.get(`/auth/getPrayerTimings/${masjidId}`, {
        headers: userToken ? { Authorization: `Bearer ${userToken}` } : {}
      });
      if (res.data.success) {
        const t = res.data.prayerTiming.timings;
        setTimings(t);
        setSource(res.data.source || "aladhan");
        setNextPrayer(calculateNextPrayer(t));
      }
    } catch (err) {
      showToast("Failed to fetch prayer timings", "error");
    } finally {
      setLoading(false);
    }
  }, [masjidId, userToken, showToast]);

  useEffect(() => {
    if (!masjidId) { setLoading(false); return; }
    fetchTimings();
    const interval = setInterval(() => {
      setTimings(prev => {
        if (prev) setNextPrayer(calculateNextPrayer(prev));
        return prev;
      });
    }, 60_000);
    return () => clearInterval(interval);
  }, [fetchTimings, masjidId]);

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Loading prayer times…</p>
      </div>
    );
  }

  if (!timings) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Today's Prayer Times</h3>
            <p className="text-sm text-slate-500">Prayer timings not available yet</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-600">Prayer timings are not available yet.</p>
          <p className="text-slate-500 text-sm mt-1">Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Today's Prayer Times</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-xs text-slate-500">{MASJID_ADDRESS}</p>
            </div>
            {/* Source badge */}
            {source === "override" ? (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                Jama'ah times set by admin
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
                Auto-calculated for your location
              </span>
            )}
          </div>
        </div>

        {/* Next Prayer Pill */}
        {nextPrayer && (
          <div className="bg-indigo-50 border border-indigo-100 px-4 py-2.5 rounded-xl text-center shrink-0">
            <p className="text-xs text-indigo-500 font-medium">Next Prayer</p>
            <p className="text-sm font-bold text-indigo-700">{nextPrayer.name}</p>
            <p className="text-xs text-indigo-400">{nextPrayer.timeLeft} remaining</p>
          </div>
        )}
      </div>

      {/* ── Prayer Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Object.entries(timings).map(([prayer, time]) => {
          const isNext = nextPrayer?.key === prayer;
          return (
            <div
              key={prayer}
              className={`rounded-xl p-3 sm:p-4 text-center border transition-all duration-300 transform hover:scale-105 ${
                isNext
                  ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400 shadow-md'
                  : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  {getPrayerIcon(prayer)}
                </div>
                <h4 className="text-xs sm:text-sm font-medium text-slate-600">{PRAYER_LABELS[prayer]}</h4>
                <p className={`text-base sm:text-lg font-bold ${isNext ? 'text-indigo-700' : 'text-slate-900'}`}>
                  {time || "—"}
                </p>
                {isNext && (
                  <span className="text-xs bg-indigo-200 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">Next</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 text-xs text-slate-400 text-center">
        Updated: {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </div>
    </div>
  );
};

export default UserPrayerTiming;