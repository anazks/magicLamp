import React, { useState, useEffect } from 'react';
import { profileDetails, updateProfile } from '../../Api/Auth';

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

  useEffect(() => {
    const fetchProfile = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-800 mb-3">Oops!</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Profile Header with Picture */}
          <div className="px-6 py-10 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                {profile.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-4xl font-bold text-indigo-600 shadow-lg">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Future: Add camera icon for upload */}
              </div>

              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900">{fullName}</h2>
                {profile.age && (
                  <p className="text-lg text-gray-600 mt-1">{profile.age} years old</p>
                )}
                {profile.phone_number && (
                  <p className="text-gray-600 mt-1">+{profile.phone_number}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-800">
                {isEditing ? 'Edit Profile' : 'Personal Details'}
              </h3>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && (
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" className="opacity-75" />
                      </svg>
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name || ''}
                    onChange={handleInputChange}
                    maxLength={30}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.first_name || '—'}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name || ''}
                    onChange={handleInputChange}
                    maxLength={30}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.last_name || '—'}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleInputChange}
                    pattern="\+?[0-9]{9,15}"
                    maxLength={15}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                    placeholder="+91xxxxxxxxxx"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.phone_number || 'Not set'}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{displayDob}</p>
                )}
              </div>

              {/* Age (read-only or calculated?) */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                <p className="text-gray-900 font-medium">{profile.age || '—'}</p>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                    placeholder="House name, street, etc..."
                  />
                ) : (
                  <p className="text-gray-900">{profile.address || 'Not set'}</p>
                )}
              </div>

              {/* District, State, Pin */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">District</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="district"
                    value={formData.district || ''}
                    onChange={handleInputChange}
                    maxLength={20}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                  />
                ) : (
                  <p className="text-gray-900">{profile.district || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state || ''}
                    onChange={handleInputChange}
                    maxLength={20}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                  />
                ) : (
                  <p className="text-gray-900">{profile.state || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Pin Code</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="pin_code"
                    value={formData.pin_code ?? ''}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                    placeholder="6-digit pin code"
                  />
                ) : (
                  <p className="text-gray-900">{profile.pin_code || '—'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Extra Actions */}
        {/* <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium">
            Change Password
          </button>
          <button className="px-8 py-3 border-2 border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition font-medium">
            Logout
          </button>
        </div> */}
      </div>
    </div>
  );
}