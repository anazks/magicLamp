import React, { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaWallet,
  FaClock,
  FaArrowRight,
  FaPlus,
  FaHistory,
  FaTools,
  FaChevronDown,
  FaChevronUp,
  FaTrashAlt,
} from 'react-icons/fa';
import AddCategory from './Addcategory';
import AddSubCategory from './AddSubCategory';
import AddService from './AddService';
import History from './Hostory'; // ← your History component
import { getAllServiceCategory, deleteCategory } from '../../Api/Service';

interface SubCategoryItem {
  id: number;
  name: string;
  description?: string;
  image?: string | null;
  service_charge?: string;
  is_active?: boolean;
}

interface ServiceItem {
  id: number;
  name: string;
  description?: string;
  icon?: string | null;
  image?: string | null;
  service_charge?: string;
  is_active: boolean;
  subcategories: SubCategoryItem[];
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<
    'none' | 'add-category' | 'add-subcategory' | 'add-service' | 'history'
  >('none');

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const stats = {
    totalBookings: 12,
    totalSpend: '₹1,250',
    activeBookings: 2,
  };

  // Fetch categories
  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      setServicesError(null);

      const response = await getAllServiceCategory();
      const data = response?.data || response || [];

      const formatted = data.map((item: any) => ({
        id: item.id,
        name: item.name || 'Unnamed',
        description: item.description,
        icon: item.icon,
        image: item.image,
        service_charge: item.service_charge,
        is_active: item.is_active ?? true,
        subcategories: Array.isArray(item.subcategories) ? item.subcategories : [],
      }));

      setServices(formatted);
    } catch (err: any) {
      console.error('Failed to load services:', err);
      setServicesError('Could not load services. Please try again.');
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const toggleCategory = (categoryId: number) => {
    const service = services.find((s) => s.id === categoryId);
    if (!service || service.subcategories.length === 0) return;

    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const requestDelete = (id: number, name: string) => {
    setShowDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    const { id, name } = showDeleteConfirm;

    try {
      setDeletingId(id);
      await deleteCategory(id);

      alert(`Category "${name}" deleted successfully!`);
      setShowDeleteConfirm(null);

      // Refresh list
      await fetchServices();
    } catch (err: any) {
      console.error('Delete failed:', err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Failed to delete category. Please try again.';
      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const toggleSection = (section: typeof activeSection) => {
    setActiveSection((prev) => (prev === section ? 'none' : section));
  };

  const getStatusBadge = (isActive: boolean) =>
    isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Welcome back, anaz</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl p-5 shadow border border-gray-200">
            <p className="text-sm text-gray-600 font-medium">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
            <div className="mt-3 flex items-center text-sm text-blue-600">
              <FaChartLine className="mr-1.5" /> All time
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow border border-gray-200">
            <p className="text-sm text-gray-600 font-medium">Total Spend</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalSpend}</p>
            <div className="mt-3 flex items-center text-sm text-green-600">
              <FaWallet className="mr-1.5" /> Lifetime
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow border border-gray-200">
            <p className="text-sm text-gray-600 font-medium">Active Now</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeBookings}</p>
            <div className="mt-3 flex items-center text-sm text-yellow-600">
              <FaClock className="mr-1.5" /> In progress
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <button
            onClick={() => toggleSection('add-category')}
            className={`flex flex-col items-center justify-center p-5 rounded-xl shadow transition-all ${
              activeSection === 'add-category' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white hover:bg-blue-50 border border-gray-200'
            }`}
          >
            <FaPlus className="text-2xl mb-2" />
            <span className="font-medium">Add Category</span>
          </button>

          <button
            onClick={() => toggleSection('add-subcategory')}
            className={`flex flex-col items-center justify-center p-5 rounded-xl shadow transition-all ${
              activeSection === 'add-subcategory' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white hover:bg-blue-50 border border-gray-200'
            }`}
          >
            <FaPlus className="text-2xl mb-2" />
            <span className="font-medium">Add Subcategory</span>
          </button>

          {/* Add Service button - commented out in your code, keeping it commented */}
          {/* <button onClick={() => toggleSection('add-service')} ... > */}

          <button
            onClick={() => toggleSection('history')}
            className={`flex flex-col items-center justify-center p-5 rounded-xl shadow transition-all ${
              activeSection === 'history' ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-white hover:bg-indigo-50 border border-gray-200'
            }`}
          >
            <FaHistory className="text-2xl mb-2" />
            <span className="font-medium">View History</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          {/* Add Forms */}
          {activeSection === 'add-category' && (
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-semibold mb-5">Add New Category</h2>
              <AddCategory onClose={() => setActiveSection('none')} />
            </div>
          )}

          {activeSection === 'add-subcategory' && (
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-semibold mb-5">Add New Subcategory</h2>
              <AddSubCategory onClose={() => setActiveSection('none')} />
            </div>
          )}

          {activeSection === 'add-service' && (
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-semibold mb-5">Add New Service</h2>
              <AddService onClose={() => setActiveSection('none')} />
            </div>
          )}

          {/* Main Content – History OR All Services */}
          {activeSection === 'history' ? (
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaHistory className="text-indigo-600" />
                  Service Request History
                </h2>
              </div>
              <History />
            </div>
          ) : (
            // Default view: All Services
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaTools className="text-indigo-600" />
                  All Services
                </h2>
              </div>

              {loadingServices ? (
                <div className="p-10 text-center text-gray-500">Loading services...</div>
              ) : servicesError ? (
                <div className="p-8 text-center text-red-600">{servicesError}</div>
              ) : services.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No services found yet.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {services.map((service) => {
                    const hasSubs = service.subcategories?.length > 0;

                    return (
                      <div key={service.id}>
                        <div
                          className={`px-6 py-4 flex items-center justify-between transition ${
                            hasSubs ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                          }`}
                          onClick={() => hasSubs && toggleCategory(service.id)}
                        >
                          {/* ... same row content as before ... */}
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                              {service.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{service.name}</p>
                              {service.description && (
                                <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">
                                  {service.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right mr-4">
                              <p className="font-semibold text-gray-900">
                                {service.service_charge ? `₹${service.service_charge}` : '—'}
                              </p>
                              <span
                                className={`inline-block px-2.5 py-0.5 mt-1 text-xs font-medium rounded-full ${getStatusBadge(
                                  service.is_active
                                )}`}
                              >
                                {service.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {hasSubs && (
                                <>
                                  {expandedCategory === service.id ? (
                                    <FaChevronUp className="text-gray-500" />
                                  ) : (
                                    <FaChevronDown className="text-gray-500" />
                                  )}
                                </>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestDelete(service.id, service.name);
                                }}
                                disabled={deletingId === service.id || loadingServices}
                                className={`text-red-600 hover:text-red-800 transition p-1 rounded hover:bg-red-50 ${
                                  deletingId === service.id ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                title="Delete category"
                              >
                                {deletingId === service.id ? (
                                  <span className="animate-spin inline-block w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full" />
                                ) : (
                                  <FaTrashAlt className="text-lg" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {expandedCategory === service.id && hasSubs && (
                          <div className="bg-gray-50 px-6 py-4 border-t">
                            <div className="space-y-3">
                              {service.subcategories.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    {sub.image ? (
                                      <img
                                        src={sub.image}
                                        alt={sub.name}
                                        className="w-10 h-10 object-cover rounded"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                                        {sub.name.charAt(0)}
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-medium">{sub.name}</p>
                                      {sub.description && (
                                        <p className="text-sm text-gray-600 line-clamp-1">
                                          {sub.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <p className="font-semibold">
                                      ₹{sub.service_charge || '—'}
                                    </p>
                                    <span
                                      className={`px-2.5 py-1 text-xs rounded-full ${getStatusBadge(
                                        sub.is_active ?? true
                                      )}`}
                                    >
                                      {sub.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Confirm Deletion</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the category
                <span className="font-medium text-red-600"> "{showDeleteConfirm.name}"</span>?
                <br />
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-4">
                <button
                  onClick={cancelDelete}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  disabled={deletingId === showDeleteConfirm.id}
                  className={`px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 ${
                    deletingId === showDeleteConfirm.id ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {deletingId === showDeleteConfirm.id ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Deleting...
                    </>
                  ) : (
                    'Delete Category'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}