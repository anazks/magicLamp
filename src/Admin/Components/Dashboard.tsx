import { useState, useEffect } from 'react';
import {
  FaBolt,
  FaPlus,
  FaHistory,
  FaTools,
  FaChevronDown,
  FaChevronUp,
  FaTrashAlt,
} from 'react-icons/fa';

import AddCategory from './Addcategory';
import AddSubCategory from './AddSubCategory';
import History from './Hostory'; // corrected spelling (was Hostory)
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
    'none' | 'add-category' | 'add-subcategory' | 'history'
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

  // Fetch all service categories
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

  const getStatusBadge = (isActive: boolean) =>
    isActive
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-rose-100 text-rose-800 border-rose-200';

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Magic Lamp branding */}
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaBolt className="text-white text-2xl" />
              </div>
              <div className="absolute inset-0 bg-purple-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Magic Lamp
              </h1>
              <p className="text-gray-600 mt-1">Service Provider Dashboard</p>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <button
            onClick={() => setActiveSection('add-category')}
            className={`group relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 ${
              activeSection === 'add-category'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white scale-105 shadow-indigo-500/30'
                : 'bg-white hover:shadow-xl hover:-translate-y-1 border border-indigo-100'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <FaPlus className="text-3xl mb-4" />
            <h3 className="text-xl font-semibold">Add Category</h3>
          </button>

          <button
            onClick={() => setActiveSection('add-subcategory')}
            className={`group relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 ${
              activeSection === 'add-subcategory'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white scale-105 shadow-indigo-500/30'
                : 'bg-white hover:shadow-xl hover:-translate-y-1 border border-indigo-100'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <FaPlus className="text-3xl mb-4" />
            <h3 className="text-xl font-semibold">Add Subcategory</h3>
          </button>

          <button
            onClick={() => setActiveSection('history')}
            className={`group relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 ${
              activeSection === 'history'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white scale-105 shadow-indigo-500/30'
                : 'bg-white hover:shadow-xl hover:-translate-y-1 border border-indigo-100'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <FaHistory className="text-3xl mb-4" />
            <h3 className="text-xl font-semibold">Request History</h3>
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-10">
          {/* Add Forms */}
          {activeSection === 'add-category' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 p-7">
              <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center gap-3">
                <FaPlus className="text-indigo-600" />
                Add New Category
              </h2>
              <AddCategory onClose={() => setActiveSection('none')} onSuccess={fetchServices} />
            </div>
          )}

          {activeSection === 'add-subcategory' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 p-7">
              <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center gap-3">
                <FaPlus className="text-indigo-600" />
                Add New Subcategory
              </h2>
              <AddSubCategory onClose={() => setActiveSection('none')} onSuccess={fetchServices} />
            </div>
          )}

          {/* History View */}
          {activeSection === 'history' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 overflow-hidden">
              <div className="px-7 py-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h2 className="text-xl font-bold text-indigo-800 flex items-center gap-3">
                  <FaHistory className="text-indigo-600" />
                  Service Request History
                </h2>
              </div>
              <div className="p-6">
                <History />
              </div>
            </div>
          )}

          {/* Services / Categories List – default view */}
          {!['add-category', 'add-subcategory', 'history'].includes(activeSection) && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 overflow-hidden">
              <div className="px-7 py-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-indigo-800 flex items-center gap-3">
                  <FaTools className="text-indigo-600" />
                  Your Service Categories
                </h2>
              </div>

              {loadingServices ? (
                <div className="p-12 text-center text-gray-500 animate-pulse">
                  Loading your services...
                </div>
              ) : servicesError ? (
                <div className="p-12 text-center text-rose-600">{servicesError}</div>
              ) : services.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <FaTools className="text-5xl text-indigo-500 opacity-50" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No categories yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start by adding your first service category
                  </p>
                  <button
                    onClick={() => setActiveSection('add-category')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                  >
                    Add First Category
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100/80">
                  {services.map((service) => {
                    const hasSubs = service.subcategories.length > 0;

                    return (
                      <div key={service.id}>
                        <div
                          className={`px-7 py-5 flex items-center justify-between transition-colors ${
                            hasSubs
                              ? 'hover:bg-indigo-50/50 cursor-pointer'
                              : 'cursor-default'
                          }`}
                          onClick={() => hasSubs && toggleCategory(service.id)}
                        >
                          <div className="flex items-center gap-5 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-xl shadow-sm">
                              {service.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-lg">{service.name}</p>
                              {service.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {service.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="font-bold text-indigo-700">
                                {service.service_charge ? `₹${service.service_charge}` : '—'}
                              </p>
                              <span
                                className={`inline-flex px-3 py-1 mt-2 text-xs font-semibold rounded-full border ${getStatusBadge(
                                  service.is_active
                                )}`}
                              >
                                {service.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            <div className="flex items-center gap-4">
                              {hasSubs && (
                                expandedCategory === service.id ? (
                                  <FaChevronUp className="text-indigo-500" />
                                ) : (
                                  <FaChevronDown className="text-indigo-500" />
                                )
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestDelete(service.id, service.name);
                                }}
                                disabled={deletingId === service.id}
                                className={`p-2 rounded-lg transition ${
                                  deletingId === service.id
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                                }`}
                                title="Delete category"
                              >
                                {deletingId === service.id ? (
                                  <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <FaTrashAlt className="text-xl" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Subcategories */}
                        {expandedCategory === service.id && hasSubs && (
                          <div className="bg-gradient-to-b from-indigo-50/30 to-transparent px-7 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {service.subcategories.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start gap-4">
                                    {sub.image ? (
                                      <img
                                        src={sub.image}
                                        alt={sub.name}
                                        className="w-14 h-14 object-cover rounded-lg"
                                      />
                                    ) : (
                                      <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-medium">
                                        {sub.name.charAt(0)}
                                      </div>
                                    )}

                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-900">{sub.name}</p>
                                      {sub.description && (
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                          {sub.description}
                                        </p>
                                      )}
                                      <div className="mt-3 flex items-center justify-between">
                                        <p className="font-bold text-indigo-700">
                                          ₹{sub.service_charge || '—'}
                                        </p>
                                        <span
                                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                                            sub.is_active ?? true
                                          )}`}
                                        >
                                          {sub.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                      </div>
                                    </div>
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Are you sure you want to delete the category
                <span className="font-semibold text-rose-600"> "{showDeleteConfirm.name}"</span>?
                <br />
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-4">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  disabled={deletingId === showDeleteConfirm.id}
                  className={`px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-xl hover:from-rose-700 hover:to-rose-800 transition font-medium flex items-center gap-2 shadow-md ${
                    deletingId === showDeleteConfirm.id ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {deletingId === showDeleteConfirm.id ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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