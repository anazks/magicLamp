import React, { useState, useEffect } from "react";
import {
  FaTools,
  FaChevronDown,
  FaChevronUp,
  FaTrashAlt,
  FaEnvelope,
  FaPlus,
  FaHistory,
  FaBars,
  FaListAlt,
  FaSignOutAlt,
  FaEdit,
  FaChartLine,
  FaUsers,
} from "react-icons/fa";
import AddCategory from "./Addcategory";
import AddSubCategory from "./AddSubCategory";
import Users from "./Users";
import Stats from "./Stats";
import History from "./Hostory"; // rename to History.tsx when possible
import {
  getAllServiceCategory,
  deleteCategory,
  updateCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../../Api/Service";
import { profileDetails } from "../../Api/Auth";
import { addEmail, getAllEmails, deleteEmail } from "../../Api/EmailsAdmin";
import logo from "../../assets/logo.png";
import Loader from "../../Component/Loader/Loader";

interface SubCategoryItem {
  id: number;
  name: string;
  description?: string;
  image?: string | null;
  service_charge?: string;
  is_active?: boolean;
  order?: number;
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
  order?: number;
}

interface AdminEmail {
  id?: number;
  email: string;
  priority: 1 | 2 | 3 | 4 | 5;
}

interface AdminProfile {
  email?: string;
  name?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<
    "stats" | "requests" | "add-category" | "add-subcategory" | "categories" | "admin-emails" | "users"
  >("stats");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Admin profile
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Services
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  // Delete modals
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<{ id: number; name: string } | null>(null);
  const [deleteSubConfirm, setDeleteSubConfirm] = useState<{
    categoryId: number;
    subId: number;
    subName: string;
  } | null>(null);

  // Edit category
  const [editingCategory, setEditingCategory] = useState<ServiceItem | null>(null);
  const [editCatForm, setEditCatForm] = useState({
    name: "",
    description: "",
    service_charge: "",
    is_active: true,
    order: 0,
  });
  const [editCatImageFile, setEditCatImageFile] = useState<File | null>(null);
  const [editCatPreview, setEditCatPreview] = useState<string | null>(null);
  const [editCatRemoveImage, setEditCatRemoveImage] = useState(false);

  // Edit subcategory
  const [editingSubCategory, setEditingSubCategory] = useState<{
    categoryId: number;
    sub: SubCategoryItem;
  } | null>(null);
  const [editSubForm, setEditSubForm] = useState({
    name: "",
    description: "",
    service_charge: "",
    is_active: true,
    order: 0,
  });
  const [editSubImageFile, setEditSubImageFile] = useState<File | null>(null);
  const [editSubPreview, setEditSubPreview] = useState<string | null>(null);
  const [editSubRemoveImage, setEditSubRemoveImage] = useState(false);

  // Emails
  const [adminEmails, setAdminEmails] = useState<AdminEmail[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPriority, setNewPriority] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [addingEmail, setAddingEmail] = useState(false);
  const [deleteEmailId, setDeleteEmailId] = useState<number | null>(null);

  // Fetch admin profile once
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await profileDetails();
        console.log("Admin profile:", res);

        // Try common response shapes
        const profileData =
          res?.data?.user ||
          res?.data ||
          res?.user ||
          res;

        setAdminProfile(profileData);
      } catch (err) {
        console.error("Failed to load admin profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingServices(true);
      setServicesError(null);

      const res = await getAllServiceCategory();
      let categoryData: ServiceItem[] = [];

      if (res?.data?.results) categoryData = res.data.results;
      else if (res?.data?.data) categoryData = res.data.data;
      else if (Array.isArray(res?.data)) categoryData = res.data;
      else if (Array.isArray(res)) categoryData = res;

      categoryData.sort((a, b) => {
        const orderA = a.order ?? 999999;
        const orderB = b.order ?? 999999;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      });

      categoryData.forEach((cat) => {
        if (cat.subcategories?.length) {
          cat.subcategories.sort((a, b) => {
            const orderA = a.order ?? 999999;
            const orderB = b.order ?? 999999;
            if (orderA !== orderB) return orderA - orderB;
            return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
          });
        }
      });

      setServices(categoryData);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setServicesError("Failed to load service categories");
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchAdminEmails = async () => {
    try {
      setLoadingEmails(true);
      setEmailsError(null);
      const res = await getAllEmails();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAdminEmails(data);
    } catch (err) {
      console.error("Failed to load emails:", err);
      setEmailsError("Failed to load admin emails");
    } finally {
      setLoadingEmails(false);
    }
  };

  useEffect(() => {
    if (activeSection === "categories") fetchCategories();
    if (activeSection === "admin-emails") fetchAdminEmails();
  }, [activeSection]);

  useEffect(() => {
    if (editingCategory) {
      setEditCatImageFile(null);
      setEditCatRemoveImage(false);
      setEditCatPreview(editingCategory.image || null);
      setEditCatForm({
        name: editingCategory.name,
        description: editingCategory.description || "",
        service_charge: editingCategory.service_charge || "",
        is_active: editingCategory.is_active,
        order: editingCategory.order ?? 0,
      });
    } else {
      setEditCatImageFile(null);
      setEditCatPreview(null);
      setEditCatRemoveImage(false);
    }
  }, [editingCategory]);

  useEffect(() => {
    if (editingSubCategory) {
      setEditSubImageFile(null);
      setEditSubRemoveImage(false);
      setEditSubPreview(editingSubCategory.sub.image || null);
      setEditSubForm({
        name: editingSubCategory.sub.name,
        description: editingSubCategory.sub.description || "",
        service_charge: editingSubCategory.sub.service_charge || "",
        is_active: editingSubCategory.sub.is_active ?? true,
        order: editingSubCategory.sub.order ?? 0,
      });
    } else {
      setEditSubImageFile(null);
      setEditSubPreview(null);
      setEditSubRemoveImage(false);
    }
  }, [editingSubCategory]);

  const handleNavClick = (section: typeof activeSection) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userData");
    window.location.href = "/";
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryConfirm) return;
    try {
      await deleteCategory(deleteCategoryConfirm.id);
      alert(`${deleteCategoryConfirm.name} deleted successfully`);
      setDeleteCategoryConfirm(null);
      fetchCategories();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete category");
    }
  };

  const handleDeleteSubCategory = async () => {
    if (!deleteSubConfirm) return;
    try {
      await deleteSubCategory(deleteSubConfirm.subId);
      alert(`${deleteSubConfirm.subName} deleted successfully`);
      setDeleteSubConfirm(null);
      fetchCategories();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete subcategory");
    }
  };

  const startEditCategory = (cat: ServiceItem) => {
    setEditingCategory(cat);
  };

  const handleCatImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setEditCatImageFile(file);
      setEditCatPreview(URL.createObjectURL(file));
      setEditCatRemoveImage(false);
    }
  };

  const handleRemoveCatImage = () => {
    setEditCatImageFile(null);
    setEditCatPreview(null);
    setEditCatRemoveImage(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const payload: any = {
        name: editCatForm.name.trim(),
        description: editCatForm.description.trim() || undefined,
        service_charge: editCatForm.service_charge.trim() || undefined,
        is_active: editCatForm.is_active,
        order: Number(editCatForm.order),
      };

      if (editCatImageFile) {
        const formData = new FormData();
        Object.keys(payload).forEach((key) => {
          if (payload[key] !== undefined) formData.append(key, payload[key]);
        });
        formData.append("image", editCatImageFile);
        await updateCategory(editingCategory.id, formData);
      } else if (editCatRemoveImage) {
        payload.image = null;
        await updateCategory(editingCategory.id, payload);
      } else {
        await updateCategory(editingCategory.id, payload);
      }

      alert("Category updated successfully");
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update category");
    }
  };

  const startEditSubCategory = (categoryId: number, sub: SubCategoryItem) => {
    setEditingSubCategory({ categoryId, sub });
  };

  const handleSubImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setEditSubImageFile(file);
      setEditSubPreview(URL.createObjectURL(file));
      setEditSubRemoveImage(false);
    }
  };

  const handleRemoveSubImage = () => {
    setEditSubImageFile(null);
    setEditSubPreview(null);
    setEditSubRemoveImage(true);
  };

  const handleUpdateSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubCategory) return;

    try {
      const payload: any = {
        name: editSubForm.name.trim(),
        description: editSubForm.description.trim() || undefined,
        service_charge: editSubForm.service_charge.trim() || undefined,
        is_active: editSubForm.is_active,
        order: Number(editSubForm.order),
      };

      if (editSubImageFile) {
        const formData = new FormData();
        Object.keys(payload).forEach((key) => {
          if (payload[key] !== undefined) formData.append(key, payload[key]);
        });
        formData.append("image", editSubImageFile);
        await updateSubCategory(editingSubCategory.sub.id, formData);
      } else if (editSubRemoveImage) {
        payload.image = null;
        await updateSubCategory(editingSubCategory.sub.id, payload);
      } else {
        await updateSubCategory(editingSubCategory.sub.id, payload);
      }

      alert("Subcategory updated successfully");
      setEditingSubCategory(null);
      fetchCategories();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update subcategory");
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      setAddingEmail(true);
      await addEmail({ email: newEmail.trim(), priority: newPriority });
      alert("Email added successfully");
      setNewEmail("");
      setNewPriority(3);
      fetchAdminEmails();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to add email");
    } finally {
      setAddingEmail(false);
    }
  };

  const handleDeleteEmail = async (id: number) => {
    try {
      await deleteEmail(id);
      alert("Email deleted successfully");
      fetchAdminEmails();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete email");
    }
  };

  const getDisplayName = () => {
    if (loadingProfile) return "Loading...";
    if (!adminProfile) return "Admin";

    return (
      adminProfile.name ||
      adminProfile.username ||
      adminProfile.email ||
      `${adminProfile.first_name || ""} ${adminProfile.last_name || ""}`.trim() ||
      "Admin"
    );
  };

  const getPageTitle = () => {
    switch (activeSection) {
      case "stats":
        return "Dashboard Overview";
      case "requests":
        return "Service Requests";
      case "add-category":
        return "Add Category";
      case "add-subcategory":
        return "Add Subcategory";
      case "categories":
        return "Service Categories";
      case "admin-emails":
        return "Admin Emails";
      case "users":
        return "Users Management";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleNavClick("stats")}
            >
              <img src={logo} alt="Magic Lamp" className="h-10 w-10" />
              <span className="font-cinzel font-black text-xl md:text-2xl bg-gradient-to-r from-blue-700 to-amber-500 bg-clip-text text-transparent whitespace-nowrap">
                Magic Lamp
              </span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button
              onClick={() => handleNavClick("stats")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === "stats" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaChartLine className="text-lg" /> Dashboard
            </button>
            <button
              onClick={() => handleNavClick("requests")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === "requests" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaHistory className="text-lg" /> Service Requests
            </button>
            <button
              onClick={() => handleNavClick("add-category")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === "add-category" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaPlus className="text-lg" /> Add Category
            </button>
            <button
              onClick={() => handleNavClick("add-subcategory")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === "add-subcategory" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaTools className="text-lg" /> Add Subcategory
            </button>
            <button
              onClick={() => handleNavClick("categories")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === "categories" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaListAlt className="text-lg" /> Service Categories
            </button>
            <button
              onClick={() => handleNavClick("admin-emails")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === "admin-emails" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaEnvelope className="text-lg" /> Admin Emails
            </button>
            <button
              onClick={() => handleNavClick("users")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === "users" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaUsers className="text-lg" /> Users
            </button>
          </nav>
        </div>
      </aside>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/20 z-40" />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 focus:outline-none"
              >
                <FaBars size={24} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
            </div>

            <div className="flex items-center gap-5">
              <span className="text-sm text-gray-600 hidden md:block">
                {getDisplayName()}
              </span>

              <button
                onClick={() => handleNavClick("users")}
                className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-lg hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                title="View / Manage Users"
              >
                {getDisplayName()?.charAt(0)?.toUpperCase() || "A"}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign out"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-8">
          {activeSection === "stats" && <Stats />}

          {activeSection === "requests" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">Service Requests</h2>
                </div>
                <History />
              </div>
            </div>
          )}

          {activeSection === "admin-emails" && (
            <div className="max-w-4xl space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Manage Admin Emails</h2>
                <form onSubmit={handleAddEmail} className="space-y-4">
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
                      onChange={(e) => setNewPriority(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value={1}>1 – Highest</option>
                      <option value={2}>2</option>
                      <option value={3}>3 – Normal</option>
                      <option value={4}>4</option>
                      <option value={5}>5 – Lowest</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={addingEmail}
                    className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 justify-center"
                  >
                    {addingEmail ? "Adding..." : (
                      <>
                        <FaPlus /> Add Email
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">Existing Emails</h3>
                </div>
                {loadingEmails ? (
                  <Loader />
                ) : emailsError ? (
                  <div className="p-8 text-center text-red-600">{emailsError}</div>
                ) : adminEmails.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No emails added yet</div>
                ) : (
                  <div className="divide-y">
                    {adminEmails.map((item) => (
                      <div
                        key={item.id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{item.email}</div>
                          <div className="text-sm text-gray-500">Priority: {item.priority}</div>
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
          )}

          {activeSection === "add-category" && (
            <div className="max-w-3xl">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Add New Category</h2>
                <AddCategory onSuccess={fetchCategories} />
              </div>
            </div>
          )}

          {activeSection === "add-subcategory" && (
            <div className="max-w-3xl">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Add New Subcategory</h2>
                <AddSubCategory onSuccess={fetchCategories} />
              </div>
            </div>
          )}

          {activeSection === "categories" && (
            <>
              {loadingServices ? (
                <div className="flex items-center justify-center py-20">
                  <Loader />
                </div>
              ) : servicesError ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center text-red-600">
                  {servicesError}
                </div>
              ) : services.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <FaListAlt className="mx-auto text-gray-400 text-5xl mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No categories yet</h3>
                  <p className="text-gray-600 mb-6">Start by adding your first service category</p>
                  <button
                    onClick={() => handleNavClick("add-category")}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <FaPlus className="inline mr-2" /> Add Category
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {services.map((cat) => (
                      <div key={cat.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div
                          onClick={() => cat.subcategories?.length > 0 && setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                          className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-lg flex-shrink-0">
                              {cat.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
                              {cat.description && (
                                <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{cat.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right min-w-[80px]">
                              <div className="text-xs text-gray-500">Order</div>
                              <div className="font-bold text-indigo-700">{cat.order ?? "—"}</div>
                            </div>

                            <div className="text-right min-w-[100px]">
                              <div className="text-xs text-gray-500">Charge</div>
                              <div className="font-medium text-gray-900">
                                {cat.service_charge ? `₹${cat.service_charge}` : "—"}
                              </div>
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                cat.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {cat.is_active ? "Active" : "Inactive"}
                            </span>

                            {cat.subcategories?.length > 0 && (
                              <button className="text-gray-400 p-2">
                                {expandedCategory === cat.id ? <FaChevronUp /> : <FaChevronDown />}
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditCategory(cat);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-2"
                              title="Edit category"
                            >
                              <FaEdit />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteCategoryConfirm({ id: cat.id, name: cat.name });
                              }}
                              className="text-red-600 hover:text-red-800 p-2"
                              title="Delete category"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>

                        {expandedCategory === cat.id && cat.subcategories?.length > 0 && (
                          <div className="bg-gray-50 divide-y divide-gray-200">
                            {cat.subcategories.map((sub) => (
                              <div key={sub.id} className="px-6 py-4 pl-20">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 flex items-center gap-3">
                                      <span className="text-indigo-600 font-bold min-w-[30px] text-right">
                                        {sub.order ?? "—"}
                                      </span>
                                      {sub.name}
                                    </h4>
                                    {sub.description && (
                                      <p className="text-sm text-gray-600 mt-1 ml-[38px]">{sub.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {sub.service_charge ? `₹${sub.service_charge}` : "—"}
                                    </div>
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        sub.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {sub.is_active ? "Active" : "Inactive"}
                                    </span>
                                    <button
                                      onClick={() => startEditSubCategory(cat.id, sub)}
                                      className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50"
                                      title="Edit subcategory"
                                    >
                                      <FaEdit size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        setDeleteSubConfirm({
                                          categoryId: cat.id,
                                          subId: sub.id,
                                          subName: sub.name,
                                        })
                                      }
                                      className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50"
                                      title="Delete subcategory"
                                    >
                                      <FaTrashAlt size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-center text-gray-600 py-6 border-t">
                    Showing all {services.length} categories (sorted by display order)
                  </div>
                </div>
              )}
            </>
          )}

          {activeSection === "users" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">Users Management</h2>
                </div>
                <Users />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Category Confirmation */}
      {deleteCategoryConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteCategoryConfirm.name}</strong>?<br />
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteCategoryConfirm(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subcategory Confirmation */}
      {deleteSubConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteSubConfirm.subName}</strong>?<br />
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteSubConfirm(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubCategory}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-5">Edit Category</h3>
            <form onSubmit={handleUpdateCategory} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={editCatForm.name}
                  onChange={(e) => setEditCatForm({ ...editCatForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editCatForm.description}
                  onChange={(e) => setEditCatForm({ ...editCatForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Charge (₹)</label>
                <input
                  type="text"
                  value={editCatForm.service_charge}
                  onChange={(e) => setEditCatForm({ ...editCatForm, service_charge: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. 499"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editCatForm.order}
                  onChange={(e) => setEditCatForm({ ...editCatForm, order: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Lower number = appears first"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Used to control position in the list (0 = top)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                    {editCatPreview ? (
                      <>
                        <img src={editCatPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={handleRemoveCatImage}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm px-2 text-center">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCatImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      PNG, JPG, max 5MB.<br />
                      Leave empty to keep current image.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={editCatForm.is_active}
                  onChange={(e) => setEditCatForm({ ...editCatForm, is_active: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="cat-active" className="text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subcategory Modal */}
      {editingSubCategory && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-5">Edit Subcategory</h3>
            <form onSubmit={handleUpdateSubCategory} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={editSubForm.name}
                  onChange={(e) => setEditSubForm({ ...editSubForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editSubForm.description}
                  onChange={(e) => setEditSubForm({ ...editSubForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Charge (₹)</label>
                <input
                  type="text"
                  value={editSubForm.service_charge}
                  onChange={(e) => setEditSubForm({ ...editSubForm, service_charge: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. 299"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editSubForm.order}
                  onChange={(e) => setEditSubForm({ ...editSubForm, order: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Lower number = appears first"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Controls position within this category (0 = top)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory Image</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                    {editSubPreview ? (
                      <>
                        <img src={editSubPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={handleRemoveSubImage}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm px-2 text-center">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSubImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      PNG, JPG, max 5MB.<br />
                      Leave empty to keep current image.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sub-active"
                  checked={editSubForm.is_active}
                  onChange={(e) => setEditSubForm({ ...editSubForm, is_active: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="sub-active" className="text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setEditingSubCategory(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Email Confirmation */}
      {deleteEmailId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Remove this email from admin notifications list?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteEmailId(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteEmail(deleteEmailId);
                  setDeleteEmailId(null);
                }}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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