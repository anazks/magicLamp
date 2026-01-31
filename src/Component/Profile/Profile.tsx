import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileDetails, updateProfile } from '../../Api/Auth';
import { FaUserLock, FaSignInAlt, FaUserPlus, FaUser, FaPhone, FaBirthdayCake, FaMapMarkerAlt, FaMapPin, FaHome, FaEdit, FaSave, FaTimes, FaChevronRight } from 'react-icons/fa';

interface ProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_picture?: string;
  date_of_birth?: string;
  pin_code?: number;
  age?: string;
  district?: string;
  state?: string;
  address?: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>({});
  const [formData, setFormData] = useState<ProfileData>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsGuest(true);
        setLoading(false);
        return false;
      }
      return true;
    };

    const fetchProfile = async () => {
      if (!checkAuth()) return;

      try {
        setLoading(true);
        const data = await profileDetails();
        setProfile(data);
        setFormData(data); // Initialize form with current data
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : Number(value),
    }));
  };

  const handleSave = async () => {
    // Basic validation
    if (formData.phone_number && !/^\+?\d{9,15}$/.test(formData.phone_number)) {
      alert('Please enter a valid phone number (9-15 digits, optional + prefix)');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfile(formData);
      setProfile(updated);
      setFormData(updated);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile. Please try again.');
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile); // Reset to original
    setIsEditing(false);
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  // Guest User View
  if (isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/30 p-4">
        <div className="text-center max-w-md w-full">
          {/* Floating Animation Container */}
          <div className="relative mb-8">
            {/* Outer glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-20 animate-pulse" />
            
            {/* Lock animation */}
            <div className="relative mx-auto w-40 h-40 mb-8">
              {/* Animated lock icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Lock body */}
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-500">
                    <div className="relative">
                      <FaUserLock className="text-white text-4xl" />
                      {/* Lock shine */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                    </div>
                  </div>
                  
                  {/* Pulsing ring */}
                  <div className="absolute -inset-4 border-4 border-indigo-400/30 rounded-3xl animate-ping" />
                  
                  {/* Floating particles */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-float opacity-70`}
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Rotating circles */}
              <div className="absolute inset-0 border-4 border-indigo-300/20 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-8 border-4 border-purple-300/20 rounded-full animate-spin-slow-reverse"></div>
            </div>

            {/* Text content */}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Profile Locked
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              You're viewing as a guest user
            </p>
            <p className="text-gray-500 mb-8">
              Login to access your profile and personalize your experience
            </p>

            {/* Features list */}
            <div className="space-y-4 mb-8 text-left bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center shadow-sm">
                  <FaUser className="text-indigo-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Personal Profile</h4>
                  <p className="text-sm text-gray-600">Manage your personal information</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center shadow-sm">
                  <FaBirthdayCake className="text-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Update Details</h4>
                  <p className="text-sm text-gray-600">Edit your contact and address info</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl flex items-center justify-center shadow-sm">
                  <FaMapMarkerAlt className="text-pink-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Address Management</h4>
                  <p className="text-sm text-gray-600">Save and manage your addresses</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleLoginRedirect}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg group relative overflow-hidden"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <span className="flex items-center justify-center gap-3 relative">
                  <FaSignInAlt className="text-xl group-hover:translate-x-1 transition-transform" />
                  Login to Access Profile
                  <FaChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={handleRegisterRedirect}
                className="w-full py-3 bg-gradient-to-r from-gray-50 to-white text-gray-700 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-sm border-2 border-indigo-200 group"
              >
                <span className="flex items-center justify-center gap-2">
                  <FaUserPlus className="text-indigo-500" />
                  Create New Account
                </span>
              </button>
            </div>

            {/* Guest message */}
            <p className="mt-6 text-sm text-gray-500">
              Guest access is limited. Create an account to unlock all features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative w-20 h-20 border-4 border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-border rounded-full animate-spin">
              <div className="absolute inset-2 bg-white rounded-full"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-4">
        <div className="text-center max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/40">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl text-white">⚠️</span>
            </div>
          </div>
          <p className="text-gray-800 mb-6 text-lg font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
  const displayDob = profile.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Not set';

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-purple-50/20 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <FaUser className="text-indigo-500" />
            Manage your personal information
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/40">
          {/* Profile Header with Picture */}
          <div className="px-6 py-10 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-white/30">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                {profile.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-lg opacity-20 animate-pulse" />
              </div>

              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900">{fullName}</h2>
                <div className="flex flex-wrap gap-4 mt-3">
                  {profile.age && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaBirthdayCake className="text-indigo-500" />
                      <span>{profile.age} years old</span>
                    </div>
                  )}
                  {profile.phone_number && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaPhone className="text-purple-500" />
                      <span>+{profile.phone_number}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <FaUser className="text-indigo-500" />
                {isEditing ? 'Edit Profile' : 'Personal Details'}
              </h3>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg font-medium flex items-center gap-2 group"
                >
                  <FaEdit className="group-hover:rotate-12 transition-transform" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FaUser className="text-indigo-500 text-xs" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name || ''}
                    onChange={handleInputChange}
                    maxLength={30}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-300 shadow-sm"
                    placeholder="Enter first name"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-900 font-medium">{profile.first_name || '—'}</p>
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FaUser className="text-indigo-500 text-xs" />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name || ''}
                    onChange={handleInputChange}
                    maxLength={30}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-300 shadow-sm"
                    placeholder="Enter last name"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-900 font-medium">{profile.last_name || '—'}</p>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FaPhone className="text-purple-500 text-xs" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleInputChange}
                    pattern="\+?[0-9]{9,15}"
                    maxLength={15}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-300 shadow-sm"
                    placeholder="+91xxxxxxxxxx"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-900 font-medium">{profile.phone_number || 'Not set'}</p>
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FaBirthdayCake className="text-pink-500 text-xs" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-300 shadow-sm"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-900 font-medium">{displayDob}</p>
                  </div>
                )}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <p className="text-gray-900 font-medium">{profile.age || '—'}</p>
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FaHome className="text-emerald-500 text-xs" />
                  Full Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-300 shadow-sm"
                    placeholder="House name, street, etc..."
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-900">{profile.address || 'Not set'}</p>
                  </div>
                )}
              </div>

              {/* District */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500 text-xs" />
                  District
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="district"
                    value={formData.district || ''}
                    onChange={handleInputChange}
                    maxLength={20}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-300 shadow-sm"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-900">{profile.district || '—'}</p>
                  </div>
                )}
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-orange-500 text-xs" />
                  State
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state || ''}
                    onChange={handleInputChange}
                    maxLength={20}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-300 shadow-sm"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-900">{profile.state || '—'}</p>
                  </div>
                )}
              </div>

              {/* Pin Code */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                  <FaMapPin className="text-red-500 text-xs" />
                  Pin Code
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="pin_code"
                    value={formData.pin_code ?? ''}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-300 shadow-sm"
                    placeholder="6-digit pin code"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-900">{profile.pin_code || '—'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add animations to global CSS */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.7; }
          50% { transform: translateY(-15px) translateX(5px); opacity: 1; }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-spin-slow-reverse { animation: spin-slow-reverse 10s linear infinite; }
        .animate-shine { animation: shine 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}