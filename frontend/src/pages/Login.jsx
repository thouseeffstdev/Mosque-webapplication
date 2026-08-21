import React, { useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
  // activeTab: "user" | "admin"
  const [activeTab, setActiveTab] = useState("user");
  // userMode: "login" | "register"
  const [userMode, setUserMode] = useState("login");

  // Form states
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "+",
  });

  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", show: false });
  const navigate = useNavigate();

  const showNotification = (message, type = "error") => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: "", type: "", show: false }), 4000);
  };

  const handleUserChange = (e) => {
    if (e.target.name === "mobileNumber") {
      const val = e.target.value.startsWith("+") ? e.target.value : "+" + e.target.value;
      setUserForm({ ...userForm, [e.target.name]: val });
    } else {
      setUserForm({ ...userForm, [e.target.name]: e.target.value });
    }
  };

  const handleAdminChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  // User Login / Register Submit
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const isRegister = userMode === "register";

    if (!userForm.email || !userForm.password || (isRegister && (!userForm.name || !userForm.mobileNumber))) {
      showNotification("Please fill in all required fields.", "error");
      return;
    }

    if (isRegister) {
      const mobileRegex = /^\+[1-9]\d{1,14}$/;
      if (!mobileRegex.test(userForm.mobileNumber)) {
        showNotification("Please enter a valid mobile number with country code (e.g. +19125550100)", "error");
        return;
      }
    }

    setLoading(true);
    try {
      const url = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister ? userForm : { email: userForm.email, password: userForm.password };
      const res = await axios.post(url, payload);

      const { token, role, name, _id } = res.data;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role || "user");
        localStorage.setItem("userId", _id);
        localStorage.setItem("username", name || "Community Member");
        showNotification("Welcome back! Redirecting...", "success");
        setTimeout(() => navigate("/user/dashboard"), 1000);
      } else {
        showNotification("Registration successful! Please sign in with your credentials.", "success");
        setUserMode("login");
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Authentication failed. Please check your credentials.";
      showNotification(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Admin Direct Login Submit
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!adminForm.email || !adminForm.password) {
      showNotification("Admin email and password are required.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/auth/masjidLogin", {
        email: adminForm.email,
        password: adminForm.password,
      });

      if (res.data.token && res.data.status === "approved") {
        localStorage.setItem("masjidtoken", res.data.token);
        localStorage.setItem("masjidId", res.data.masjidId);
        localStorage.setItem("role", "admin");
        localStorage.setItem("name", res.data.name || "Masjid Admin");
        localStorage.setItem("masjidSaas", res.data.masjidSaas);
        localStorage.setItem("masjidType", res.data.masjidType);
        localStorage.setItem("mobileNumber", res.data.mobileNumber);
        showNotification("Admin authenticated! Opening dashboard...", "success");
        setTimeout(() => navigate("/masjid/dashboard"), 1000);
      } else if (res.data.status === "pending") {
        showNotification("Your admin registration is currently under review by Super Admin.", "error");
      } else {
        showNotification("Admin authorization failed or account is pending approval.", "error");
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid admin credentials. Please try again.";
      showNotification(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Google Login Hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await userInfoRes.json();

        const backendRes = await axios.post("/auth/google", {
          name: googleUser.name,
          email: googleUser.email,
        });

        const { token, role, name, _id } = backendRes.data;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("role", role || "user");
          localStorage.setItem("userId", _id);
          localStorage.setItem("username", name || googleUser.name || "Community Member");
          showNotification("Signed in with Google! Redirecting...", "success");
          setTimeout(() => navigate("/user/dashboard"), 1000);
        }
      } catch (err) {
        showNotification("Google sign-in failed. Please try again or use email.", "error");
      } finally {
        setLoading(false);
      }
    },
    onError: () => showNotification("Google authentication popup was closed or failed.", "error"),
  });

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-yellow-950/30 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#eab308 1px, transparent 1px), radial-gradient(#eab308 1px, #0f172a 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 20px 20px",
        }}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border text-sm font-semibold transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/50 backdrop-blur-md"
              : "bg-red-950/90 text-red-300 border-red-500/50 backdrop-blur-md"
          }`}
        >
          <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/60">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link to="/home" className="inline-flex items-center gap-3 group mb-4">
            <img
              src="/assets/logo.jpg"
              alt="Islamic Center Logo"
              className="w-12 h-12 rounded-full border-2 border-yellow-400 object-cover shadow-md group-hover:scale-105 transition-transform"
            />
            <div className="text-left">
              <p className="text-white font-black text-base leading-tight">Islamic Center</p>
              <p className="text-yellow-400 font-bold text-xs leading-tight">of Pooler</p>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Portal Access</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Sign in to your account or masjid management panel</p>
        </div>

        {/* Top Role Selector Tabs (User vs Admin) */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-800/80 rounded-2xl border border-white/10 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("user")}
            className={`py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "user"
                ? "bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>👤</span>
            <span>Community Member</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("admin")}
            className={`py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "admin"
                ? "bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>🛡️</span>
            <span>Masjid Admin</span>
          </button>
        </div>

        {/* ── TAB 1: COMMUNITY USER ── */}
        {activeTab === "user" && (
          <div>
            {/* User Sub-toggle: Login vs Sign Up */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-slate-950/60 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setUserMode("login")}
                  className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                    userMode === "login" ? "bg-white/10 text-yellow-400 shadow" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setUserMode("register")}
                  className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                    userMode === "register" ? "bg-white/10 text-yellow-400 shadow" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Google Quick Sign-In */}
            <button
              type="button"
              onClick={() => googleLogin()}
              disabled={loading}
              className="w-full mb-6 flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-slate-900 font-bold py-3.5 px-4 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-gray-400 font-medium">or continue with email</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleUserSubmit} className="space-y-4">
              {userMode === "register" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
                    <input
                      name="name"
                      type="text"
                      value={userForm.name}
                      onChange={handleUserChange}
                      placeholder="e.g. Ahmad Khan"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Mobile Number</label>
                    <input
                      name="mobileNumber"
                      type="tel"
                      value={userForm.mobileNumber}
                      onChange={handleUserChange}
                      placeholder="+19125550100"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={userForm.email}
                  onChange={handleUserChange}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
                <input
                  name="password"
                  type="password"
                  value={userForm.password}
                  onChange={handleUserChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 text-sm"
              >
                {loading ? "Processing..." : userMode === "register" ? "Create Free Account" : "Sign In to Member Portal"}
              </button>
            </form>
          </div>
        )}

        {/* ── TAB 2: MASJID ADMIN ── */}
        {activeTab === "admin" && (
          <div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <span className="text-xl">🛡️</span>
              <div>
                <p className="text-amber-300 font-bold text-xs">Official Masjid Management Portal</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Direct login for authorized mosque committee members and prayer managers.
                </p>
              </div>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Admin Email</label>
                <input
                  name="email"
                  type="email"
                  value={adminForm.email}
                  onChange={handleAdminChange}
                  placeholder="admin@icpooler.org"
                  className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Admin Password</label>
                <input
                  name="password"
                  type="password"
                  value={adminForm.password}
                  onChange={handleAdminChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 text-sm"
              >
                {loading ? "Authenticating Admin..." : "Login to Admin Dashboard"}
              </button>
            </form>

            {/* Sub-options for Admin */}
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <Link to="/masjid" className="hover:text-yellow-400 transition-colors">
                Register New Masjid →
              </Link>
              <Link to="/superadmin" className="hover:text-yellow-400 transition-colors">
                Super Admin Access →
              </Link>
            </div>
          </div>
        )}

        {/* Back to Home Link */}
        <div className="mt-8 text-center">
          <Link to="/home" className="text-xs font-semibold text-gray-400 hover:text-yellow-400 transition-colors inline-flex items-center gap-1.5">
            <span>←</span>
            <span>Return to Main Website</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;