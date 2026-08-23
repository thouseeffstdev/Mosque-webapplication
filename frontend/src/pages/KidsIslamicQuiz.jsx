import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const QUIZ_DATA = {
  beginner: {
    title: "🌟 Little Explorers (Ages 5–8)",
    badge: "Little Mu'min 🌙",
    questions: [
      {
        id: 1,
        question: "How many daily obligatory prayers (Salah) do Muslims pray each day?",
        options: ["3", "5", "7", "10"],
        answer: 1,
        fact: "The 5 daily prayers are Fajr, Dhuhr, Asr, Maghrib, and Isha! ☀️🌙",
        emoji: "🕌",
      },
      {
        id: 2,
        question: "What is the Holy Book of Islam revealed to Prophet Muhammad (PBUH)?",
        options: ["The Quran", "The Torah", "The Gospel", "The Psalms"],
        answer: 0,
        fact: "The Holy Quran was revealed in Arabic as a guidance for all humanity! 📖",
        emoji: "📖",
      },
      {
        id: 3,
        question: "In which Holy City is the sacred Kaaba located?",
        options: ["Madinah", "Jerusalem", "Makkah", "Cairo"],
        answer: 2,
        fact: "The Holy Kaaba is in Makkah, Saudi Arabia, and Muslims face it during prayer! 🕋",
        emoji: "🕋",
      },
      {
        id: 4,
        question: "What word do we say before eating or starting something good?",
        options: ["Alhamdulillah", "Bismillah", "Allahu Akbar", "SubhanAllah"],
        answer: 1,
        fact: "Bismillah means 'In the name of Allah' and brings blessings to everything we do! ✨",
        emoji: "🤲",
      },
      {
        id: 5,
        question: "Which Islamic month do Muslims fast from dawn to sunset?",
        options: ["Muharram", "Shawwal", "Ramadan", "Dhul Hijjah"],
        answer: 2,
        fact: "Ramadan is the blessed month of fasting, Quran, and good deeds! 🌙",
        emoji: "🌙",
      },
    ],
  },
  junior: {
    title: "🚀 Junior Scholars (Ages 9–12)",
    badge: "Junior Alim 🏅",
    questions: [
      {
        id: 1,
        question: "Who was the first Prophet created by Allah?",
        options: ["Prophet Ibrahim (AS)", "Prophet Nuh (AS)", "Prophet Adam (AS)", "Prophet Musa (AS)"],
        answer: 2,
        fact: "Prophet Adam (AS) was the father of humanity and the first Prophet of Allah! 🌿",
        emoji: "🌱",
      },
      {
        id: 2,
        question: "What is the second pillar of Islam?",
        options: ["Shahadah", "Salah (Prayer)", "Zakat (Charity)", "Hajj (Pilgrimage)"],
        answer: 1,
        fact: "Salah (prayer 5 times a day) is the second pillar and the direct connection to Allah! 🕌",
        emoji: "🕌",
      },
      {
        id: 3,
        question: "Which Angel brought the revelations of the Quran to Prophet Muhammad (PBUH)?",
        options: ["Angel Mika'il", "Angel Jibril (Gabriel)", "Angel Israfil", "Angel Azra'il"],
        answer: 1,
        fact: "Angel Jibril (AS) visited Prophet Muhammad (PBUH) in the Cave of Hira! ✨",
        emoji: "🕊️",
      },
      {
        id: 4,
        question: "What is the celebration at the end of Ramadan called?",
        options: ["Eid al-Adha", "Eid al-Fitr", "Mawlid", "Laylat al-Qadr"],
        answer: 1,
        fact: "Eid al-Fitr is the joyful celebration thanking Allah for completing Ramadan! 🎈",
        emoji: "🎉",
      },
      {
        id: 5,
        question: "Which Prophet built the Ark that saved believers and pairs of animals from the flood?",
        options: ["Prophet Nuh (Noah) (AS)", "Prophet Yunus (AS)", "Prophet Hud (AS)", "Prophet Salih (AS)"],
        answer: 0,
        fact: "Prophet Nuh (AS) built the great ship by the command and guidance of Allah! 🚢",
        emoji: "🚢",
      },
      {
        id: 6,
        question: "What direction do Muslims face during prayer?",
        options: ["North", "The Qibla (Kaaba in Makkah)", "The Sunrise", "The Moon"],
        answer: 1,
        fact: "The Qibla unites Muslims worldwide in facing the Holy Kaaba together! 🧭",
        emoji: "🧭",
      },
    ],
  },
  senior: {
    title: "🎓 Master Scholar (Ages 13+)",
    badge: "Quran Champion 👑",
    questions: [
      {
        id: 1,
        question: "How many Surahs (chapters) are there in the Holy Quran?",
        options: ["100", "114", "120", "99"],
        answer: 1,
        fact: "The Quran contains 114 Surahs, beginning with Surah Al-Fatiha and ending with Surah An-Nas! 📖",
        emoji: "📖",
      },
      {
        id: 2,
        question: "Which Prophet spoke as an infant from the cradle to defend his mother Maryam (Mary)?",
        options: ["Prophet Yahya (AS)", "Prophet Isa (Jesus) (AS)", "Prophet Yusuf (AS)", "Prophet Dawud (AS)"],
        answer: 1,
        fact: "Prophet Isa (AS) miraculously spoke as a baby: 'Indeed, I am the servant of Allah.' (Surah Maryam 19:30) ✨",
        emoji: "🌟",
      },
      {
        id: 3,
        question: "What was the first word of the Quran revealed to the Prophet Muhammad (PBUH)?",
        options: ["Qul (Say)", "Iqra (Read / Recite)", "Alhamdulillah", "Bismillah"],
        answer: 1,
        fact: "'Iqra' was revealed in the Cave of Hira, highlighting the immense value of knowledge! 📚",
        emoji: "📜",
      },
      {
        id: 4,
        question: "Which battle was the first major battle in Islamic history?",
        options: ["Battle of Uhud", "Battle of Badr", "Battle of the Trench (Khandaq)", "Battle of Tabuk"],
        answer: 1,
        fact: "The Battle of Badr took place in Ramadan in the 2nd year of Hijrah! ⚔️",
        emoji: "🛡️",
      },
      {
        id: 5,
        question: "What is the name of the special night in Ramadan better than 1,000 months?",
        options: ["Laylat al-Miraj", "Laylat al-Bara'at", "Laylat al-Qadr (Night of Decree)", "Yawm al-Jumu'ah"],
        answer: 2,
        fact: "Laylat al-Qadr is described in Surah Al-Qadr as better than 83 years of worship! 🌌",
        emoji: "🌌",
      },
    ],
  },
};

const KidsIslamicQuiz = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState("junior");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);

  const currentQuiz = QUIZ_DATA[level];
  const currentQ = currentQuiz.questions[currentQIndex];

  const handleSelectOption = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQ.answer) {
      const newStreak = streak + 1;
      setScore(score + 10 + newStreak * 2);
      setStreak(newStreak);
      if (newStreak > highestStreak) setHighestStreak(newStreak);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < currentQuiz.questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = (newLevel = level) => {
    setLevel(newLevel);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setQuizFinished(false);
  };

  const totalQuestions = currentQuiz.questions.length;
  const progressPercent = Math.round(((currentQIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 text-white font-sans selection:bg-yellow-400 selection:text-slate-950">
      
      {/* ── Top Header Navigation ── */}
      <header className="px-6 py-4 border-b border-white/10 backdrop-blur-md bg-slate-950/60 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/home")}>
          <span className="text-3xl animate-bounce">🌟</span>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-yellow-400 tracking-tight m-0">
              Kids Islamic Adventure Quiz
            </h1>
            <p className="text-[11px] text-gray-400 m-0">Learn, Play & Win Badges!</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/home")}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-full transition-all border border-white/20 flex items-center gap-1.5"
        >
          <span>← Back to Masjid Home</span>
        </button>
      </header>

      {/* ── Main Quiz Arena ── */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        
        {/* Name Registration Card (If not set) */}
        {!isNameSet ? (
          <div className="bg-slate-900/90 border-2 border-yellow-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl text-center backdrop-blur-xl animate-fade-in">
            <div className="text-6xl mb-4 animate-bounce">🎈</div>
            <h2 className="text-2xl sm:text-4xl font-black text-yellow-400 mb-2">
              Welcome, Young Explorer!
            </h2>
            <p className="text-gray-300 text-sm sm:text-base max-w-md mx-auto mb-8">
              Test your knowledge on the Quran, Prophets, Salah, and Islamic history! Earn your printable Junior Scholar Certificate!
            </p>

            {/* Name Input */}
            <div className="max-w-sm mx-auto mb-8">
              <label className="block text-xs font-bold text-yellow-300 mb-2 uppercase tracking-wider">
                What is your name, Explorer?
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="e.g. Zayd, Maryam, Omar..."
                className="w-full bg-slate-800 border-2 border-yellow-400/50 rounded-2xl px-5 py-3 text-center text-lg font-bold text-white focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20"
              />
            </div>

            {/* Level Selection */}
            <div className="mb-8">
              <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Choose Your Age Tier:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.keys(QUIZ_DATA).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                      level === lvl
                        ? "bg-yellow-500 text-slate-950 border-yellow-300 shadow-xl shadow-yellow-500/20 scale-105"
                        : "bg-slate-800/80 text-gray-300 border-white/10 hover:border-yellow-500/40"
                    }`}
                  >
                    {QUIZ_DATA[lvl].title}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsNameSet(true)}
              className="w-full max-w-sm bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-lg py-4 rounded-2xl shadow-xl shadow-yellow-500/30 transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              🚀 Start Adventure!
            </button>
          </div>
        ) : !quizFinished ? (
          /* ── Active Quiz Flow ── */
          <div className="bg-slate-900/90 border-2 border-yellow-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            
            {/* Top Scorebar & Progress */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="text-xs text-gray-400 m-0">Explorer</p>
                  <p className="text-sm font-black text-yellow-400 m-0">{playerName || "Young Mu'min"}</p>
                </div>
              </div>

              {/* Score & Streak */}
              <div className="flex items-center gap-4">
                <div className="bg-slate-800 border border-yellow-500/30 rounded-xl px-3.5 py-1.5 text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold m-0">Score</p>
                  <p className="text-lg font-black text-yellow-400 m-0">⭐ {score}</p>
                </div>

                {streak > 1 && (
                  <div className="bg-orange-500/20 border border-orange-400 rounded-xl px-3.5 py-1.5 text-center animate-bounce">
                    <p className="text-[10px] text-orange-300 uppercase font-bold m-0">Streak</p>
                    <p className="text-lg font-black text-orange-400 m-0">🔥 {streak}x</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                <span>Question {currentQIndex + 1} of {totalQuestions}</span>
                <span>{progressPercent}% Completed</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-amber-500 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="text-center mb-8">
              <span className="text-5xl inline-block mb-4 animate-float">{currentQ.emoji}</span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.answer;

                let btnStyles = "bg-slate-800/80 hover:bg-slate-700/80 text-white border-white/15 hover:border-yellow-400/50";
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyles = "bg-emerald-500/30 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/20 animate-pulse";
                  } else if (isSelected && !isCorrect) {
                    btnStyles = "bg-rose-500/30 border-rose-400 text-rose-300 ring-2 ring-rose-400";
                  } else {
                    btnStyles = "bg-slate-900/50 text-gray-500 border-white/5 opacity-50";
                  }
                }

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl border-2 text-left font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${btnStyles}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrect && <span className="text-xl">✅</span>}
                    {isAnswered && isSelected && !isCorrect && <span className="text-xl">❌</span>}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Fact Note (Shown after answering) */}
            {isAnswered && (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 mb-6 animate-fade-in flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider m-0 mb-1">
                    {selectedOption === currentQ.answer ? "MashAllah! Excellent Job!" : "Learning Moment!"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-200 m-0 leading-relaxed">
                    {currentQ.fact}
                  </p>
                </div>
              </div>
            )}

            {/* Next Button */}
            {isAnswered && (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-base py-3.5 rounded-2xl shadow-xl shadow-yellow-500/20 transform hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{currentQIndex < totalQuestions - 1 ? "Next Question →" : "See Final Results 🏆"}</span>
              </button>
            )}
          </div>
        ) : (
          /* ── Quiz Completed & Certificate Card ── */
          <div className="bg-slate-900/90 border-2 border-yellow-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl text-center backdrop-blur-xl animate-fade-in">
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            <span className="bg-yellow-400 text-slate-950 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest inline-block mb-3">
              Quiz Completed
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Takbeer! Allahu Akbar!
            </h2>
            <p className="text-gray-300 text-sm mb-8">
              MashAllah <strong className="text-yellow-400">{playerName || "Young Explorer"}</strong>, you did an amazing job learning about Islam!
            </p>

            {/* Score & Badge Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
              <div className="bg-slate-800/80 border border-yellow-500/30 rounded-2xl p-4">
                <p className="text-xs text-gray-400 font-bold uppercase m-0">Total Score</p>
                <p className="text-2xl font-black text-yellow-400 m-0">⭐ {score}</p>
              </div>

              <div className="bg-slate-800/80 border border-yellow-500/30 rounded-2xl p-4">
                <p className="text-xs text-gray-400 font-bold uppercase m-0">Highest Streak</p>
                <p className="text-2xl font-black text-orange-400 m-0">🔥 {highestStreak}x</p>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-slate-800/80 border border-yellow-500/30 rounded-2xl p-4">
                <p className="text-xs text-gray-400 font-bold uppercase m-0">Rank Badge</p>
                <p className="text-sm font-black text-emerald-400 m-0 mt-1">{currentQuiz.badge}</p>
              </div>
            </div>

            {/* Printable Junior Scholar Certificate */}
            <div className="bg-amber-50 text-slate-900 rounded-3xl p-6 sm:p-8 border-4 border-yellow-500 shadow-2xl mb-8 text-center max-w-xl mx-auto relative overflow-hidden">
              <div className="absolute top-2 right-2 text-4xl opacity-20">🕌</div>
              <p className="text-xs uppercase font-black text-amber-700 tracking-widest mb-1">
                Islamic Center of Pooler · Certificate of Achievement
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 font-serif mb-2">
                🌟 Junior Islamic Scholar 🌟
              </h3>
              <p className="text-xs text-gray-600 mb-4">This honors and certifies that</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-800 border-b-2 border-amber-300 pb-2 inline-block px-6 mb-4">
                {playerName || "Young Muslim Explorer"}
              </p>
              <p className="text-xs text-gray-700 max-w-md mx-auto leading-relaxed">
                Has successfully completed the <strong>{currentQuiz.title}</strong> with a score of <strong>{score} points</strong> and demonstrated wonderful enthusiasm for Islamic learning!
              </p>
              <div className="mt-4 pt-4 border-t border-amber-200 flex justify-between items-center text-[10px] font-bold text-gray-500">
                <span>Date: {new Date().toLocaleDateString()}</span>
                <span>Badge: {currentQuiz.badge}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => restartQuiz(level)}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-lg transition-all"
              >
                🔄 Play Again
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextLvl = level === "beginner" ? "junior" : level === "junior" ? "senior" : "beginner";
                  restartQuiz(nextLvl);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg transition-all"
              >
                🚀 Try Next Tier Level →
              </button>

              <button
                type="button"
                onClick={() => navigate("/home")}
                className="bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold px-6 py-3.5 rounded-2xl border border-white/10 transition-all"
              >
                🏠 Return Home
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default KidsIslamicQuiz;
