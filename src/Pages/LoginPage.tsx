import { useState, useEffect, useRef } from "react";
import { FaEnvelope, FaKey, FaGoogle, FaGithub, FaCheckCircle, FaTimes } from "react-icons/fa";
import { useNavigate, Navigate } from "react-router-dom";
import logo from '../assets/logo.png';
import { generateOTP, otpVerificationLogin } from '../Api/Auth';
import { useAuth } from "../Context/userContext";

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
    info: 'bg-blue-50 border-blue-200'
  };
  
  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800'
  };
  
  const iconColor = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-50 min-w-[300px] max-w-md border rounded-xl shadow-lg p-4 ${bgColor[type]} animate-fadeInUp`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${iconColor[type]}`}>
          {type === 'success' ? (
            <FaCheckCircle className="w-5 h-5" />
          ) : type === 'error' ? (
            <FaTimes className="w-5 h-5" />
          ) : (
            <FaEnvelope className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor[type]}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${textColor[type]} hover:opacity-70 transition-opacity`}
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'} animate-progress`}></div>
    </div>
  );
};

// ────────────────────────────────────────────────
// Main Login Page Component
// ────────────────────────────────────────────────
export default function LoginPage() {
  const { token: contextToken, setToken, user } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    otp: Array(6).fill(""),
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const otpRefs = useRef<HTMLInputElement[]>([]);

  // All hooks must come BEFORE any early return
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Safe to check token now ────────────────────────────────
  const storedToken = localStorage.getItem("accessToken") || contextToken;

  if (storedToken) {
    return <Navigate to="/home" replace />;
  }

  // ───────────────────────────────────────────────────────────

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, email: e.target.value }));
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOTP = [...formData.otp];
    newOTP[index] = value.slice(-1);
    setFormData((prev) => ({ ...prev, otp: newOTP }));

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      setFormData((prev) => ({ ...prev, otp: pasted.split("") }));
      otpRefs.current[5]?.focus();
    }
  };

  const sendOTP = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    setIsLoading(true);
    try {
      await generateOTP({ identifier: formData.email });
      localStorage.setItem("loginEmail", formData.email);
      setIsOTPSent(true);
      setCountdown(60);
      showToast(`OTP sent successfully to ${formData.email}`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to send OTP. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;
    const email = localStorage.getItem("loginEmail");
    if (!email) {
      setIsOTPSent(false);
      showToast("Email not found. Please enter email again.", "error");
      return;
    }
    setIsLoading(true);
    try {
      await generateOTP({ identifier: email });
      setCountdown(60);
      showToast("New OTP sent successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to resend OTP.", "error");
      setCountdown(0);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    const otp = formData.otp.join("");
    if (otp.length !== 6) {
      showToast("Please enter complete 6-digit OTP", "error");
      return;
    }

    setIsLoading(true);
    try {
      const email = localStorage.getItem("loginEmail");
      if (!email) {
        showToast("Email not found. Please start over.", "error");
        throw new Error("Email not found");
      }

      const res = await otpVerificationLogin({ otp, identifier: email });

      // Store tokens
      setToken(res.access);
      localStorage.setItem("accessToken", res.access);
      if (res.refresh) localStorage.setItem("refreshToken", res.refresh);

      localStorage.removeItem("loginEmail");

      showToast("Login successful! Redirecting...", "success");
      
      // Delay navigation to avoid race condition / white screen
      setTimeout(() => {
        if (res.is_admin || res.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      }, 800);

    } catch (err: any) {
      showToast(err.message || "Invalid OTP. Please try again.", "error");
      setFormData((prev) => ({ ...prev, otp: Array(6).fill("") }));
      if (otpRefs.current[0]) {
        otpRefs.current[0].focus();
      }
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
    showToast("Enter your email to receive OTP", "info");
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Soft magical background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40 animate-blob-slow"></div>
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-30 animate-blob-slow animation-delay-3000"></div>
          <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20 animate-blob-slow animation-delay-6000"></div>
        </div>

        <style>{`
          @keyframes blob-slow {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50%      { transform: translate(40px, -40px) scale(1.08); }
          }
          @keyframes float-gentle {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-12px); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes checkmark {
            0%   { transform: scale(0); opacity: 0; }
            50%  { transform: scale(1.3); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes progress {
            from { width: 100%; }
            to   { width: 0%; }
          }
          .animate-blob-slow { animation: blob-slow 12s infinite ease-in-out; }
          .animation-delay-3000 { animation-delay: 3s; }
          .animation-delay-6000 { animation-delay: 6s; }
          .animate-float-gentle { animation: float-gentle 6s ease-in-out infinite; }
          .animate-fadeInUp { animation: fadeInUp 0.7s ease-out forwards; }
          .animate-checkmark { animation: checkmark 0.6s ease-out forwards; }
          .animate-progress { animation: progress 4s linear forwards; }
        `}</style>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/30">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative animate-float-gentle">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-indigo-400/20 rounded-full blur-2xl"></div>
                <img
                  src={logo}
                  alt="MagicLamp"
                  className="w-24 h-24 object-contain relative z-10 drop-shadow-xl"
                />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="mt-3 text-gray-600">
                {isOTPSent
                  ? "Enter the OTP sent to your email"
                  : "Sign in with your email"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    disabled={isOTPSent}
                    placeholder="name@example.com"
                    className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:border-indigo-500 transition-all ${
                      isOTPSent
                        ? "bg-green-50/60 border-green-200 text-gray-700"
                        : "bg-white border-gray-200 focus:ring-2 focus:ring-indigo-200"
                    }`}
                  />
                  {isOTPSent && (
                    <FaCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-checkmark" />
                  )}
                </div>
              </div>

              {/* OTP Input Section */}
              {isOTPSent && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OTP (6 digits)
                  </label>
                  <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                    {formData.otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el!)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOTPChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        autoFocus={idx === 0}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/30 transition-all bg-white"
                      />
                    ))}
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Didn't receive code?</span>
                    <button
                      type="button"
                      onClick={resendOTP}
                      disabled={isLoading || countdown > 0}
                      className={`font-medium ${
                        countdown > 0 || isLoading
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-indigo-600 hover:text-indigo-800"
                      } transition-colors`}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || (isOTPSent && formData.otp.join("").length !== 6)}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-100"
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
                  className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Try another email
                </button>
              )}
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons (placeholders) */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <FaGoogle className="text-red-500" />
                Google
              </button>
              <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <FaGithub />
                GitHub
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-gray-600">
              New here?{" "}
              <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-800">
                Create account
              </a>
            </p>
          </div>

          {/* Security Badge */}
          <p className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
            <FaKey className="text-indigo-500" />
            OTP-based • Secure & Fast
          </p>
        </div>
      </div>
    </>
  );
}