import React, { useState, useEffect } from 'react';
import { ServiceSubCategory, getAllServiceCategory } from '../../Api/Service';

interface AddSubCategoryProps {
  onClose?: () => void;
  onSuccess?: (newSubCategory: any) => void;
}

export default function AddSubCategory({ onClose, onSuccess }: AddSubCategoryProps) {
  const [formData, setFormData] = useState({
    category: '',           // string from <select> (id as string)
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

  // Fetch all service categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setApiError(null);

        const response = await getAllServiceCategory();

        // Handle different possible response shapes
        let categoryList = [];
        if (response?.data) {
          categoryList = response.data;
        } else if (Array.isArray(response)) {
          categoryList = response;
        } else {
          throw new Error('Unexpected response format from getAllServiceCategory');
        }

        // Make sure each item has id & name
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
        setApiError(
          err.response?.data?.message ||
          err.message ||
          'Could not load categories. Please try again later.'
        );
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

    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    if (formData.service_charge) {
      const charge = Number(formData.service_charge);
      if (isNaN(charge) || charge < 0) {
        newErrors.service_charge = 'Enter a valid non-negative amount';
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
      submitData.append('category', formData.category); // string "1", "2", etc.
      submitData.append('name', formData.name.trim());
      submitData.append('is_active', formData.is_active ? 'true' : 'false');

      if (formData.service_charge.trim()) {
        submitData.append('service_charge', formData.service_charge.trim());
      }
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      // Create subcategory - note: ServiceSubCategory should be a function that accepts FormData
      // The exact implementation depends on your API structure
      const response = await ServiceSubCategory(submitData); // Removed second argument

      const created = response?.data || response;

      alert('Subcategory added successfully!');
      onSuccess?.(created);
      onClose?.();

    } catch (error: any) {
      console.error('Error creating subcategory:', error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.category?.[0] ||
        'Failed to add subcategory. Please check your input and try again.';

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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>

          {loadingCategories ? (
            <div className="text-gray-500 py-2">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-red-600 py-2">No categories available</div>
          ) : (
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={submitting}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}

          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            maxLength={100}
            placeholder="e.g. Bike Taxi, Home-made Meals, AC Repair"
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

        {/* Service Charge */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
            Subcategory Image
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <div
                className={`w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition ${
                  submitting ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <span className="text-2xl text-gray-400">+</span>
                    <span className="text-xs text-gray-500 mt-1 text-center px-2">
                      Upload Image
                    </span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={submitting}
              />
            </label>

            {previewUrl && (
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl(null);
                }}
                disabled={submitting}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Recommended: 512×512 px or larger, PNG/JPG
          </p>
        </div>

        {/* Is Active */}
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
        <div className="flex justify-end gap-4 pt-4 border-t">
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
            disabled={submitting || loadingCategories || categories.length === 0}
            className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 min-w-[140px] justify-center ${
              submitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                <span>Saving...</span>
              </>
            ) : (
              'Add Subcategory'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}