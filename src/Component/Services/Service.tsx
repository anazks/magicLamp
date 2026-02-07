import React, { useState, useEffect } from "react";
import { listServices, makeRequest } from "../../Api/Service";
import { profileDetails } from "../../Api/Auth";
import Loader from "../Loader/Loader";

// ────────────────────────────────────────────────
// Interfaces (unchanged)
// ────────────────────────────────────────────────
interface SubCategory {
  id: number;
  category: number;
  name: string;
  image?: string | null;
  service_charge?: string;
  is_active: boolean;
}

interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string | null;
  image?: string | null;
  service_charge?: string;
  is_active: boolean;
  subcategories: SubCategory[];
}

interface BookingFormData {
  mobile_number: string;
  customer_name: string;
  category: number | null;
  subcategory: number | null;
  service_details: {
    description: string;
  };
  address: string;
  latitude: string;
  longitude: string;
}

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  phone_number: string;
  address: string | null;
  age: number | null;
  date_of_birth: string | null;
  district: string;
  pin_code: number | null;
  state: string;
  profile_picture: string | null;
}

// ────────────────────────────────────────────────
// Toast Component (unchanged)
// ────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] animate-slide-down">
      <div className={`flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg border backdrop-blur-sm ${bgColor}`}>
        {type === 'success' ? (
          <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
        <p className={`font-medium text-sm sm:text-base ${textColor}`}>{message}</p>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────
// Confirmation Popup (unchanged)
// ────────────────────────────────────────────────
function ConfirmationPopup({
  formData,
  categoryName,
  subcategoryName,
  onConfirm,
  onCancel,
  loading,
}: {
  formData: BookingFormData;
  categoryName: string;
  subcategoryName: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10001] p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            Review & Confirm Booking
          </h3>

          <div className="space-y-5 mb-8 text-sm sm:text-base">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-slate-500 font-medium">Name</p>
                <p className="mt-1">{formData.customer_name || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Mobile</p>
                <p className="mt-1">{formData.mobile_number || "—"}</p>
              </div>
            </div>

            <div>
              <p className="text-slate-500 font-medium">Service</p>
              <p className="mt-1 font-medium">
                {categoryName}
                {subcategoryName && ` → ${subcategoryName}`}
              </p>
            </div>

            <div>
              <p className="text-slate-500 font-medium">Address</p>
              <p className="mt-1">{formData.address || "—"}</p>
            </div>

            {formData.service_details.description && (
              <div>
                <p className="text-slate-500 font-medium">Service Details / Requirements</p>
                <p className="mt-1 whitespace-pre-wrap">{formData.service_details.description}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <p className="text-slate-500 font-medium">Location</p>
              <p className="mt-1 text-green-700">
                {formData.latitude && formData.longitude
                  ? `Captured (${parseFloat(formData.latitude).toFixed(5)}, ${parseFloat(formData.longitude).toFixed(5)})`
                  : "Not captured"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-slate-700 font-medium rounded-xl transition disabled:opacity-60"
            >
              Cancel & Edit
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" className="opacity-75" />
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Booking"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Subcategory Modal (unchanged)
// ────────────────────────────────────────────────
function SubcategoryModal({
  category,
  onSelect,
  onClose,
}: {
  category: ServiceCategory;
  onSelect: (subcategory: SubCategory | null) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Select Service</h2>
            <p className="text-blue-100 text-sm sm:text-base mt-1">{category.name}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
          {category.subcategories.map((sub) => (
            <div
              key={sub.id}
              onClick={() => onSelect(sub)}
              className="group bg-white/90 backdrop-blur-sm border border-blue-100 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                {sub.image ? (
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl sm:text-3xl font-bold text-blue-400">
                      {sub.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors text-sm sm:text-base">
                    {sub.name}
                  </h3>
                  {sub.service_charge && (
                    <p className="text-emerald-600 font-medium mt-1 text-xs sm:text-sm">
                      ₹{sub.service_charge}
                    </p>
                  )}
                </div>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 group-hover:text-blue-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Booking Modal (unchanged)
// ────────────────────────────────────────────────
function BookingModal({
  category,
  subcategory,
  onClose,
  showToast,
  latitude,
  longitude,
  locationError,
  retryLocation,
  initialName,
  initialMobile,
  onMobileSaved,
}: {
  category: ServiceCategory;
  subcategory: SubCategory | null;
  onClose: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
  latitude: string;
  longitude: string;
  locationError: string | null;
  retryLocation: () => void;
  initialName: string;
  initialMobile: string;
  onMobileSaved: (newMobile: string) => void;
}) {
  const [formData, setFormData] = useState<BookingFormData>({
    mobile_number: initialMobile,
    customer_name: initialName,
    category: category.id,
    subcategory: subcategory?.id || null,
    service_details: { description: "" },
    address: "",
    latitude: latitude,
    longitude: longitude,
  });

  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    setFormData(prev => ({ ...prev, latitude, longitude }));
  }, [latitude, longitude]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mobile_number || !formData.address || !formData.latitude) {
      showToast("Please fill required fields and allow location access", "error");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setShowConfirmation(false);
    setLoading(true);

    try {
       let response =  await makeRequest(formData);
        console.log('Booking request response:', response);
      if (!initialMobile && formData.mobile_number) {
        onMobileSaved(formData.mobile_number);
      }

      showToast("Booking submitted successfully!", "success");
      onClose();
    } catch (err: any) {
      showToast(err.message || "Failed to submit booking. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "service_description") {
      setFormData(p => ({ ...p, service_details: { description: value } }));
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[9999]"
        onClick={onClose}
      >
        <div
          className="bg-white w-full sm:max-w-2xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 flex justify-between items-start sticky top-0 z-20">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Book {category.name}
              </h2>
              {subcategory && (
                <p className="text-blue-100 text-sm sm:text-base mt-1">
                  {subcategory.name}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition p-2 -mt-2 -mr-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            <form id="booking-form" onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 pb-20 sm:pb-24">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mobile {initialMobile ? "" : "*"}
                </label>
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  required={!initialMobile}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="10-digit mobile number"
                />
                {initialMobile && (
                  <p className="text-xs text-slate-500 mt-1">Using registered number</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="Your complete address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Service Details</label>
                <textarea
                  name="service_description"
                  value={formData.service_details.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                  placeholder="Describe what you need..."
                />
                <p className="text-xs text-slate-500 text-right mt-1">
                  {formData.service_details.description.length}/500
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-100">
                {latitude && longitude ? (
                  <div className="text-green-700 font-medium flex items-center gap-2 text-sm sm:text-base">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 10a5 5 0 1110 0v.5a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5V10z" clipRule="evenodd" />
                    </svg>
                    Location captured
                  </div>
                ) : locationError ? (
                  <div className="text-red-600 flex items-center justify-between text-sm sm:text-base">
                    <span>{locationError}</span>
                    <button
                      type="button"
                      onClick={retryLocation}
                      className="text-blue-600 underline text-xs sm:text-sm hover:text-blue-800"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-blue-700">
                    <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    Fetching location...
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 border-t border-blue-500/30 p-4 sm:p-6 sticky bottom-0 z-20">
            <div className="flex gap-3 sm:gap-4 max-w-md mx-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-lg sm:rounded-xl hover:bg-white/20 transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="booking-form"
                disabled={loading || !latitude || !longitude || (!initialMobile && !formData.mobile_number)}
                className="flex-1 py-2.5 sm:py-3 bg-white text-blue-600 rounded-lg sm:rounded-xl hover:bg-blue-50 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base font-semibold"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-blue-600" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" className="opacity-75" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Review & Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <ConfirmationPopup
          formData={formData}
          categoryName={category.name}
          subcategoryName={subcategory?.name ?? null}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmation(false)}
          loading={loading}
        />
      )}
    </>
  );
}

// ────────────────────────────────────────────────
// Main Service Component – with safe profile fetch
// ────────────────────────────────────────────────
export default function Service() {
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Location states
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // 1. Check if user is logged in (has access token)
        const accessToken = localStorage.getItem("accessToken");

        // 2. Fetch profile ONLY if token exists
        if (accessToken) {
          try {
            const profileRes = await profileDetails();
            if (profileRes) {
              const userData = profileRes as UserProfile;
              setProfile(userData);
              localStorage.setItem("userProfile", JSON.stringify(userData));
            }
          } catch (profileErr) {
            console.warn("Profile fetch failed (possibly not logged in or token expired):", profileErr);
            // Do NOT set error here — just skip profile (treat as guest)
            setProfile(null);
          }
        } else {
          console.log("No access token found → skipping profile fetch");
          setProfile(null);
        }

        // 3. Always fetch services (public API)
        const servicesData = await listServices();
        const activeServices = (servicesData?.results || []).filter(
          (s: ServiceCategory) => s.is_active
        );
        setServices(activeServices);
      } catch (err: any) {
        console.error("Failed to load services:", err);
        setError("Failed to load services. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
    getLocation();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toString());
        setLongitude(pos.coords.longitude.toString());
        setLocationError(null);
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(
          err.code === 1 ? "Location access was denied" : "Unable to get location"
        );
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSaveMobile = (newMobile: string) => {
    if (!newMobile || !profile) return;

    const updated = { ...profile, phone_number: newMobile };
    setProfile(updated);
    localStorage.setItem("userProfile", JSON.stringify(updated));
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleCategoryClick = (category: ServiceCategory) => {
    setSelectedCategory(category);
    if (category.subcategories?.length) {
      setShowSubcategoryModal(true);
    } else {
      setSelectedSubcategory(null);
      setShowBookingModal(true);
    }
  };

  const handleSubcategorySelect = (sub: SubCategory | null) => {
    setSelectedSubcategory(sub);
    setShowSubcategoryModal(false);
    setShowBookingModal(true);
  };

  const handleCloseModals = () => {
    setShowSubcategoryModal(false);
    setShowBookingModal(false);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-30"></div>
            <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Oops!</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const initialName = profile?.first_name || "";
  const initialMobile = profile?.phone_number || "";

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-blue-200/20 animate-float"
              style={{
                width: `${Math.random() * 20 + 5}px`,
                height: `${Math.random() * 20 + 5}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 15}s`,
              }}
            />
          ))}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-200/30 to-cyan-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-200/20 to-purple-200/30 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          {/* Location status */}
          <div className="mb-6 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 text-sm">
            {locationLoading ? (
              <div className="flex items-center gap-2 text-blue-700">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                Fetching your location...
              </div>
            ) : latitude && longitude ? (
              <div className="text-green-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 10a5 5 0 1110 0v.5a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5V10z" clipRule="evenodd" />
                </svg>
                Location ready
              </div>
            ) : (
              <div className="flex items-center justify-between text-red-600">
                <span>{locationError || "Location not available"}</span>
                <button
                  onClick={getLocation}
                  className="text-blue-600 underline hover:text-blue-800 text-xs"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {services.map((category) => (
              <div
                key={category.id}
                className="group bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-blue-100 hover:border-blue-300"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-300 group-hover:text-blue-400 transition-colors">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4 text-center bg-gradient-to-b from-white to-blue-50/50">
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                    {category.name}
                  </h3>
                  {category.service_charge && (
                    <p className="mt-1 text-xs sm:text-sm font-medium text-emerald-600">
                      From ₹{category.service_charge}
                    </p>
                  )}
                  {category.subcategories?.length > 0 && (
                    <p className="mt-1 text-xs text-blue-600 font-medium">
                      {category.subcategories.length} options
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSubcategoryModal && selectedCategory && (
        <SubcategoryModal
          category={selectedCategory}
          onSelect={handleSubcategorySelect}
          onClose={handleCloseModals}
        />
      )}

      {showBookingModal && selectedCategory && (
        <BookingModal
          category={selectedCategory}
          subcategory={selectedSubcategory}
          onClose={handleCloseModals}
          showToast={showToast}
          latitude={latitude}
          longitude={longitude}
          locationError={locationError}
          retryLocation={getLocation}
          initialName={initialName}
          initialMobile={initialMobile}
          onMobileSaved={handleSaveMobile}
        />
      )}

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-float { animation: float 20s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}