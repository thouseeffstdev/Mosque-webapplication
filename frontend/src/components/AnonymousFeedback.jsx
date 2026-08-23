import React, { useState } from "react";

const CATEGORIES = [
  { id: "facilities", label: "🕌 Facilities & Cleanliness" },
  { id: "prayers", label: "⏰ Prayer Services & Jumu'ah" },
  { id: "education", label: "📖 Classes & Youth Programs" },
  { id: "events", label: "📅 Community Events & Iftaar" },
  { id: "management", label: "💡 General Idea / Suggestion" },
  { id: "other", label: "💬 Other Feedback" },
];

const RATINGS = [
  { emoji: "😞", label: "Needs Work" },
  { emoji: "😐", label: "Fair" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😊", label: "Great" },
  { emoji: "⭐", label: "Excellent" },
];

const AnonymousFeedback = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("facilities");
  const [rating, setRating] = useState(4); // Default to 'Great'
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Please enter your feedback message.");
      return;
    }

    setSubmitting(true);
    // Simulate anonymous submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        // Reset after 3 seconds or keep modal open with confirmation
      }, 3000);
    }, 800);
  };

  const handleClose = () => {
    setIsOpen(false);
    // If submitted, reset state after closing
    if (submitted) {
      setTimeout(() => {
        setSubmitted(false);
        setMessage("");
        setSubject("");
        setRating(4);
      }, 300);
    }
  };

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black px-4 py-3 rounded-full shadow-2xl shadow-black/50 border-2 border-yellow-300 transform hover:scale-105 transition-all duration-300 cursor-pointer"
          title="Submit Anonymous Feedback"
        >
          <span className="text-xl animate-bounce">💬</span>
          <span className="text-xs sm:text-sm tracking-tight font-bold hidden sm:inline-block">
            Anonymous Feedback
          </span>
        </button>
      </div>

      {/* ── Modal Overlay ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
          <div
            className="relative w-full max-w-lg bg-slate-900 border border-yellow-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-5 right-5 text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
            >
              ✕
            </button>

            {submitted ? (
              /* ── Success Screen ── */
              <div className="text-center py-8 animate-fade-in">
                <div className="w-16 h-16 bg-yellow-500/10 border-2 border-yellow-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  🤲
                </div>
                <h3 className="text-2xl font-black text-white font-outfit mb-2">
                  JazakAllah Khair!
                </h3>
                <p className="text-gray-300 text-sm max-w-sm mx-auto leading-relaxed mb-6">
                  Your feedback has been submitted anonymously. The Islamic Center committee regularly reviews all suggestions to improve our community services.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-6 py-2.5 rounded-full text-xs transition-all shadow-md"
                >
                  Close Window
                </button>
              </div>
            ) : (
              /* ── Feedback Form ── */
              <div>
                {/* Header */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <span>🔒</span>
                    <span>100% Anonymous & Confidential</span>
                  </div>
                  <h3 className="text-2xl font-black text-white font-outfit">
                    Community Suggestion Box
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Your voice matters. No name, email, or IP address is ever stored.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Feedback Topic / Area
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400 transition-colors"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Your General Experience
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {RATINGS.map((r, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setRating(index)}
                          className={`py-2 px-1 rounded-xl border text-center transition-all ${
                            rating === index
                              ? "bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow"
                              : "bg-slate-950 border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          <span className="text-xl block">{r.emoji}</span>
                          <span className="text-[10px] font-medium block mt-0.5">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Subject */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Subject <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Friday parking, Weekend School idea, Sound system"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>

                  {/* Feedback Message */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Your Feedback / Idea *
                    </label>
                    <textarea
                      rows="4"
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please share what went well or how the masjid leadership can improve our community services..."
                      className="w-full bg-slate-950 border border-white/15 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-yellow-500/20 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>{submitting ? "Sending Anonymously..." : "🚀 Submit Anonymous Feedback"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AnonymousFeedback;
