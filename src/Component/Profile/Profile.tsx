import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileDetails, updateProfile } from '../../Api/Auth';
import Loader from '../Loader/Loader';
import {
  FaUser,
  FaEdit,
  FaSave,
  FaTimes,
  FaSignOutAlt,
} from 'react-icons/fa';

interface ProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_picture?: string;
  date_of_birth?: string;
  pin_code?: number;
  age?: number | string;
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

    if (!token) {
      setIsGuest(true);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await profileDetails();
        setProfile(data);
        setFormData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : Number(value),
    }));
  };

  // Validation function to check if all required fields are filled
  const isFormValid = (): boolean => {
    const requiredFields = {
      first_name: formData.first_name?.trim(),
      last_name: formData.last_name?.trim(),
      phone_number: formData.phone_number?.trim(),
      date_of_birth: formData.date_of_birth,
      address: formData.address?.trim(),
      district: formData.district?.trim(),
      state: formData.state?.trim(),
      pin_code: formData.pin_code,
    };

    // Check if all required fields have values
    const allFieldsFilled = Object.values(requiredFields).every(
      (value) => value !== undefined && value !== '' && value !== null
    );

    // Validate phone number format
    const isPhoneValid =
      formData.phone_number && /^\+?\d{9,15}$/.test(formData.phone_number);

    // Validate pin code (assuming 6 digits for Indian pin codes)
    const isPinCodeValid =
      formData.pin_code && formData.pin_code.toString().length === 6;

    return allFieldsFilled && isPhoneValid && isPinCodeValid;
  };

  const handleSave = async () => {
    setSaveError(null);

    // Validate before saving
    if (!isFormValid()) {
      setSaveError('Please fill in all required fields with valid data');
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
      const backendError =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.phone_number?.[0] ||
        err.response?.data?.first_name?.[0] ||
        'Failed to update profile. Please check your input and try again.';
      
      setSaveError(backendError);
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setSaveError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
    window.location.href = '/';
  };

  if (isGuest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
              <FaUser size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Guest Mode</h1>
            <p className="text-gray-600 mb-8">
              Please log in to view and edit your profile
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mb-4"
          >
            Login
          </button>

          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 font-medium hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
  const isSaveDisabled = !isFormValid() || saving;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Profile Header */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600 overflow-hidden">
                {fullName.charAt(0).toUpperCase()}
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
                {profile.phone_number && (
                  <p className="text-gray-600 mt-1">{profile.phone_number}</p>
                )}
              </div>
            </div>
          </div>

          {/* Error message when saving */}
          {saveError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {saveError}
            </div>
          )}

          {/* Actions */}
          <div className="p-6 border-b flex flex-wrap gap-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FaEdit />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaveDisabled}
                  className={`flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg transition ${
                    isSaveDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-green-700'
                  }`}
                  title={
                    !isFormValid() && !saving
                      ? 'Please fill all required fields correctly'
                      : ''
                  }
                >
                  {saving ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : (
                    <FaSave />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition"
                >
                  <FaTimes />
                  Cancel
                </button>
              </>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 ml-auto transition"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>

          {/* Profile Fields */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                    required
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.first_name || '—'}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                    required
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.last_name || '—'}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                    placeholder="+91xxxxxxxxxx"
                    required
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.phone_number || 'Not set'}</p>
                )}
                {isEditing && formData.phone_number && !/^\+?\d{9,15}$/.test(formData.phone_number) && (
                  <p className="text-red-500 text-xs mt-1">Enter 9-15 digits</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                    required
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {profile.date_of_birth
                      ? new Date(profile.date_of_birth).toLocaleDateString('en-IN')
                      : 'Not set'}
                  </p>
                )}
              </div>

              {/* Age (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                <p className="text-gray-900 font-medium">{profile.age || '—'}</p>
              </div>

              {/* Full Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Full Address <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none resize-none"
                    placeholder="House name, street, city..."
                    required
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-line font-medium">
                    {profile.address || 'Not set'}
                  </p>
                )}
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="district"
                    value={formData.district || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                    required
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.district || '—'}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                    required
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.state || '—'}</p>
                )}
              </div>

              {/* Pin Code */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Pin Code <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="pin_code"
                    value={formData.pin_code ?? ''}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                    placeholder="6xxxxxxxxx"
                    required
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.pin_code || '—'}</p>
                )}
                {isEditing && formData.pin_code && formData.pin_code.toString().length !== 6 && (
                  <p className="text-red-500 text-xs mt-1">Pin code must be 6 digits</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}