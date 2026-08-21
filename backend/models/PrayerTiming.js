const mongoose = require("mongoose");

const timeValidator = {
  match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time in HH:MM format"]
};

const prayerTimingSchema = new mongoose.Schema({
  masjidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Masjids",
    required: true,
    unique: true
  },
  // isOverridden: true means the admin has manually saved custom times
  // isOverridden: false means we fall back to Aladhan auto-calculated times
  isOverridden: {
    type: Boolean,
    default: false
  },
  timings: {
    fajr:      { type: String, ...timeValidator },
    dhuhr:     { type: String, ...timeValidator },
    asr:       { type: String, ...timeValidator },
    maghrib:   { type: String, ...timeValidator },
    isha:      { type: String, ...timeValidator },
    jummah:    { type: String, ...timeValidator },
    eidUlFitr: { type: String, ...timeValidator },
    eidUlAdha: { type: String, ...timeValidator }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("PrayerTiming", prayerTimingSchema);
 