import { useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <FaLock className="text-8xl text-red-500 mb-8" />
      
      <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">
        Access Denied
      </h2>
      
      <p className="text-xl text-gray-600 mb-10 text-center max-w-md">
        You are not authorized to view this page.
      </p>

      <button
        onClick={() => navigate('/home')}
        className="px-8 py-4 bg-indigo-600 text-white text-lg font-medium rounded-xl hover:bg-indigo-700 transition shadow-lg"
      >
        Go to Home Page
      </button>
    </div>
  );
}