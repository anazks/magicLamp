import React, { useState, useEffect } from "react";
import { listServices, makeRequest } from "../../Api/Service";

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
  service_details: { description: string };
  address: string;
  latitude: string;
  longitude: string;
}

// ────────────────────────────────────────────────
// Custom Toast Component (same style as your Login page)
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
    <div className={`fixed top-6 right-6 z-50 min-w-[320px] border rounded-xl shadow-xl p-4 ${bgColor} animate-fadeInUp`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
          {type === 'success' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className={`text-base font-medium ${textColor}`}>{message}</p>
        </div>
        <button onClick={onClose} className={`text-${type === 'success' ? 'green' : 'red'}-600 hover:opacity-70`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-progress`}></div>
    </div>
  );
};

// ────────────────────────────────────────────────
// Subcategory Modal (minor refinements)
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white p-6 border-b rounded-t-3xl flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-indigo-900">Select Service</h2>
            <p className="text-slate-600 mt-1">{category.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-5">
          {category.subcategories.map(sub => (
            <button
              key={sub.id}
              onClick={() => onSelect(sub)}
              className="group bg-white border rounded-2xl overflow-hidden hover:shadow-xl hover:border-indigo-400 transition-all"
            >
              <div className="aspect-square relative">
                {sub.image ? (
                  <img src={sub.image} alt={sub.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-4xl font-bold text-indigo-300">
                    {sub.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-4 text-center">
                <h4 className="font-semibold text-slate-800 group-hover:text-indigo-700">{sub.name}</h4>
                {sub.service_charge && (
                  <p className="text-sm text-emerald-600 font-medium mt-1">₹{sub.service_charge}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Booking Modal (with toast support)
// ────────────────────────────────────────────────
function BookingModal({
  category,
  subcategory,
  onClose,
  onSubmit,
  showToast,
}: {
  category: ServiceCategory;
  subcategory: SubCategory | null;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [formData, setFormData] = useState<BookingFormData>({
    mobile_number: "",
    customer_name: "",
    category: category.id,
    subcategory: subcategory?.id || null,
    service_details: { description: "" },
    address: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location not supported");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setFormData(p => ({ ...p, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }));
        setLocationLoading(false);
      },
      () => {
        setLocationError("Location access denied");
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mobile_number || !formData.address || !formData.latitude) {
      showToast("Please fill required fields and allow location", "error");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      showToast("Booking submitted successfully!", "success");
      onClose();
    } catch {
      showToast("Failed to submit booking. Try again.", "error");
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-indigo-900">Book {category.name}</h2>
            {subcategory && <p className="text-slate-600">{subcategory.name}</p>}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name & Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mobile <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
              placeholder="Full service address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Details</label>
            <textarea
              name="service_description"
              value={formData.service_details.description}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
              placeholder="Describe what you need..."
            />
            <p className="text-xs text-slate-500 text-right mt-1">
              {formData.service_details.description.length}/500
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl">
            {locationLoading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                <span>Fetching location...</span>
              </div>
            ) : formData.latitude ? (
              <div className="text-green-700 font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 10a5 5 0 1110 0v.5a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5V10z" clipRule="evenodd" />
                </svg>
                Location captured
              </div>
            ) : (
              <div className="text-red-600 flex items-center justify-between">
                <span>{locationError || "Location required"}</span>
                <button type="button" onClick={getLocation} className="text-indigo-600 underline text-sm">
                  Retry
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.latitude}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" className="opacity-75" />
                  </svg>
                  Booking...
                </>
              ) : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Main Service Page
// ────────────────────────────────────────────────
export default function Service() {
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listServices();
      const active = (data || []).filter((s: ServiceCategory) => s.is_active);
      setServices(active);
    } catch (err: any) {
      setError("Failed to load services. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const handleBookingSubmit = async (data: BookingFormData) => {
    try {
      await makeRequest(data);
      showToast("Booking submitted successfully!", "success");
      setShowBookingModal(false);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } catch (err) {
      showToast("Failed to submit booking. Please try again.", "error");
      console.error(err);
    }
  };

  const handleCloseModals = () => {
    setShowSubcategoryModal(false);
    setShowBookingModal(false);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Oops!</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={fetchServices}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Container */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20 relative overflow-hidden">
        {/* Background orbs */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-20 animate-pulse-slow delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          {/* <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-indigo-800 to-blue-900 bg-clip-text text-transparent">
            Our Services
          </h1>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Professional solutions for every need – fast, reliable, and trusted.
          </p> */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((category) => (
              <div
                key={category.id}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-slate-100"
                onClick={() => handleCategoryClick(category)}
              >
                {/* Image - prominent */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                      <span className="text-6xl font-bold text-indigo-300/50">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Title & info at bottom */}
                <div className="p-5 text-center">
                  <h3 className="text-xl font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                    {category.name}
                  </h3>

                  {category.service_charge && (
                    <p className="mt-2 text-sm font-medium text-emerald-600">
                      From ₹{category.service_charge}
                    </p>
                  )}

                  {category.subcategories?.length > 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      {category.subcategories.length} options
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
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
          onSubmit={handleBookingSubmit}
          showToast={showToast}
        />
      )}
    </>
  );
}