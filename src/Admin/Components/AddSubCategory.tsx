import React, { useState, useEffect } from 'react';
import { ServiceSubCategory, getAllServiceCategory } from '../../Api/Service';
import { FaPlus, FaTimes, FaImage, FaLayerGroup, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

interface AddSubCategoryProps {
  onClose?: () => void;
  onSuccess?: (newSubCategory: any) => void;
}

export default function AddSubCategory({ onClose, onSuccess }: AddSubCategoryProps) {
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    service_charge: '',
    is_active: true,
  });

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setApiError(null);

        const response = await getAllServiceCategory();
        const data = response?.data;
        const categoryList = Array.isArray(data) ? data : (data?.results || []);

        const formatted = categoryList
          .filter((item: any) => item?.id && item?.name)
          .map((item: any) => ({
            id: Number(item.id),
            name: String(item.name),
          }));

        setCategories(formatted);

        if (formatted.length === 0) {
          setApiError('No categories found. Please add a category first.');
        }
      } catch (err: any) {
        console.error('Failed to load categories:', err);
        setApiError('Could not load categories. Please try again later.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      
      setErrors((prev) => {
        const { image, ...rest } = prev;
        return rest;
      });
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.service_charge) {
      const charge = Number(formData.service_charge);
      if (isNaN(charge) || charge < 0) {
        newErrors.service_charge = 'Enter a valid amount';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('category', formData.category);
      submitData.append('name', formData.name.trim());
      submitData.append('is_active', formData.is_active ? 'true' : 'false');

      if (formData.service_charge.trim()) {
        submitData.append('service_charge', formData.service_charge.trim());
      }
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const response = await ServiceSubCategory(submitData);
      const created = response?.data || response;

      onSuccess?.(created);
      onClose?.();

    } catch (error: any) {
      console.error('Error creating subcategory:', error);
      let message = 'Failed to add subcategory. Please try again.';

      if (error.response) {
        message = error.response.data?.message || 
                  error.response.data?.detail || 
                  message;
      }
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {apiError && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 text-sm animate-shake">
          <FaInfoCircle className="flex-shrink-0" />
          <p>{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Parent Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaLayerGroup className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={submitting || loadingCategories}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all appearance-none ${
                    errors.category ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">{loadingCategories ? 'Loading...' : 'Select Category'}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.category && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Subcategory Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="e.g. AC Repair"
                  disabled={submitting}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {formData.name && !errors.name && (
                  <FaCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-sm" />
                )}
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Service Charge (₹)
              </label>
              <input
                type="number"
                name="service_charge"
                value={formData.service_charge}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                disabled={submitting}
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all ${
                  errors.service_charge ? 'border-red-500' : 'border-gray-200'
                }`}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Subcategory Image
              </label>
              <div className="relative group">
                <label className={`block w-full h-56 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                  previewUrl 
                    ? 'border-transparent bg-gray-100 overflow-hidden' 
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-blue-300'
                } ${submitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FaImage className="text-gray-400 text-2xl" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700">Drop your image here</p>
                      <p className="text-xs text-gray-400 mt-1">or click to browse files</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={submitting}
                  />
                </label>

                {previewUrl && !submitting && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white border border-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-500 transition-colors shadow-lg"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                <FaInfoCircle />
                <span>Square PNG/JPG, max 5MB recommended</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    disabled={submitting}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                    formData.is_active ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    formData.is_active ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
                <div className="ml-3 select-none">
                  <p className="text-sm font-bold text-gray-700">Active Status</p>
                  <p className="text-xs text-gray-500">Visible to customers when enabled</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || loadingCategories || categories.length === 0}
            className={`flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all ${
              submitting ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'
            }`}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FaPlus className="text-xs" />
                <span>Add Subcategory</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}