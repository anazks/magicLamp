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
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCity,
  FaGlobe,
  FaMapPin,
  FaCheckCircle,
  FaInfoCircle,
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
        const data = await profileDetails();
        setProfile(data);
        setFormData(data);
      } catch (err: any) {
        showToast('Failed to load profile.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === '' ? undefined : value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
  };



  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);
    console.log("Submitting profile update with data:", formData);
    
    try {
      const updated = await updateProfile(formData);
      console.log("Profile update success:", updated);
      setProfile(updated);
      setFormData(updated);
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      console.error("Profile update error detail:", err.response?.data);
      const msg = err.response?.data?.detail || 
                  err.response?.data?.message || 
                  Object.values(err.response?.data || {})[0] || 
                  'Update failed';
      setSaveError(String(msg));
      showToast('Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    ['token', 'refreshToken', 'accessToken'].forEach(k => localStorage.removeItem(k));
    window.location.href = '/';
  };

  if (isGuest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-xs w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mx-auto">
            <FaUser size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Guest Access</h1>
          <button onClick={() => navigate('/login')} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-md">Log in</button>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';

  return (
    <div className="min-h-screen bg-gray-100 pb-12 animate-fade-in relative">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-base font-bold text-white shadow-md">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">{fullName}</h1>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Member Since 2024</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button
              onClick={() => setIsEditing(!isEditing)}
              className={`p-2 rounded-lg transition-all ${isEditing ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}
              title={isEditing ? "Quit Editing" : "Edit Profile"}
            >
              {isEditing ? <FaTimes size={14} /> : <FaEdit size={14} />}
            </button>
            <button onClick={handleLogout} className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:text-rose-600 border border-gray-100" title="Logout">
              <FaSignOutAlt size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Account Details</h2>
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
              >
                {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaSave />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>

          <div className="p-6">
            {saveError && (
              <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-3 text-rose-700 text-xs animate-shake">
                <FaInfoCircle className="shrink-0" />
                <p className="font-bold">{saveError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {[
                { label: 'First Name', name: 'first_name', icon: FaUser, type: 'text' },
                { label: 'Last Name', name: 'last_name', icon: FaUser, type: 'text' },
                { label: 'Phone', name: 'phone_number', icon: FaPhone, type: 'tel' },
                { label: 'Date of Birth', name: 'date_of_birth', icon: FaCalendarAlt, type: 'date' },
                { label: 'District', name: 'district', icon: FaCity, type: 'text' },
                { label: 'State', name: 'state', icon: FaGlobe, type: 'text' },
                { label: 'Pincode', name: 'pin_code', icon: FaMapPin, type: 'number' },
              ].map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{field.label}</label>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <field.icon size={12} />
                      </span>
                      <input
                        type={field.type}
                        name={field.name}
                        value={(formData as any)[field.name] || ''}
                        onChange={field.name === 'pin_code' ? handleNumberChange : handleInputChange}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold text-gray-800"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-gray-50/50 px-4 py-2.5 rounded-lg border border-gray-50/80">
                      <field.icon size={12} className="text-gray-300" />
                      <span className="text-sm font-bold text-gray-800">
                        {field.name === 'date_of_birth' && (profile as any)[field.name] 
                          ? new Date((profile as any)[field.name]).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric'})
                          : (profile as any)[field.name] || '—'}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* Address (Span full width) */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Address</label>
                {isEditing ? (
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-gray-400"><FaMapMarkerAlt size={12} /></span>
                    <textarea
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold text-gray-800 resize-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-start gap-3 bg-gray-50/50 px-4 py-3 rounded-lg border border-gray-50/80">
                    <FaMapMarkerAlt size={12} className="text-gray-300 mt-0.5" />
                    <span className="text-sm font-bold text-gray-800 leading-relaxed">{profile.address || '—'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Footer Actions */}
        {!isEditing && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase">Age: {profile.age || '—'}</div>
                <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs">
                   <FaCheckCircle size={14} />
                   Profile Sync Active
                </div>
             </div>
             <button
               onClick={() => setIsEditing(true)}
               className="w-full sm:w-auto px-10 py-2.5 bg-gray-900 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
             >
               Modify Account
             </button>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-slide-up px-6 w-full max-w-sm">
          <div className={`p-4 rounded-xl shadow-xl flex items-center justify-between gap-4 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          } text-white`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                {toast.type === 'success' ? <FaCheckCircle size={16} /> : <FaInfoCircle size={16} />}
              </div>
              <p className="text-xs font-bold leading-tight">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)}><FaTimes size={12} className="opacity-60" /></button>
          </div>
        </div>
      )}
    </div>
  );
}