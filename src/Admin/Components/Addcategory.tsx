import React, { useState } from 'react';
import { ServiceCategory } from '../../Api/Service'; // Adjust path to your actual API service

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
      // Basic client-side validation
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors((prev) => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }

      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Clear any previous image error
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
        newErrors.service_charge = 'Please enter a valid non-negative amount';
      }
    }

    // Optional: uncomment if image should be required
    // if (!imageFile) {
    //   newErrors.image = 'Category image is required';
    // }

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

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      // ────────────────────────────────────────────────
      //               REAL API CALL
      // ────────────────────────────────────────────────
      // Most common pattern: axios instance .post()
      const response = await ServiceCategory( submitData);

      // Alternative patterns (uncomment if your API is structured differently):
      // const response = await ServiceCategory.post('/api/categories/', submitData, { ... });
      // const response = await ServiceCategory.create(submitData);
      // const response = await ServiceCategory.categories.create(submitData);

      const createdCategory = response.data || response;

      alert('Category added successfully!');
      onSuccess?.(createdCategory);
      onClose?.();

    } catch (error: any) {
      console.error('Full error object:', error);

      let message = 'Failed to add category. Please try again.';

      if (error.response) {
        // 403 → most likely auth/permission issue
        if (error.response.status === 403) {
          message = 'Permission denied (403). You may need admin access or to log in again.';
        } else if (error.response.status === 401) {
          message = 'Unauthorized (401). Please log in.';
        }

        message =
          error.response.data?.message ||
          error.response.data?.detail ||
          error.response.data?.non_field_errors?.[0] ||
          error.response.data?.image?.[0] ||
          error.response.data?.name?.[0] ||
          JSON.stringify(error.response.data) ||
          message;
      } else if (error.request) {
        message = 'No response from server. Check your internet connection or server status.';
      }

      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            maxLength={100}
            placeholder="e.g. Transportation, Food Delivery, Home Cleaning"
            disabled={submitting}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          <p className="mt-1 text-xs text-gray-500">
            {formData.name.length}/100 characters
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Brief description of this category (optional)"
            disabled={submitting}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Service Charge */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Service Charge (₹)
          </label>
          <input
            type="number"
            name="service_charge"
            value={formData.service_charge}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="0.00 (optional)"
            disabled={submitting}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.service_charge ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.service_charge && (
            <p className="mt-1 text-sm text-red-600">{errors.service_charge}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Image
          </label>
          <div className="flex items-start gap-6">
            {/* Preview Area */}
            <label className="cursor-pointer">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition relative overflow-hidden">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-3xl text-gray-400">+</span>
                    <span className="text-xs text-gray-500 mt-2 text-center px-4">
                      Click to upload
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={submitting}
                />
              </div>
            </label>

            {/* Help text */}
            <div className="text-sm text-gray-500">
              <p>Recommended: square image (512×512 or larger)</p>
              <p>PNG, JPG, max 5MB</p>
              {errors.image && (
                <p className="text-red-600 mt-1">{errors.image}</p>
              )}
            </div>
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            disabled={submitting}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Active (visible to users)
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-5 border-t">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 min-w-[160px] justify-center ${
              submitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                <span>Saving...</span>
              </>
            ) : (
              'Add Category'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}