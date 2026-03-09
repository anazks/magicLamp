import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../Api/Auth';
import { useAuth } from '../Context/userContext';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

export default function GoogleAuth() {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      // ✅ Google ID Token (JWT)
      const googleIdToken = credentialResponse.credential;
      console.log("Google ID Token:", googleIdToken);

      // 🕒 Add 5s delay to handle clock skew (Token used too early)
      console.log("Waiting 5 seconds for clock sync...");
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Call backend
      const res = await googleAuth(googleIdToken);
      console.log("Google Auth Response:", res);

      const { access, refresh } = res.data;

      // Store tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      // Update auth context
      setToken(access);

      // Navigate after login
      navigate('/home');

    } catch (error: any) {
      console.error(
        'Google login failed details:',
        error.response?.data || error.message || error
      );
      // Optional: alert user with backend error
      if (error.response?.data?.error) {
        alert(`Login Failed: ${error.response.data.error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {loading ? (
        <div className="flex flex-col items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 animate-pulse w-full">
          <FaSpinner className="animate-spin text-indigo-600 text-2xl" />
          <div className="text-center">
            <p className="text-indigo-900 font-semibold text-sm">Verifying with Google...</p>
            <p className="text-indigo-600 text-xs mt-1">Please wait 5 seconds for secure sync</p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              console.log('Google Login Failed');
            }}
            shape="rectangular"
            theme="filled_blue"
            size="large"
          />
        </div>
      )}
    </div>
  );
}
