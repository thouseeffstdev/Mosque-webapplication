const PrayerTiming = require("../models/PrayerTiming");

// Fixed masjid location — 200 Governor Treutlen Dr Suite 9, Pooler, GA 31322
const MASJID_LATITUDE  = 32.1157;
const MASJID_LONGITUDE = -81.2459;
const MASJID_ADDRESS   = "200 Governor Treutlen Dr Suite 9, Pooler, GA 31322";
// Method 2 = ISNA (Islamic Society of North America) — standard for North America
const ALADHAN_METHOD   = 2;

/**
 * Helper: fetch today's prayer times from Aladhan API using the masjid's fixed coordinates.
 * Returns a timings object like { fajr, sunrise, dhuhr, asr, maghrib, isha }
 */
const fetchAladhanTimings = async () => {
  const url = `https://api.aladhan.com/v1/timings?latitude=${MASJID_LATITUDE}&longitude=${MASJID_LONGITUDE}&method=${ALADHAN_METHOD}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch from Aladhan API");
  const data = await res.json();
  const t = data.data.timings;

  // Map Aladhan keys → our schema keys, strip seconds from HH:MM:SS → HH:MM
  const stripSeconds = (time) => time.slice(0, 5);

  return {
    fajr:      stripSeconds(t.Fajr),
    dhuhr:     stripSeconds(t.Dhuhr),
    asr:       stripSeconds(t.Asr),
    maghrib:   stripSeconds(t.Maghrib),
    isha:      stripSeconds(t.Isha),
    // Jummah and Eid times are not provided by Aladhan — default to Dhuhr time for Jummah
    jummah:    stripSeconds(t.Dhuhr),
    eidUlFitr: "08:00",
    eidUlAdha: "08:00"
  };
};

// ─────────────────────────────────────────────────────────────────
// GET /auth/getAladhanTimings/:masjidId
// Returns live auto-calculated Aladhan times for the fixed masjid location.
// Any logged-in user or admin can call this.
// ─────────────────────────────────────────────────────────────────
exports.getAladhanTimings = async (req, res) => {
  try {
    const timings = await fetchAladhanTimings();
    res.status(200).json({
      success: true,
      timings,
      source: "aladhan",
      address: MASJID_ADDRESS,
      latitude: MASJID_LATITUDE,
      longitude: MASJID_LONGITUDE
    });
  } catch (error) {
    console.error("Error fetching Aladhan timings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch auto-calculated prayer times"
    });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /auth/getPrayerTimings/:masjidId
// If an admin override exists in DB → return that.
// Otherwise → auto-fetch from Aladhan and return.
// ─────────────────────────────────────────────────────────────────
exports.getPrayerTimings = async (req, res) => {
  try {
    const { masjidId } = req.params;
    const prayerTiming = await PrayerTiming.findOne({ masjidId });

    // Admin has saved custom override times → return them
    if (prayerTiming && prayerTiming.isOverridden) {
      return res.status(200).json({
        success: true,
        prayerTiming,
        source: "override",
        address: MASJID_ADDRESS
      });
    }

    // No override → auto-calculate from Aladhan
    try {
      const aladhanTimings = await fetchAladhanTimings();
      return res.status(200).json({
        success: true,
        prayerTiming: {
          masjidId,
          timings: aladhanTimings,
          isOverridden: false,
          lastUpdated: new Date()
        },
        source: "aladhan",
        address: MASJID_ADDRESS
      });
    } catch (aladhanError) {
      // Aladhan unreachable — return whatever is in DB (even if not overridden)
      if (prayerTiming) {
        return res.status(200).json({
          success: true,
          prayerTiming,
          source: "db_fallback",
          address: MASJID_ADDRESS
        });
      }
      return res.status(404).json({
        success: false,
        error: "Prayer timings not available"
      });
    }
  } catch (error) {
    console.error("Error getting prayer timings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get prayer timings"
    });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUT /auth/updatePrayerTimings/:masjidId
// Admin saves custom (override) prayer times.
// Sets isOverridden = true so future GET returns these times.
// ─────────────────────────────────────────────────────────────────
exports.updatePrayerTimings = async (req, res) => {
  try {
    const { masjidId } = req.params;
    const { timings } = req.body;

    // Validate all required timings are present
    const requiredTimings = ["fajr", "dhuhr", "asr", "maghrib", "isha", "jummah", "eidUlFitr", "eidUlAdha"];
    const missingTimings = requiredTimings.filter(t => !timings[t]);

    if (missingTimings.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required timings: ${missingTimings.join(", ")}`
      });
    }

    const prayerTiming = await PrayerTiming.findOneAndUpdate(
      { masjidId },
      {
        timings,
        isOverridden: true,
        lastUpdated: new Date()
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Prayer timings updated successfully",
      prayerTiming
    });
  } catch (error) {
    console.error("Error updating prayer timings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update prayer timings"
    });
  }
};

// ─────────────────────────────────────────────────────────────────
// DELETE /auth/deletePrayerTimings/:masjidId
// Admin resets their override — removes the custom times from DB.
// Future GETs will auto-fall back to Aladhan.
// ─────────────────────────────────────────────────────────────────
exports.deletePrayerTimings = async (req, res) => {
  try {
    const { masjidId } = req.params;
    await PrayerTiming.findOneAndDelete({ masjidId });

    res.status(200).json({
      success: true,
      message: "Prayer timing override removed. Times will now be auto-calculated."
    });
  } catch (error) {
    console.error("Error deleting prayer timings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset prayer timings"
    });
  }
};