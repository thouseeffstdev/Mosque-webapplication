import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axiosInstance';
import { getMasjidData } from '../utils/storageHelper';
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

const EMPTY_TIMINGS = {
  fajr: '', dhuhr: '', asr: '', maghrib: '',
  isha: '', jummah: '', eidUlFitr: '', eidUlAdha: ''
};

const getPrayerIcon = (prayer) => {
  switch (prayer.toLowerCase()) {
    case 'fajr':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
        </svg>
      );
    case 'dhuhr':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2.5" />
          <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95l-1.41-1.41M6.46 6.46L5.05 5.05m12.02 0l-1.41 1.41M6.46 17.54l-1.41 1.41" />
        </svg>
      );
    case 'asr':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95l-1.41-1.41M6.46 6.46L5.05 5.05m12.02 0l-1.41 1.41M6.46 17.54l-1.41 1.41" />
        </svg>
      );
    case 'maghrib':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
        </svg>
      );
    case 'isha':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    case 'jummah':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
  }
};

const PrayerTiming = () => {
  const [timings, setTimings]           = useState(EMPTY_TIMINGS);
  const [aladhanTimings, setAladhan]    = useState(EMPTY_TIMINGS);
  const [isOverridden, setIsOverridden] = useState(false);
  const [isEditing, setIsEditing]       = useState(false);
  const [formTimings, setFormTimings]   = useState(EMPTY_TIMINGS);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [resetting, setResetting]       = useState(false);
  const { masjidId, masjidtoken }       = getMasjidData();
  const { showToast }                   = useToast();

  // Load current timings (override or Aladhan auto)
  const fetchCurrentTimings = useCallback(async () => {
    try {
      const res = await axios.get(`/auth/getPrayerTimings/${masjidId}`, {
        headers: { Authorization: `Bearer ${masjidtoken}` }
      });
      if (res.data.success) {
        setTimings(res.data.prayerTiming.timings);
        setIsOverridden(res.data.source === "override");
      }
    } catch (err) {
      showToast("Failed to fetch prayer timings", "error");
    }
  }, [masjidId, masjidtoken, showToast]);

  // Load live Aladhan times (always displayed for reference)
  const fetchAladhanTimings = useCallback(async () => {
    try {
      const res = await axios.get(`/auth/getAladhanTimings/${masjidId}`, {
        headers: { Authorization: `Bearer ${masjidtoken}` }
      });
      if (res.data.success) {
        setAladhan(res.data.timings);
      }
    } catch (err) {
      // Non-critical — don't show error toast
      console.warn("Could not load Aladhan times:", err.message);
    }
  }, [masjidId, masjidtoken]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchCurrentTimings(), fetchAladhanTimings()]);
      setLoading(false);
    };
    load();
  }, [fetchCurrentTimings, fetchAladhanTimings]);

  // Open edit form pre-filled with current times
  const handleEditClick = () => {
    setFormTimings({ ...timings });
    setIsEditing(true);
  };

  const handleFormChange = (prayer, value) => {
    setFormTimings(prev => ({ ...prev, [prayer]: value }));
  };

  // Pre-fill form with Aladhan auto-calculated times
  const handleFillFromAladhan = () => {
    setFormTimings({ ...aladhanTimings });
    showToast("Form filled with auto-calculated times. Click Save to apply.", "info");
  };

  // Save admin override
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(
        `/auth/updatePrayerTimings/${masjidId}`,
        { timings: formTimings },
        { headers: { Authorization: `Bearer ${masjidtoken}` } }
      );
      if (res.data.success) {
        showToast("Prayer timings saved successfully!", "success");
        setIsEditing(false);
        await fetchCurrentTimings();
      }
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save prayer timings", "error");
    } finally {
      setSaving(false);
    }
  };

  // Reset to auto-calculated (delete override)
  const handleReset = async () => {
    if (!window.confirm("Reset to auto-calculated times? Your custom times will be removed.")) return;
    setResetting(true);
    try {
      await axios.delete(`/auth/deletePrayerTimings/${masjidId}`, {
        headers: { Authorization: `Bearer ${masjidtoken}` }
      });
      showToast("Reset to auto-calculated times!", "success");
      await fetchCurrentTimings();
    } catch (err) {
      showToast("Failed to reset prayer timings", "error");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-teal-800/50 backdrop-blur-sm rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400 mx-auto mb-3"></div>
        <p className="text-amber-200">Loading prayer times…</p>
      </div>
    );
  }

  return (
    <div className="bg-teal-800/50 backdrop-blur-sm rounded-xl p-6 shadow-md">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Prayer Timings</h2>
          <div className="flex items-center gap-2 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-amber-300 text-sm">{MASJID_ADDRESS}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isOverridden ? (
            <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
              Custom Override Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-teal-400 inline-block"></span>
              Auto-Calculated (Aladhan)
            </span>
          )}
        </div>
      </div>

      {/* ── Edit Form ──────────────────────────────────────── */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              type="button"
              onClick={handleFillFromAladhan}
              className="text-xs bg-teal-700/60 hover:bg-teal-700 text-teal-200 border border-teal-500/40 px-3 py-1.5 rounded-lg transition-all duration-200"
            >
              ⚡ Fill from Auto-Calculated
            </button>
            <p className="text-xs text-amber-200/70">or manually enter Jama'ah times below</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(formTimings).map(([prayer, time]) => (
              <div key={prayer} className="bg-teal-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-teal-800/50 rounded-full">{getPrayerIcon(prayer)}</div>
                  <label className="text-amber-200 text-sm font-medium">{PRAYER_LABELS[prayer]}</label>
                </div>
                <input
                  type="time"
                  name={prayer}
                  value={time}
                  onChange={(e) => handleFormChange(prayer, e.target.value)}
                  className="w-full px-3 py-2 bg-teal-800/60 text-white border border-teal-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  required
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2 text-sm text-amber-200 border border-teal-600 rounded-lg hover:bg-teal-700/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg transition-all duration-300 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Timings"}
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* ── Read-only Timing Cards ──────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {Object.entries(timings).map(([prayer, time]) => (
              <div key={prayer} className="bg-teal-900/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="p-1.5 bg-teal-800/50 rounded-full">{getPrayerIcon(prayer)}</div>
                  <span className="text-amber-200 text-xs font-medium">{PRAYER_LABELS[prayer]}</span>
                </div>
                <p className="text-white text-lg font-bold">{time || "—"}</p>
              </div>
            ))}
          </div>

          {/* ── Auto-Calculated Reference ───────────────────── */}
          {isOverridden && (
            <div className="bg-teal-900/30 border border-teal-700/40 rounded-lg p-4 mb-5">
              <p className="text-xs text-amber-300 font-semibold mb-3 flex items-center gap-1.5">
                <span>⚡</span> Auto-Calculated Reference (Aladhan · Pooler, GA)
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
                {["fajr","dhuhr","asr","maghrib","isha"].map(p => (
                  <div key={p} className="bg-teal-800/30 rounded-lg p-2">
                    <p className="text-xs text-teal-300 capitalize">{PRAYER_LABELS[p]}</p>
                    <p className="text-white text-sm font-semibold mt-0.5">{aladhanTimings[p] || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Action Buttons ──────────────────────────────── */}
          <div className="flex flex-wrap gap-3">
            <button
              id="edit-prayer-timings-btn"
              onClick={handleEditClick}
              className="px-5 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-300"
            >
              {isOverridden ? "Edit Custom Timings" : "Set Custom Timings"}
            </button>
            {isOverridden && (
              <button
                id="reset-prayer-timings-btn"
                onClick={handleReset}
                disabled={resetting}
                className="px-5 py-2 text-sm border border-red-500/40 text-red-300 hover:bg-red-900/30 rounded-lg transition-all duration-300 disabled:opacity-60"
              >
                {resetting ? "Resetting…" : "↩ Reset to Auto"}
              </button>
            )}
          </div>

          <div className="mt-5 text-xs text-amber-200/50">
            Last updated: {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </>
      )}
    </div>
  );
};

export default PrayerTiming;