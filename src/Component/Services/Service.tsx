import React, { useState, useEffect, useRef } from "react";
import { listServices, makeRequest } from "../../Api/Service";
import { profileDetails } from "../../Api/Auth";
import Loader from "../Loader/Loader";

// ────────────────────────────────────────────────
// Interfaces
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
  images: File[];
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
// Toast Component
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
// Image Preview Modal
// ────────────────────────────────────────────────
interface ImagePreviewModalProps {
  images: { file: File; previewUrl: string }[];
  onClose: () => void;
  onRemove: (index: number) => void;
}

const ImagePreviewModal = ({ images, onClose, onRemove }: ImagePreviewModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10002] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold">Image Preview ({images.length})</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img.previewUrl}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => onRemove(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────
// Confirmation Popup
// ────────────────────────────────────────────────
function ConfirmationPopup({
  formData,
  categoryName,
  subcategoryName,
  onConfirm,
  onCancel,
  loading,
  imagePreviews,
}: {
  formData: BookingFormData;
  categoryName: string;
  subcategoryName: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  imagePreviews: { file: File; previewUrl: string }[];
}) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10001] p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto"
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

            {imagePreviews.length > 0 && (
              <div>
                <p className="text-slate-500 font-medium">Images ({imagePreviews.length})</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {imagePreviews.slice(0, 3).map((img, index) => (
                    <img
                      key={index}
                      src={img.previewUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  ))}
                  {imagePreviews.length > 3 && (
                    <div className="h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">+{imagePreviews.length - 3} more</span>
                    </div>
                  )}
                </div>
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
// Subcategory Modal
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
                      service Charge form ₹{sub.service_charge}
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
// Booking Modal – with saved user info feature
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
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState<{ file: File; previewUrl: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Saved user info feature ────────────────────────────────
  const [useSavedInfo, setUseSavedInfo] = useState<boolean | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const SAVED_BOOKING_KEY = "lastBookingPersonalInfo";

  useEffect(() => {
    const saved = localStorage.getItem(SAVED_BOOKING_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<Pick<BookingFormData, "customer_name" | "mobile_number" | "address">>;

        setFormData(prev => ({
          ...prev,
          customer_name: parsed.customer_name || prev.customer_name || "",
          mobile_number: parsed.mobile_number || prev.mobile_number || "",
          address: parsed.address || prev.address || "",
        }));

        // Auto-suggest using saved data if we have at least address + phone
        if (parsed.address?.trim() && parsed.mobile_number?.trim()) {
          setUseSavedInfo(true);
        } else {
          setUseSavedInfo(false);
        }
      } catch (err) {
        console.warn("Cannot parse saved booking info", err);
        setUseSavedInfo(false);
      }
    } else {
      setUseSavedInfo(false);
    }
  }, []);

  const savePersonalInfo = () => {
    const infoToSave = {
      customer_name: formData.customer_name.trim(),
      mobile_number: formData.mobile_number.trim(),
      address: formData.address.trim(),
    };

    // Save only if there's meaningful data
    if (infoToSave.customer_name || infoToSave.mobile_number || infoToSave.address) {
      localStorage.setItem(SAVED_BOOKING_KEY, JSON.stringify(infoToSave));
    }
  };

  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    setFormData(prev => ({ ...prev, latitude, longitude }));
  }, [latitude, longitude]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mobile_number.trim() || !formData.address.trim() || !formData.latitude) {
      showToast("Please fill required fields and allow location access", "error");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setShowConfirmation(false);
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('mobile_number', formData.mobile_number.trim());
      formDataToSend.append('customer_name', formData.customer_name.trim());
      formDataToSend.append('category', formData.category?.toString() || '');
      if (formData.subcategory) {
        formDataToSend.append('subcategory', formData.subcategory.toString());
      }
      formDataToSend.append(
        'service_details',
        JSON.stringify({ description: formData.service_details.description.trim() || '' })
      );
      formDataToSend.append('address', formData.address.trim());
      formDataToSend.append('latitude', formData.latitude);
      formDataToSend.append('longitude', formData.longitude);

      formData.images.forEach(image => {
        formDataToSend.append('images', image, image.name);
      });

      await makeRequest(formDataToSend);

      // Save after successful submission
      savePersonalInfo();

      if (!initialMobile && formData.mobile_number.trim()) {
        onMobileSaved(formData.mobile_number.trim());
      }

      showToast("Booking submitted successfully!", "success");
      onClose();
    } catch (err: any) {
      console.error('Booking error:', err);
      let errorMessage = "Failed to submit booking. Try again.";
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          errorMessage = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ') || errorMessage;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      showToast(errorMessage, "error");
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

  const handleUseSaved = () => {
    setUseSavedInfo(true);
    setShowEditForm(false);
  };

  const handleChangeInfo = () => {
    setUseSavedInfo(false);
    setShowEditForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxImages = 10;

    if (formData.images.length + files.length > maxImages) {
      showToast(`Maximum ${maxImages} images allowed`, 'error');
      return;
    }

    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`${file.name} exceeds 5MB limit`, 'error');
        return;
      }

      const previewUrl = URL.createObjectURL(file);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, file]
      }));

      setImagePreviews(prev => [...prev, { file, previewUrl }]);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index].previewUrl);

    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));

    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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

          <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
            {/* Saved info prompt */}
            {useSavedInfo === null && (formData.customer_name.trim() || formData.mobile_number.trim() || formData.address.trim()) ? (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
                <p className="font-semibold text-blue-800 mb-3 text-lg">
                  We found your previous booking details
                </p>
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  {formData.customer_name.trim() && <p><strong>Name:</strong> {formData.customer_name}</p>}
                  {formData.mobile_number.trim() && <p><strong>Mobile:</strong> {formData.mobile_number}</p>}
                  {formData.address.trim() && <p><strong>Address:</strong> {formData.address}</p>}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleUseSaved}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-5 rounded-xl transition"
                  >
                    Use these details
                  </button>
                  <button
                    type="button"
                    onClick={handleChangeInfo}
                    className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-5 rounded-xl transition"
                  >
                    Use different details
                  </button>
                </div>
              </div>
            ) : null}

            <form id="booking-form" onSubmit={handleFormSubmit} className="space-y-5">
              {/* Editable fields */}
              {(useSavedInfo === false || showEditForm) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                      placeholder="Your full name"
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
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                      placeholder="Your complete address"
                    />
                  </div>
                </>
              )}

              {/* Read-only summary when using saved info */}
              {useSavedInfo === true && !showEditForm && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="font-semibold text-green-800">Using saved information</p>
                  </div>
                  <div className="space-y-2 text-sm text-gray-800">
                    {formData.customer_name.trim() && <p><strong>Name:</strong> {formData.customer_name}</p>}
                    {formData.mobile_number.trim() && <p><strong>Mobile:</strong> {formData.mobile_number}</p>}
                    {formData.address.trim() && <p><strong>Address:</strong> {formData.address}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEditForm(true)}
                    className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                  >
                    Edit these details
                  </button>
                </div>
              )}

              {/* Service Details */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Service Details</label>
                <textarea
                  name="service_description"
                  value={formData.service_details.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
                  placeholder="Describe what you need..."
                />
                <p className="text-xs text-slate-500 text-right mt-1">
                  {formData.service_details.description.length}/500
                </p>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Images (Optional)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-5 border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors flex flex-col items-center justify-center gap-2"
                  >
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-green-600 font-medium">Upload Images</span>
                    <span className="text-sm text-slate-500">max 5MB each, max 10 images</span>
                  </button>

                  {imagePreviews.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                          {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''} selected
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowImagePreview(true)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View All
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.slice(0, 3).map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img.previewUrl}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location status */}
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100">
                {latitude && longitude ? (
                  <div className="text-green-700 font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 10a5 5 0 1110 0v.5a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5V10z" clipRule="evenodd" />
                    </svg>
                    Location captured
                  </div>
                ) : locationError ? (
                  <div className="text-red-600 flex items-center justify-between">
                    <span>{locationError}</span>
                    <button
                      type="button"
                      onClick={retryLocation}
                      className="text-blue-600 underline text-sm hover:text-blue-800"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-blue-700">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    Fetching location...
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 border-t border-blue-500/30 p-4 sm:p-6 sticky bottom-0 z-20">
            <div className="flex gap-4 max-w-md mx-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/20 transition text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="booking-form"
                disabled={loading || !latitude || !longitude || (!initialMobile && !formData.mobile_number.trim())}
                className="flex-1 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition disabled:opacity-50 flex items-center justify-center gap-2 text-base font-semibold shadow-md"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
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

      {showImagePreview && (
        <ImagePreviewModal
          images={imagePreviews}
          onClose={() => setShowImagePreview(false)}
          onRemove={removeImage}
        />
      )}

      {showConfirmation && (
        <ConfirmationPopup
          formData={formData}
          categoryName={category.name}
          subcategoryName={subcategory?.name ?? null}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmation(false)}
          loading={loading}
          imagePreviews={imagePreviews}
        />
      )}
    </>
  );
}

// ────────────────────────────────────────────────
// Main Component (Service)
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

  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
          try {
            const profileRes = await profileDetails();
            if (profileRes) {
              const userData = profileRes as UserProfile;
              setProfile(userData);
              localStorage.setItem("userProfile", JSON.stringify(userData));
            }
          } catch (profileErr) {
            console.warn("Profile fetch failed:", profileErr);
          }
        }

        const servicesData = await listServices();
        // Since listServices() now returns response.data?.results || response.data
        const servicesList = Array.isArray(servicesData) ? servicesData : (servicesData?.results || []);
        
        const activeServices = servicesList.filter(
          (s: ServiceCategory) => s.is_active
        );
        setServices(activeServices);
      } catch (err) {
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
          err.code === 1 ? "Location access denied" : "Unable to get location"
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

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Oops!</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl"
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
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-12">
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
                      service Charge form ₹{category.service_charge}
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
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
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