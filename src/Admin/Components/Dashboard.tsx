import { useState, useEffect } from 'react';
import {
  FaTools, FaChevronDown, FaChevronUp, FaTrashAlt,
  FaEnvelope, FaPlus, FaHistory, FaBars, FaTimes,
  FaHome, // added some common icons
} from 'react-icons/fa';

import AddCategory from './Addcategory';
import AddSubCategory from './AddSubCategory';
import History from './Hostory'; // ensure correct file name
import { getAllServiceCategory, deleteCategory } from '../../Api/Service';
import { addEmail, getAllEmails, deleteEmail } from '../../Api/EmailsAdmin';

import logo from '../../assets/logo.png';

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

interface AdminEmail {
  id?: number;
  email: string;
  priority: 1 | 2 | 3 | 4 | 5;
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'add-category' | 'add-subcategory' | 'history' | 'admin-emails'
  >('dashboard');

  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile toggle

  // ── Categories ──────────────────────────────────────────────────
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<{ id: number; name: string } | null>(null);

  // ── Emails ──────────────────────────────────────────────────────
  const [adminEmails, setAdminEmails] = useState<AdminEmail[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [newPriority, setNewPriority] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [addingEmail, setAddingEmail] = useState(false);
  const [deleteEmailId, setDeleteEmailId] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      setLoadingServices(true);
      setServicesError(null);
      const res = await getAllServiceCategory();
      console.log('Categories API:', res);
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setServices(data);
    } catch (err) {
      console.error(err);
      setServicesError('Failed to load service categories');
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchAdminEmails = async () => {
    try {
      setLoadingEmails(true);
      setEmailsError(null);
      const res = await getAllEmails();
      console.log('Emails API:', res);
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAdminEmails(data);
    } catch (err) {
      console.error(err);
      setEmailsError('Failed to load admin emails');
    } finally {
      setLoadingEmails(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNavClick = (section: typeof activeSection) => {
    setActiveSection(section);
    setSidebarOpen(false); // close mobile sidebar
    if (section === 'admin-emails') fetchAdminEmails();
  };

  const goToDashboard = () => handleNavClick('dashboard');

  // ── Delete Handlers ─────────────────────────────────────────────
  const handleDeleteCategory = async () => {
    if (!deleteCategoryConfirm) return;
    try {
      await deleteCategory(deleteCategoryConfirm.id);
      alert(`Category "${deleteCategoryConfirm.name}" deleted`);
      setDeleteCategoryConfirm(null);
      fetchCategories();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Delete failed');
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      alert('Please enter a valid email');
      return;
    }
    try {
      setAddingEmail(true);
      await addEmail({ email: newEmail.trim(), priority: newPriority });
      setNewEmail('');
      setNewPriority(3);
      fetchAdminEmails();
      alert('Email added');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add email');
    } finally {
      setAddingEmail(false);
    }
  };

  const handleDeleteEmail = async (id: number) => {
    try {
      await deleteEmail(id);
      fetchAdminEmails();
      alert('Email deleted');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
            <span className="text-lg font-semibold">Magic Lamp</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          <button
            onClick={goToDashboard}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'dashboard'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaHome /> Dashboard
          </button>

          <button
            onClick={() => handleNavClick('add-category')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'add-category'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaPlus /> Add Category
          </button>

          <button
            onClick={() => handleNavClick('add-subcategory')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'add-subcategory'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaPlus className="text-xs" /> Add Subcategory
          </button>

          <button
            onClick={() => handleNavClick('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'history'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaHistory /> Request History
          </button>

          <button
            onClick={() => handleNavClick('admin-emails')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'admin-emails'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaEnvelope /> Admin Emails
          </button>

          {/* Spacer + Settings placeholder */}
          {/* <div className="pt-8 mt-8 border-t">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
              <FaCog /> Settings
            </button>
          </div> */}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
              <FaBars className="text-xl" />
            </button>

            <h1 className="text-xl font-semibold text-gray-800">
              {activeSection === 'dashboard' ? 'Service Categories' :
               activeSection === 'add-category' ? 'Add Category' :
               activeSection === 'add-subcategory' ? 'Add Subcategory' :
               activeSection === 'history' ? 'Request History' :
               'Admin Emails'}
            </h1>

            {/* Right side - user area placeholder */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                {/* <p className="text-xs text-gray-500">admin@example.com</p> */}
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeSection === 'dashboard' ? (
            loadingServices ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : servicesError ? (
              <div className="text-center py-12 text-red-600">{servicesError}</div>
            ) : services.length === 0 ? (
              <div className="text-center py-16">
                <FaTools className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No categories yet</h3>
                <p className="text-gray-500 mb-6">Start by adding your first service category</p>
                <button
                  onClick={() => handleNavClick('add-category')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Category
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {services.map((cat) => (
                  <div key={cat.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    <div
                      className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => cat.subcategories?.length > 0 && setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                          {cat.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                          {cat.description && <p className="text-sm text-gray-600 mt-1">{cat.description}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-medium">{cat.service_charge ? `₹${cat.service_charge}` : '—'}</p>
                          <span className={`inline-block px-3 py-1 mt-1 text-xs font-medium rounded-full ${
                            cat.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {cat.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          {cat.subcategories?.length > 0 && (
                            expandedCategory === cat.id ? <FaChevronUp /> : <FaChevronDown />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteCategoryConfirm({ id: cat.id, name: cat.name });
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedCategory === cat.id && cat.subcategories?.length > 0 && (
                      <div className="px-6 pb-6 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                          {cat.subcategories.map((sub) => (
                            <div key={sub.id} className="bg-white p-4 rounded-lg border shadow-sm">
                              <h4 className="font-medium">{sub.name}</h4>
                              {sub.description && <p className="text-sm text-gray-600 mt-1">{sub.description}</p>}
                              <div className="mt-3 flex justify-between text-sm">
                                <span className="font-medium">{sub.service_charge ? `₹${sub.service_charge}` : '—'}</span>
                                <span className={`px-2.5 py-0.5 text-xs rounded-full ${
                                  sub.is_active ?? true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {sub.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : activeSection === 'admin-emails' ? (
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow border p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <FaEnvelope className="text-indigo-600" />
                  Manage Admin Emails
                </h2>

                <form onSubmit={handleAddEmail} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="admin@company.com"
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(Number(e.target.value) as any)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      >
                        <option value={1}>1 </option>
                        <option value={2}>2</option>
                        <option value={3}>3 </option>
                        <option value={4}>4</option>
                        <option value={5}>5 </option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={addingEmail}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
                  >
                    {addingEmail ? 'Adding...' : <><FaPlus size={14} /> Add Email</>}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow border p-6">
                <h3 className="text-lg font-semibold mb-4">Existing Emails</h3>
                {loadingEmails ? (
                  <div className="text-center py-10 text-gray-500">Loading...</div>
                ) : emailsError ? (
                  <div className="text-center py-10 text-red-600">{emailsError}</div>
                ) : adminEmails.length === 0 ? (
                  <div className="text-center py-10 text-gray-600">No emails added yet</div>
                ) : (
                  <div className="space-y-3">
                    {adminEmails.map((item) => (
                      <div
                        key={item.id || item.email}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{item.email}</p>
                          <p className="text-sm text-gray-500">Priority: {item.priority}</p>
                        </div>
                        <button
                          onClick={() => item.id && setDeleteEmailId(item.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeSection === 'add-category' ? (
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-semibold mb-6">Add New Category</h2>
              <AddCategory onClose={goToDashboard} onSuccess={fetchCategories} />
            </div>
          ) : activeSection === 'add-subcategory' ? (
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-semibold mb-6">Add New Subcategory</h2>
              <AddSubCategory onClose={goToDashboard} onSuccess={fetchCategories} />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-semibold mb-6">Service Request History</h2>
              <History />
            </div>
          )}
        </main>
      </div>

      {/* Delete Modals */}
      {deleteCategoryConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Delete category <strong>{deleteCategoryConfirm.name}</strong>?
              <br />This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteCategoryConfirm(null)}
                className="px-5 py-2.5 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteEmailId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Remove this email from admin notifications?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteEmailId(null)}
                className="px-5 py-2.5 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteEmail(deleteEmailId);
                  setDeleteEmailId(null);
                }}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}