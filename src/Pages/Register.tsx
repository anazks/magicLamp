import React, { useState } from 'react';
import { userRegistration, otpVerificationRegister } from '../Api/Auth';

export default function Register() {
  const [step, setStep] = useState<'register' | 'otp' | 'success'>('register');
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
    if (error) setError(null);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.firstName.trim()) {
      setError("Please enter your first name");
      return;
    }

    if (!formData.email) {
      setError("Please enter your email");
      return;
    }

    if (!formData.password) {
      setError("Please enter a password");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      // Call the registration API (assumes it sends OTP to email)
      await userRegistration({
        firstName: formData.firstName,
        email: formData.email,
        password: formData.password,
      });

      // On success: store email and move to OTP step
      setRegisteredEmail(formData.email);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic OTP validation (assuming 6-digit OTP)
    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError("OTP must be a 6-digit number");
      return;
    }

    setLoading(true);

    try {
      // Call the OTP verification API with params: otp and identifier (email)
      await otpVerificationRegister({
        otp: otp,
        identifier: registeredEmail,
      });

      // On success: move to final success step
      setStep('success');
    } catch (err: any) {
      setError(err.message || "OTP verification failed. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-green-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Account Verified Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Welcome! Your registration is now complete. You can sign in with your email and password.
          </p>
          <a
            href="/login"
            className="inline-block py-3 px-6 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  // OTP step
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
            Verify Your Email
          </h2>
          <p className="text-center text-gray-600 mb-6">
            We've sent a 6-digit OTP to <strong>{registeredEmail}</strong>. Please enter it below.
          </p>

          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div>
              <label 
                htmlFor="otp" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={handleOtpChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg tracking-widest
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                         outline-none transition"
                placeholder="123456"
              />
            </div>

            {/* Error display */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded-r">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg
                       hover:bg-indigo-700 focus:outline-none focus:ring-2 
                       focus:ring-indigo-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition duration-200 mt-2"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              onClick={() => {
                // Optional: Add resend logic here by calling userRegistration again
                setError(null);
                alert('Resend OTP functionality can be added here.');
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500"
              type="button"
            >
              Resend OTP
            </button>
          </p>

          <p className="mt-2 text-center text-sm text-gray-600">
            <button
              onClick={() => setStep('register')}
              className="font-medium text-indigo-600 hover:text-indigo-500"
              type="button"
            >
              Back to Registration
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Registration form step
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Create Your Account
        </h2>

        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          {/* First Name */}
          <div>
            <label 
              htmlFor="firstName" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                       outline-none transition"
              placeholder="John"
            />
          </div>

          {/* Email */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                       outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                       outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                       outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded-r">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg
                     hover:bg-indigo-700 focus:outline-none focus:ring-2 
                     focus:ring-indigo-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition duration-200 mt-2"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}