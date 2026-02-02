import { useState, useEffect, useRef } from "react";
import { FaEnvelope, FaKey, FaCheckCircle, FaTimes } from "react-icons/fa";
import { useNavigate, Navigate } from "react-router-dom";
import logo from '../assets/logo.png';
import { generateOTP, otpVerificationLogin } from '../Api/Auth';
import { useAuth } from "../Context/userContext";
import GoogleAuth from "./GoogleAuth";

// ────────────────────────────────────────────────
// Custom Toast Component (unchanged)
// ────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 4200);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 min-w-[320px] border rounded-2xl p-4 shadow-xl ${bgColor[type]} animate-fadeInUp`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${textColor[type]} text-xl`}>
          {type === 'success' ? <FaCheckCircle /> : type === 'error' ? <FaTimes /> : <FaEnvelope />}
        </div>
        <div className="flex-1">
          <p className={`font-medium ${textColor[type]}`}>{message}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          <FaTimes />
        </button>
      </div>
      <div
        className={`h-1 mt-3 rounded-full ${
          type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } animate-progress`}
      />
    </div>
  );
};

// ────────────────────────────────────────────────
// Main Login Page
// ────────────────────────────────────────────────
export default function LoginPage() {
  const { token: contextToken, setToken } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState<{
    email: string;
    otp: string[];
  }>({
    email: "",
    otp: Array(6).fill(""),
  });

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ─── Check localStorage & clear inconsistent state ───────────────────────
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    // If tokens exist anywhere → redirect
    // if (accessToken || contextToken) {
    //   // Optional: you could also check if it's admin here
    //   navigate("/home", { replace: true });
    //   return;
    // }

    // If NO tokens in localStorage → make sure context is also cleared
    if (!accessToken && !refreshToken) {
      setToken(null);                    // clear auth context
      localStorage.removeItem("loginEmail"); // clean any leftover login state
      setIsOTPSent(false);               // reset OTP flow
      setFormData({
        email: "",
        otp: Array(6).fill(""),
      });
    }
  }, [contextToken, setToken, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, email: e.target.value }));
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOTP = [...formData.otp];
    newOTP[index] = value.slice(-1);
    setFormData(prev => ({ ...prev, otp: newOTP }));

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      setFormData(prev => ({ ...prev, otp: pasted.split("") }));
      otpRefs.current[5]?.focus();
    }
  };

  const sendOTP = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showToast("Please enter a valid email", "error");
      return;
    }

    setIsLoading(true);
    try {
      await generateOTP({ identifier: formData.email });

      localStorage.setItem("loginEmail", formData.email);
      setIsOTPSent(true);
      setCountdown(60);
      showToast(`OTP sent to ${formData.email}`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to send OTP", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;
    const email = localStorage.getItem("loginEmail");
    if (!email) {
      setIsOTPSent(false);
      showToast("Please enter email again", "error");
      return;
    }

    setIsLoading(true);
    try {
      await generateOTP({ identifier: email });
      setCountdown(60);
      showToast("New OTP sent", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to resend OTP", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    const otp = formData.otp.join("");
    if (otp.length !== 6) {
      showToast("Enter complete 6-digit OTP", "error");
      return;
    }

    setIsLoading(true);
    try {
      const email = localStorage.getItem("loginEmail");
      if (!email) throw new Error("Email missing");

      const res = await otpVerificationLogin({ otp, identifier: email });

      setToken(res.access);
      localStorage.setItem("accessToken", res.access);
      if (res.refresh) localStorage.setItem("refreshToken", res.refresh);
      localStorage.removeItem("loginEmail");

      showToast("Login successful!", "success");

      setTimeout( () => {
        if (res.is_admin || res.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      }, 700);
    } catch (err: any) {
      showToast(err.message || "Invalid OTP", "error");
      setFormData(prev => ({ ...prev, otp: Array(6).fill("") }));
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOTPSent) verifyOTP();
    else sendOTP();
  };

  const handleGoBack = () => {
    setIsOTPSent(false);
    localStorage.removeItem("loginEmail");
    setFormData({ email: "", otp: Array(6).fill("") });
  };

  // If we still have token after cleanup → redirect
  const storedToken = localStorage.getItem("accessToken") || contextToken;
  if (storedToken) {
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50/60 to-purple-50/40 py-12 px-5">
        <div className="w-full max-w-md">
          {/* Logo + Title */}
          <div className="text-center mb-10">
            <img
              src={logo}
              alt="Logo"
              className="mx-auto h-20 w-auto mb-6 drop-shadow-md"
            />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="mt-3 text-gray-600">
              {isOTPSent ? "Enter the 6-digit code we sent" : "Sign in with your email"}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100/80">
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    disabled={isOTPSent}
                    placeholder="you@example.com"
                    className={`w-full pl-11 pr-4 py-3.5 border rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-200/50 ${
                      isOTPSent
                        ? "bg-green-50/40 border-green-200 text-gray-700 cursor-not-allowed"
                        : "bg-white border-gray-200 hover:border-indigo-300 focus:border-indigo-400"
                    }`}
                  />
                  {isOTPSent && (
                    <FaCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                  )}
                </div>
              </div>

              {/* OTP Section */}
              {isOTPSent && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <div className="flex justify-center gap-3" onPaste={handlePaste}>
                    {formData.otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => { otpRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOTPChange(idx, e.target.value)}
                        onKeyDown={e => handleKeyDown(idx, e)}
                        autoFocus={idx === 0}
                        className="w-12 h-14 text-center text-2xl font-bold border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/30 transition-all bg-white"
                      />
                    ))}
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Didn't receive code?</span>
                    <button
                      type="button"
                      onClick={resendOTP}
                      disabled={isLoading || countdown > 0}
                      className={`font-medium transition-colors ${
                        countdown > 0 || isLoading
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-indigo-600 hover:text-indigo-800"
                      }`}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend"}
                    </button>
                  </div>
                </div>
              )}

              {/* Main Action Button */}
              <button
                type="submit"
                disabled={isLoading || (isOTPSent && formData.otp.join("").length !== 6)}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" className="opacity-75" />
                    </svg>
                    {isOTPSent ? "Verifying..." : "Sending..."}
                  </div>
                ) : isOTPSent ? (
                  "Verify & Login"
                ) : (
                  "Send OTP"
                )}
              </button>

              {isOTPSent && (
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="w-full py-3 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  Try another email
                </button>
              )}
            </form>

            {/* Divider */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Button */}
            {/* <div className="flex justify-center">
              <button className="flex items-center justify-center gap-3 w-full max-w-xs py-3.5 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors font-medium text-gray-700">
                <FaGoogle className="text-red-500 text-xl" />
                Continue with Google
              </button>
            </div> */}
            <GoogleAuth/>

            {/* Sign up link */}
            <p className="mt-10 text-center text-gray-600">
              New here?{" "}
              <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-800 underline-offset-2 hover:underline">
                Create an account
              </a>
            </p>
          </div>

          {/* Security hint */}
          <p className="mt-8 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
            <FaKey className="text-indigo-500" />
            Passwordless • Secure OTP login
          </p>
        </div>
      </div>
    </>
  );
}