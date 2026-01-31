import { GoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../Api/Auth';
import { useAuth } from '../Context/userContext';
import { useNavigate } from 'react-router-dom';

export default function GoogleAuth() {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      // ✅ Google ID Token (JWT)
      const googleIdToken = credentialResponse.credential;
      console.log("Google ID Token:", googleIdToken);

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

    } catch (error) {
      console.error(
        'Google login failed:',
        error.response?.data || error.message
      );
    }
  };

  return (
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
  );
}
