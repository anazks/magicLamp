import React, { useState } from 'react';
import { ServiceCategory } from '../../Api/Service';
import { FaPlus, FaTimes, FaImage, FaSortAmountDown, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

interface AddCategoryProps {
  onClose?: () => void;
  onSuccess?: (newCategory: any) => void;
}

export default function AddCategory({ onClose, onSuccess }: AddCategoryProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    service_charge: '',
    is_active: true,
    order: '0',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'order') {
      if (value === '' || /^\d+$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }

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

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    if (formData.service_charge) {
      const charge = Number(formData.service_charge);
      if (isNaN(charge) || charge < 0) {
        newErrors.service_charge = 'Please enter a valid amount';
      }
    }

    if (formData.order !== '') {
      const orderNum = Number(formData.order);
      if (!Number.isInteger(orderNum) || orderNum < 0) {
        newErrors.order = 'Must be a non-negative number';
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
      submitData.append('name', formData.name.trim());
      if (formData.description.trim()) {
        submitData.append('description', formData.description.trim());
      }
      if (formData.service_charge.trim()) {
        submitData.append('service_charge', formData.service_charge.trim());
      }
      submitData.append('is_active', formData.is_active.toString());

      if (formData.order !== '') {
        submitData.append('order', formData.order);
      }

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const response = await ServiceCategory(submitData);
      const createdCategory = response.data || response;

      onSuccess?.(createdCategory);
      onClose?.();

    } catch (error: any) {
      console.error('Error adding category:', error);
      let message = 'Failed to add category. Please try again.';

      if (error.response) {
        message =
          error.response.data?.message ||
          error.response.data?.detail ||
          error.response.data?.non_field_errors?.[0] ||
          error.response.data?.name?.[0] ||
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
          {/* Left Column: Essential Info */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="e.g. Transportation"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Display Order
                </label>
                <div className="relative">
                  <FaSortAmountDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    placeholder="0"
                    disabled={submitting}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <p className="mt-1 text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Lower = Appears first</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Charge (₹)
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

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe this category..."
                disabled={submitting}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Right Column: Visualization & Status */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Category Image
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
              {errors.image && <p className="mt-1 text-xs text-red-600 font-medium">{errors.image}</p>}
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
            disabled={submitting}
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
                <span>Create Category</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}