import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const MatrimonialService = () => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    // Applicant Info
    fullName: "",
    gender: "brother", // "brother" | "sister"
    age: "",
    dob: "",
    height: "",
    maritalStatus: "never_married",
    ethnicity: "",
    citizenship: "US Citizen",
    city: "Pooler",
    state: "GA",

    // Education & Career
    education: "Bachelor's Degree",
    profession: "",
    employer: "",

    // Religious Practice
    salahFrequency: "always_on_time",
    religiousValues: "",
    islamicBackground: "",

    // Partner Expectations
    partnerAgeMin: "",
    partnerAgeMax: "",
    partnerQualities: "",
    willingToRelocate: "negotiable",

    // Wali / Guardian / Contact Info
    waliName: "",
    waliRelation: "Father",
    waliPhone: "",
    waliEmail: "",
    applicantPhone: "",
    applicantEmail: "",
    preferredContactMethod: "wali_phone",

    // Bio & Notes
    bio: "",
    additionalNotes: "",
    agreedToTerms: false,
  });

  // Photos State (up to 5 photos)
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle Photo Selection
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotoError("");

    if (photos.length + files.length > 5) {
      setPhotoError("You can upload a maximum of 5 photos.");
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setPhotoError("Only image files (JPG, PNG, WebP) are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError("Each image must be under 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos((prev) => {
          if (prev.length >= 5) return prev;
          return [...prev, { file, previewUrl: reader.result, name: file.name }];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      alert("Please confirm that all information is truthful and you agree to the Islamic Center matrimonial guidelines.");
      return;
    }
    if (photos.length === 0) {
      if (!window.confirm("You have not uploaded any photos. Would you like to submit without photos?")) {
        return;
      }
    }

    setSubmitting(true);
    // Simulate backend submission & generate a confirmation application ID
    setTimeout(() => {
      const generatedId = "ICP-NIKAH-" + Math.floor(100000 + Math.random() * 900000);
      setApplicationId(generatedId);
      setSubmitting(false);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-white/10 py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3 group">
            <img
              src="/assets/logo.jpg"
              alt="Logo"
              className="w-10 h-10 rounded-full border-2 border-yellow-400 object-cover group-hover:scale-105 transition-transform"
            />
            <div>
              <p className="text-white font-black text-sm leading-tight">Islamic Center of Pooler</p>
              <p className="text-yellow-400 font-semibold text-xs leading-tight">Matrimonial & Nikah Services</p>
            </div>
          </Link>

          <Link
            to="/home"
            className="text-xs font-semibold text-gray-400 hover:text-yellow-400 transition-colors flex items-center gap-1.5"
          >
            <span>← Back to Main Site</span>
          </Link>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {submitted ? (
          /* ── SUCCESS CONFIRMATION ── */
          <div className="bg-slate-900 border border-yellow-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl animate-fade-in">
            <div className="w-20 h-20 bg-yellow-500/10 border-2 border-yellow-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              💍
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-400 bg-yellow-400/10 px-4 py-1.5 rounded-full border border-yellow-400/20">
              Application Submitted Successfully
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3 font-outfit">
              JazakAllah Khair, {formData.fullName}!
            </h1>
            <p className="text-gray-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-6">
              Your confidential Nikah & Matrimonial profile has been safely received by the{" "}
              <strong className="text-yellow-400">Islamic Center of Pooler Matrimonial Board</strong>.
            </p>

            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-6 max-w-md mx-auto mb-8 text-left space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Reference ID:</span>
                <span className="font-mono font-bold text-yellow-400">{applicationId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Applicant:</span>
                <span className="text-white font-semibold">{formData.fullName} ({formData.gender === "brother" ? "Brother" : "Sister"})</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Contact / Wali:</span>
                <span className="text-white font-semibold">{formData.waliName || formData.fullName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Photos Attached:</span>
                <span className="text-white font-semibold">{photos.length} uploaded</span>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 max-w-xl mx-auto text-left text-xs text-yellow-200/90 leading-relaxed mb-8">
              <strong>🕌 Next Steps & Islamic Etiquette:</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1.5 text-gray-300">
                <li>The IC Pooler Matrimonial Committee reviews all submissions with strict confidentiality.</li>
                <li>When a potential match meeting the stated criteria is found, our committee will reach out to the designated Wali/Guardian.</li>
                <li>All meetings and initial introductions are conducted in accordance with Islamic guidelines.</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setPhotos([]);
                  setFormData((prev) => ({ ...prev, fullName: "", age: "", bio: "" }));
                }}
                className="px-6 py-3 rounded-full text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all"
              >
                Submit Another Application
              </button>
              <button
                onClick={() => navigate("/home")}
                className="px-8 py-3 rounded-full text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-slate-950 transition-all shadow-lg shadow-yellow-500/20"
              >
                Return to Home
              </button>
            </div>
          </div>
        ) : (
          /* ── APPLICATION FORM ── */
          <div>
            {/* Hero Header */}
            <div className="text-center mb-10">
              <span className="text-yellow-400 font-bold text-xs uppercase tracking-widest bg-yellow-400/10 px-4 py-1.5 rounded-full border border-yellow-400/20">
                Confidential Matrimonial Service
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white mt-4 mb-4 font-outfit">
                Nikah & Matrimonial <span className="text-yellow-400">Registry</span>
              </h1>
              <p className="text-yellow-300/90 italic text-sm sm:text-base max-w-2xl mx-auto mb-3">
                “And among His signs is that He created for you spouses from among yourselves, that you may find tranquility in them; and He placed between you affection and mercy.”
                <span className="block text-xs text-yellow-400/70 mt-1 not-italic">— Surah Ar-Rum (30:21)</span>
              </p>
              <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto">
                Facilitating blessed marriages for the Pooler and Greater Savannah Muslim community under Islamic principles, privacy, and family involvement.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* ── SECTION 1: APPLICANT DETAILS ── */}
              <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <span className="text-2xl">👤</span>
                  <div>
                    <h2 className="text-lg font-bold text-white">1. Personal Details</h2>
                    <p className="text-xs text-gray-400">Basic information about the candidate</p>
                  </div>
                </div>

                {/* Brother or Sister Selector */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-300 mb-2">Candidate Is *</label>
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: "brother" })}
                      className={`py-3.5 px-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        formData.gender === "brother"
                          ? "bg-yellow-500 text-slate-950 border-yellow-400 shadow-lg shadow-yellow-500/20"
                          : "bg-slate-800/80 text-gray-300 border-white/10 hover:border-white/30"
                      }`}
                    >
                      <span>🧔 Brother (Groom)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: "sister" })}
                      className={`py-3.5 px-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        formData.gender === "sister"
                          ? "bg-yellow-500 text-slate-950 border-yellow-400 shadow-lg shadow-yellow-500/20"
                          : "bg-slate-800/80 text-gray-300 border-white/10 hover:border-white/30"
                      }`}
                    >
                      <span>🧕 Sister (Bride)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Candidate Full Name *</label>
                    <input
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Bilal Ahmed"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Age / Date of Birth *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        name="age"
                        type="number"
                        min="18"
                        max="80"
                        required
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Age (e.g. 27)"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                      />
                      <input
                        name="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Height (e.g. 5'10" / 178 cm) *</label>
                    <input
                      name="height"
                      type="text"
                      required
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="5 ft 10 in"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Marital Status *</label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    >
                      <option value="never_married">Never Married (Single)</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                      <option value="annulled">Annulled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Ethnicity / Origin</label>
                    <input
                      name="ethnicity"
                      type="text"
                      value={formData.ethnicity}
                      onChange={handleChange}
                      placeholder="e.g. Arab / South Asian / African-American"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Citizenship / Legal Status</label>
                    <input
                      name="citizenship"
                      type="text"
                      value={formData.citizenship}
                      onChange={handleChange}
                      placeholder="US Citizen / Permanent Resident / Other"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Current City *</label>
                    <input
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Pooler / Savannah"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">State *</label>
                    <input
                      name="state"
                      type="text"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="GA"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: EDUCATION & PROFESSION ── */}
              <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <span className="text-2xl">🎓</span>
                  <div>
                    <h2 className="text-lg font-bold text-white">2. Education & Profession</h2>
                    <p className="text-xs text-gray-400">Academic background and career</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Education Level *</label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    >
                      <option value="High School">High School</option>
                      <option value="Associate Degree">Associate Degree</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                      <option value="Doctorate / PhD / MD">Doctorate / PhD / MD</option>
                      <option value="Islamic Scholarship (Alim/Alimah)">Islamic Scholarship (Alim/Alimah)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Profession / Job Title *</label>
                    <input
                      name="profession"
                      type="text"
                      required
                      value={formData.profession}
                      onChange={handleChange}
                      placeholder="e.g. Software Engineer, Teacher"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Employer / Industry</label>
                    <input
                      name="employer"
                      type="text"
                      value={formData.employer}
                      onChange={handleChange}
                      placeholder="Healthcare / Tech / Education"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* ── SECTION 3: RELIGIOUS VALUES ── */}
              <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <span className="text-2xl">🕌</span>
                  <div>
                    <h2 className="text-lg font-bold text-white">3. Religious Practice & Values</h2>
                    <p className="text-xs text-gray-400">Spiritual lifestyle and commitment</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Daily Salah Practice *</label>
                    <select
                      name="salahFrequency"
                      value={formData.salahFrequency}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    >
                      <option value="always_on_time">Always 5 times daily on time</option>
                      <option value="regularly">Regularly, working towards 5</option>
                      <option value="friday_and_occasional">Jumu'ah & occasional daily</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Religious Practice / Lifestyle</label>
                    <input
                      name="religiousValues"
                      type="text"
                      value={formData.religiousValues}
                      onChange={handleChange}
                      placeholder="e.g. Strict Halal only, attends halaqahs, modesty"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* ── SECTION 4: 5 PHOTOS UPLOAD ── */}
              <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📸</span>
                    <div>
                      <h2 className="text-lg font-bold text-white">4. Upload Photos (Up to 5 Photos)</h2>
                      <p className="text-xs text-gray-400">Respectful, recent front-facing photographs</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/30">
                    {photos.length} / 5 Added
                  </span>
                </div>

                {/* Upload Zone */}
                {photos.length < 5 && (
                  <div className="mb-6">
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-yellow-500/40 hover:border-yellow-400 rounded-2xl cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        <span className="text-3xl mb-2">📁</span>
                        <p className="text-xs sm:text-sm font-semibold text-gray-200">
                          <span className="text-yellow-400">Click to browse</span> or drag & drop photos here
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1">PNG, JPG, or WebP (Max 5MB each)</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {photoError && (
                  <p className="text-xs text-red-400 mb-4 bg-red-950/50 p-2.5 rounded-xl border border-red-500/30">
                    ⚠️ {photoError}
                  </p>
                )}

                {/* Preview Grid */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {photos.map((item, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/20 aspect-square bg-slate-950">
                        <img
                          src={item.previewUrl}
                          alt={`Upload ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="bg-red-600 text-white rounded-full p-1.5 text-xs font-bold hover:bg-red-500 transition-colors"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1 bg-black/70 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── SECTION 5: GUARDIAN / WALI DETAILS ── */}
              <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <span className="text-2xl">🤝</span>
                  <div>
                    <h2 className="text-lg font-bold text-white">5. Guardian / Wali & Contact Information</h2>
                    <p className="text-xs text-gray-400">Whom should the IC Pooler matrimonial committee contact?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Wali / Guardian / Contact Person Name *</label>
                    <input
                      name="waliName"
                      type="text"
                      required
                      value={formData.waliName}
                      onChange={handleChange}
                      placeholder="e.g. Tariq Khan (Father / Brother / Self)"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Relationship to Candidate *</label>
                    <select
                      name="waliRelation"
                      value={formData.waliRelation}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Brother">Brother</option>
                      <option value="Uncle">Uncle</option>
                      <option value="Self (Brother / Independent Sister)">Self (Brother / Independent Sister)</option>
                      <option value="Other Legal Guardian">Other Legal Guardian</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Contact Phone Number *</label>
                    <input
                      name="waliPhone"
                      type="tel"
                      required
                      value={formData.waliPhone}
                      onChange={handleChange}
                      placeholder="+1 (912) 555-0199"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Contact Email Address *</label>
                    <input
                      name="waliEmail"
                      type="email"
                      required
                      value={formData.waliEmail}
                      onChange={handleChange}
                      placeholder="guardian@example.com"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* ── SECTION 6: PARTNER PREFERENCES & BIO ── */}
              <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <span className="text-2xl">✨</span>
                  <div>
                    <h2 className="text-lg font-bold text-white">6. Partner Preferences & Bio</h2>
                    <p className="text-xs text-gray-400">Tell us what you are looking for in a spouse</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Preferred Age Range</label>
                      <div className="flex items-center gap-2">
                        <input
                          name="partnerAgeMin"
                          type="number"
                          value={formData.partnerAgeMin}
                          onChange={handleChange}
                          placeholder="Min (e.g. 23)"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          name="partnerAgeMax"
                          type="number"
                          value={formData.partnerAgeMax}
                          onChange={handleChange}
                          placeholder="Max (e.g. 30)"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Willing to Relocate?</label>
                      <select
                        name="willingToRelocate"
                        value={formData.willingToRelocate}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                      >
                        <option value="negotiable">Negotiable / Open to discussion</option>
                        <option value="yes">Yes, willing to relocate</option>
                        <option value="no">No, must stay in Savannah/Pooler area</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">About the Candidate (Personality, Hobbies, Values) *</label>
                    <textarea
                      name="bio"
                      rows="3"
                      required
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Briefly describe your personality, family values, interests, and goals in life..."
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Desired Qualities in a Future Spouse</label>
                    <textarea
                      name="partnerQualities"
                      rows="3"
                      value={formData.partnerQualities}
                      onChange={handleChange}
                      placeholder="Key religious, professional, and personal qualities you are seeking..."
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* ── SECTION 7: AGREEMENT & SUBMIT ── */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-6 sm:p-8">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    name="agreedToTerms"
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded text-yellow-500 focus:ring-yellow-400 bg-slate-900 border-gray-600"
                  />
                  <span className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    I declare in the name of Allah that all the information provided above is accurate and truthful. I authorize the Islamic Center of Pooler Matrimonial Board to review my profile and contact the guardian / applicant to facilitate suitable matches in an Islamic manner.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl shadow-yellow-500/20 text-base flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{submitting ? "Submitting Application..." : "💍 Submit Confidential Nikah Application"}</span>
                </button>
              </div>

            </form>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Islamic Center of Pooler — Matrimonial & Nikah Committee.</p>
        <p className="mt-1 text-gray-600">All submissions are held in strict Islamic confidentiality.</p>
      </footer>
    </div>
  );
};

export default MatrimonialService;
