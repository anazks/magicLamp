import { useState, useEffect, useMemo } from "react";
import { getAllRequestedServices, updateRequestStatus, getAllServiceCategory } from "../../Api/Service";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaEye,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaStickyNote,
  FaTimes,
  FaImage,
  FaDownload,
  FaVideo,
  FaFile,
  FaExternalLinkAlt,
  FaCalendarAlt, // Added
  FaTags, // Added
  FaSort, // Added
  FaSortUp, // Added
  FaSortDown, // Added
  FaPhone, // Added for modal
  FaInfoCircle, // Added for modal
  FaMapPin, // Added for modal
} from "react-icons/fa";
import Loader from "../../Component/Loader/Loader";

/* ───────────────── TYPES ───────────────── */
type RequestStatus = "Pending" | "Assigned" | "In Progress" | "Completed" | "Cancelled";

interface User {
  id: number;
  email: string;
}

interface MediaFile {
  id: number;
  file: string;
  file_type: 'image' | 'video' | 'document' | 'other';
  created_at: string;
  thumbnail_url?: string;
}

interface ServiceRequest {
  id: number;
  request_id: string;
  user: User | null;
  customer_name: string;
  mobile_number: string;
  category_name: string;
  subcategory_name: string | null;
  service_details: { description: string } | null;
  address: string;
  latitude: string;
  longitude: string;
  status: RequestStatus;
  created_at: string;
  updated_at?: string;
  admin_notes?: string;
  media_files?: MediaFile[]; // Added media files
}

interface Category {
  id: number;
  name: string;
}

interface PaginatedResponse {
  total: number; // For some reason count is total in some responses? Let's check
  count: number;
  next: string | null;
  previous: string | null;
  results: ServiceRequest[];
  stats?: {
    total: number;
    pending: number;
    assigned: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
}

/* ───────────────── MAIN COMPONENT ───────────────── */
export default function History() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);

  // Pagination
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [categoryIdFilter, setCategoryIdFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: 'created_at',
    direction: 'desc'
  });

  // Categories list
  const [categories, setCategories] = useState<Category[]>([]);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  });

  // Reverse geocoding
  const [reverseAddress, setReverseAddress] = useState("");
  const [reverseLoading, setReverseLoading] = useState(false);

  // Admin note input (when changing status)
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<RequestStatus | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch categories
      const catRes = await getAllServiceCategory();
      const catData = catRes.data?.results || catRes.data || [];
      setCategories(Array.isArray(catData) ? catData : []);
      
      // Fetch initial requests
      fetchRequests();
    } catch (err) {
      console.error("Failed to load initial data:", err);
    }
  };

  useEffect(() => {
    // Only refetch if it's not the initial load (which is handled by fetchInitialData)
    if (categories.length >= 0) {
      fetchRequests();
    }
  }, [statusFilter, categoryIdFilter, startDate, endDate, sortConfig]);

  const fetchRequests = async (url?: string) => {
    setLoading(true);
    try {
      const ordering = sortConfig 
        ? `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}`
        : undefined;

      const filters = {
        status: statusFilter,
        category_id: categoryIdFilter,
        start_date: startDate,
        end_date: endDate,
        ordering
      };

      const response = await getAllRequestedServices(url, filters);
      const data: PaginatedResponse = response.data;

      setRequests(data.results || []);
      setTotalCount(data.count || 0);
      setNextUrl(data.next);
      setPrevUrl(data.previous);

      if (data.stats) {
        setStats({
          total: data.stats.total,
          pending: data.stats.pending,
          assigned: data.stats.assigned,
          inProgress: data.stats.in_progress,
          completed: data.stats.completed,
          cancelled: data.stats.cancelled,
        });
      }

      if (url) {
        const match = url.match(/[?&]page=(\d+)/);
        if (match) setCurrentPage(Number(match[1]));
      } else {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Failed to load service requests:", err);
      setRequests([]);
      setTotalCount(0);
      setStats({
        total: 0,
        pending: 0,
        assigned: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0
      });
      setNextUrl(null);
      setPrevUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    if (prevUrl) fetchRequests(prevUrl);
  };

  const goToNext = () => {
    if (nextUrl) fetchRequests(nextUrl);
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber === currentPage) return;
    
    // Construct the URL with the desired page number
    // We can use the base requests endpoint and append the current filters and the page number
    const filters = {
      status: statusFilter,
      category_id: categoryIdFilter,
      start_date: startDate,
      end_date: endDate
    };

    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    params.append('page', pageNumber.toString());
    
    const url = `services/admin/requests/?${params.toString()}`;
    fetchRequests(url);
  };

  // Helper to generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) pages.push(i);
    }
    return pages;
  };

  // Reverse geocode
  useEffect(() => {
    if (!selectedRequest?.latitude || !selectedRequest?.longitude) {
      setReverseAddress("No coordinates available");
      return;
    }

    const lat = parseFloat(selectedRequest.latitude);
    const lng = parseFloat(selectedRequest.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setReverseAddress("Invalid coordinates");
      return;
    }

    fetchReverseGeocode(lat, lng);
  }, [selectedRequest]);

  const fetchReverseGeocode = async (lat: number, lng: number) => {
    setReverseLoading(true);
    setReverseAddress("Loading address...");
    try {
      const response = await axios.get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = response.data;
      const parts = [
        data.locality || "",
        data.city || data.locality || "",
        data.principalSubdivision || "",
        data.countryName || "",
      ].filter(Boolean);

      setReverseAddress(parts.length > 0 ? parts.join(", ") : "Approximate location");
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      setReverseAddress(
        selectedRequest?.address
          ? `${selectedRequest.address} (fallback)`
          : "Could not determine location"
      );
    } finally {
      setReverseLoading(false);
    }
  };

  // New: Open note modal before changing status
  const requestStatusChange = (status: RequestStatus) => {
    setPendingStatusChange(status);
    setAdminNoteInput(""); // reset previous note
    setShowNoteModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedRequest || !pendingStatusChange) return;

    const requestId = selectedRequest.id;
    const newStatus = pendingStatusChange;
    const note = adminNoteInput.trim();

    try {
      setUpdatingId(requestId);

      // Call API with both status and admin_notes
      await updateRequestStatus(requestId, {
        status: newStatus,
        admin_notes: note || undefined, // send only if filled
      });

      // Update local state
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: newStatus, admin_notes: note || r.admin_notes }
            : r
        )
      );

      // Refresh selected request
      setSelectedRequest((prev) =>
        prev
          ? { ...prev, status: newStatus, admin_notes: note || prev.admin_notes }
          : null
      );

      // Close note modal
      setShowNoteModal(false);

      // Optional: refresh full list
      // fetchRequests();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Could not update status");
    } finally {
      setUpdatingId(null);
      setPendingStatusChange(null);
      setAdminNoteInput("");
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <FaImage className="text-blue-600" />;
      case 'video':
        return <FaVideo className="text-purple-600" />;
      case 'document':
        return <FaFile className="text-green-600" />;
      default:
        return <FaFile className="text-gray-600" />;
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return 'Image';
      case 'video':
        return 'Video';
      case 'document':
        return 'Document';
      default:
        return 'File';
    }
  };

  // Helper function to get full URL for media file
  const getMediaUrl = (filePath: string) => {
    // Check if we have a base URL from environment, otherwise use relative path
    const baseUrl =  '';
    return filePath.startsWith('http') ? filePath : `${baseUrl}${filePath}`;
  };

  const availableActions = (status: RequestStatus): RequestStatus[] => {
    switch (status) {
      case "Pending":
        return ["Assigned", "Cancelled"];
      case "Assigned":
        return ["In Progress", "Cancelled"];
      case "In Progress":
        return ["Completed", "Cancelled"];
      case "Completed":
      case "Cancelled":
        return [];
      default:
        return [];
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <FaSort className="text-gray-300 ml-1" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="text-blue-600 ml-1" /> 
      : <FaSortDown className="text-blue-600 ml-1" />;
  };

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // Client-side search (secondary filter on current page results)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((r) =>
        r.request_id.toLowerCase().includes(term) ||
        r.customer_name.toLowerCase().includes(term) ||
        r.mobile_number.includes(term) ||
        r.category_name.toLowerCase().includes(term) ||
        (r.subcategory_name?.toLowerCase().includes(term) ?? false) ||
        (r.service_details?.description?.toLowerCase().includes(term) ?? false) ||
        r.address.toLowerCase().includes(term) ||
        (r.admin_notes?.toLowerCase().includes(term) ?? false)
      );
    }

    // Backend handles sorting now, but we keep this as a fallback/secondary
    return result;
  }, [requests, searchTerm]);

  const getStatusColor = (status: RequestStatus) => {
    const colors: Record<RequestStatus, string> = {
      Pending: "bg-yellow-100 text-yellow-800",
      Assigned: "bg-blue-100 text-blue-800",
      "In Progress": "bg-purple-100 text-purple-800",
      Completed: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getActionButtonColor = (action: RequestStatus) => {
    const colors: Partial<Record<RequestStatus, string>> = {
      Assigned: "bg-blue-600 hover:bg-blue-700",
      "In Progress": "bg-purple-600 hover:bg-purple-700",
      Completed: "bg-green-600 hover:bg-green-700",
      Cancelled: "bg-red-600 hover:bg-red-700",
    };
    return colors[action] || "bg-gray-600 hover:bg-gray-700";
  };

  const pageSize = 10;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Service Requests</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: "Total", value: stats.total, color: "text-gray-900" },
            { label: "Pending", value: stats.pending, color: "text-yellow-600" },
            { label: "Assigned", value: stats.assigned, color: "text-blue-600" },
            { label: "In Progress", value: stats.inProgress, color: "text-purple-600" },
            { label: "Completed", value: stats.completed, color: "text-green-600" },
            { label: "Cancelled", value: stats.cancelled, color: "text-red-600" },
          ].map((item) => (
            <div key={item.label} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">{item.label}</div>
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Search + Filter Grid */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
            {/* Search */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ID, name, phone..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Status</label>
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "all")}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Category</label>
              <div className="relative">
                <FaTags className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={categoryIdFilter}
                  onChange={(e) => setCategoryIdFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">From Date</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* End Date & Reset */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">To Date</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                {(statusFilter !== 'all' || categoryIdFilter || startDate || endDate || searchTerm) && (
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setCategoryIdFilter('');
                      setStartDate('');
                      setEndDate('');
                      setSearchTerm('');
                    }}
                    className="p-2.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Clear all filters"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-600 text-lg mb-2">
                {searchTerm || statusFilter !== "all"
                  ? "No matching requests found"
                  : "No service requests found"}
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('request_id')}
                      >
                        <div className="flex items-center">ID {getSortIcon('request_id')}</div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('customer_name')}
                      >
                        <div className="flex items-center">Customer {getSortIcon('customer_name')}</div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('category_name')}
                      >
                        <div className="flex items-center">Service {getSortIcon('category_name')}</div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">Status {getSortIcon('status')}</div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Media
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin Note
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center">Date {getSortIcon('created_at')}</div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{req.request_id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{req.customer_name}</div>
                          <div className="text-sm text-gray-500">{req.mobile_number}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{req.category_name}</div>
                          {req.subcategory_name && (
                            <div className="text-xs text-gray-500">{req.subcategory_name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              req.status
                            )}`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {req.media_files && req.media_files.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {req.media_files.slice(0, 3).map((media) => (
                                  <div
                                    key={media.id}
                                    className="group relative"
                                    title={`${getFileTypeLabel(media.file_type)} - Click to view`}
                                  >
                                    <div className="w-10 h-10 rounded-md bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200 transition cursor-pointer"
                                      onClick={() => {
                                        setSelectedRequest(req);
                                        setSelectedMedia(media);
                                      }}
                                    >
                                      {media.file_type === 'image' ? (
                                        <div className="w-full h-full rounded-md overflow-hidden">
                                          <img
                                            src={getMediaUrl(media.file)}
                                            alt="Media"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              const target = e.currentTarget;
                                              target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dy=".3em">IMG</text></svg>';
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        getFileIcon(media.file_type)
                                      )}
                                    </div>
                                    {req.media_files && req.media_files.length > 3 && (
                                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                                        +{req.media_files.length - 3}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">No media</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {req.admin_notes ? (
                              <div className="group relative">
                                <div className="text-sm text-gray-700 line-clamp-2">
                                  {req.admin_notes}
                                </div>
                                <div className="absolute hidden group-hover:block z-10 w-64 p-3 bg-white shadow-lg rounded-lg border border-gray-200 mt-1">
                                  <div className="flex items-start gap-2">
                                    <FaStickyNote className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-gray-700">{req.admin_notes}</div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">No notes</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2 flex-wrap">
                            {availableActions(req.status).map((action) => (
                              <button
                                key={action}
                                onClick={() => {
                                  setSelectedRequest(req);
                                  requestStatusChange(action);
                                }}
                                disabled={updatingId === req.id}
                                className={`px-3 py-1 text-xs font-medium text-white rounded-md ${getActionButtonColor(
                                  action
                                )} disabled:opacity-50 transition-colors`}
                              >
                                {updatingId === req.id ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  action
                                )}
                              </button>
                            ))}
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-1 transition-colors"
                            >
                              <FaEye />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {filteredRequests.length} of{" "}
                  {totalCount} requests
                </div>
                <div className="flex gap-1 items-center">
                  <button
                    onClick={goToPrevious}
                    disabled={!prevUrl}
                    className="p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous Page"
                  >
                    <FaChevronLeft />
                  </button>

                  <div className="flex gap-1">
                    {getPageNumbers().map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg border transition-all ${
                          currentPage === page
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                            : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {totalPages > 5 && getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                    <>
                      <span className="px-2 text-gray-400">...</span>
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 bg-white transition-all"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={goToNext}
                    disabled={!nextUrl}
                    className="p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next Page"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Space-Saving Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 z-[60]">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
              {/* Compact Header */}
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center border border-gray-100">
                    <FaInfoCircle className="text-gray-400 text-base" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 leading-tight">Request #{selectedRequest.request_id}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className={`w-1.5 h-1.5 rounded-full ${selectedRequest.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{selectedRequest.status}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setSelectedMedia(null);
                  }}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-all"
                >
                  <FaTimes size={14} />
                </button>
              </div>

              {/* Compact Modal Body */}
              <div className="overflow-y-auto p-5 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Section (8 cols) */}
                  <div className="lg:col-span-8 space-y-5">
                    {/* Inline Info Row */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer</span>
                        <p className="text-sm font-bold text-gray-900">{selectedRequest.customer_name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <FaPhone className="text-gray-300 text-[9px]" />
                          {selectedRequest.mobile_number}
                        </p>
                      </div>
                      <div className="flex flex-col border-l border-gray-200 pl-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Service</span>
                        <p className="text-sm font-bold text-gray-900">{selectedRequest.category_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {selectedRequest.subcategory_name || "Standard Request"}
                        </p>
                      </div>
                    </div>

                    {/* Detailed Info */}
                    <div className="space-y-4">
                      <div className="bg-white">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                        <div className="text-xs text-gray-700 leading-relaxed bg-gray-50/30 p-3 rounded border border-gray-100 min-h-[60px]">
                          {selectedRequest.service_details?.description || "No specific details provided."}
                        </div>
                      </div>

                      {selectedRequest.admin_notes && (
                        <div className="bg-amber-50/30 p-3 rounded border border-amber-100/50">
                          <h3 className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Admin Remark</h3>
                          <p className="text-xs text-amber-900 italic font-medium">"{selectedRequest.admin_notes}"</p>
                        </div>
                      )}

                      {/* Dense Media Gallery */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Attachments ({selectedRequest.media_files?.length || 0})</h3>
                        </div>
                        {selectedRequest.media_files && selectedRequest.media_files.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedRequest.media_files.map((media) => (
                              <div
                                key={media.id}
                                className="group relative w-16 h-16 rounded border border-gray-200 cursor-pointer overflow-hidden bg-gray-50 hover:border-blue-400 transition-all flex-shrink-0"
                                onClick={() => setSelectedMedia(media)}
                              >
                                {media.file_type === 'image' ? (
                                  <img
                                    src={getMediaUrl(media.file)}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150?text=Error'; }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-1">
                                    <div className="text-gray-400 text-sm">
                                      {getFileIcon(media.file_type)}
                                    </div>
                                    <span className="text-[8px] text-gray-400 font-bold uppercase mt-1">
                                      {media.file_type}
                                    </span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-gray-50/50 rounded border border-dashed border-gray-200">
                             <p className="text-xs text-gray-400 italic">No attachments</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar Section (4 cols) */}
                  <div className="lg:col-span-4 space-y-6 lg:border-l lg:border-gray-100 lg:pl-6 text-[11px]">
                    {/* Compact Tracking */}
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Timeline</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          <p className="text-gray-500">Created: <span className="font-bold text-gray-900 ml-1">{new Date(selectedRequest.created_at).toLocaleDateString()}</span></p>
                        </div>
                        {selectedRequest.updated_at && (
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                            <p className="text-gray-500">Updated: <span className="font-bold text-gray-900 ml-1">{new Date(selectedRequest.updated_at).toLocaleDateString()}</span></p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Compact Location */}
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Location</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded border border-gray-100">
                           <p className="text-gray-700 leading-tight font-medium text-xs truncate" title={selectedRequest.address}>
                              {selectedRequest.address}
                           </p>
                        </div>
                        
                        {(reverseLoading || reverseAddress) && (
                           <div className="bg-blue-50/30 p-2.5 rounded border border-blue-100/50 flex items-start gap-2">
                              <FaMapPin className="text-blue-400 mt-0.5" />
                              <div className="flex-1">
                                 {reverseLoading ? (
                                    <span className="text-blue-400 animate-pulse font-bold uppercase text-[9px]">Fetching...</span>
                                 ) : (
                                    <p className="text-blue-900 leading-tight font-medium text-[11px] line-clamp-2">
                                       {reverseAddress}
                                    </p>
                                 )}
                              </div>
                           </div>
                        )}

                        <button
                          onClick={() => {
                            const mapUrl = `https://www.google.com/maps?q=${selectedRequest.latitude},${selectedRequest.longitude}`;
                            window.open(mapUrl, "_blank", "noopener,noreferrer");
                          }}
                          className="w-full py-2 bg-gray-900 text-white rounded text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                          <FaMapMarkerAlt className="text-red-400" />
                          Google Maps
                        </button>
                      </div>
                    </div>

                    {/* Compact Actions */}
                    {availableActions(selectedRequest.status).length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Update</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {availableActions(selectedRequest.status).map((action) => (
                            <button
                              key={action}
                              onClick={() => requestStatusChange(action)}
                              disabled={updatingId === selectedRequest.id}
                              className={`py-2 px-2 rounded text-white font-bold text-[9px] uppercase tracking-wide ${getActionButtonColor(action)} transition-transform active:scale-95`}
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Media Preview Modal */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[70] animate-in fade-in duration-200">
            <div className="relative max-w-4xl w-full max-h-[90vh] animate-in zoom-in duration-300">
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl z-10 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
              >
                ×
              </button>
              
              {selectedMedia.file_type === 'image' ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={getMediaUrl(selectedMedia.file)}
                    alt="Preview"
                    className="max-w-full max-h-[85vh] object-contain rounded-lg"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="200" y="150" font-family="Arial" font-size="16" fill="%236b7280" text-anchor="middle" dy=".3em">Image not available</text></svg>';
                    }}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg p-8 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="text-5xl mb-4 text-gray-400">
                      {getFileIcon(selectedMedia.file_type)}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {getFileTypeLabel(selectedMedia.file_type)} File
                    </h3>
                    <p className="text-gray-600 mb-6">
                      This file cannot be previewed directly. You can download it to view.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => window.open(getMediaUrl(selectedMedia.file), '_blank')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <FaExternalLinkAlt />
                        Open
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = getMediaUrl(selectedMedia.file);
                          link.download = selectedMedia.file.split('/').pop() || `file-${selectedMedia.id}`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <FaDownload />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                <button
                  onClick={() => window.open(getMediaUrl(selectedMedia.file), '_blank')}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm flex items-center gap-2"
                >
                  <FaExternalLinkAlt />
                  Open in New Tab
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = getMediaUrl(selectedMedia.file);
                    link.download = selectedMedia.file.split('/').pop() || `file-${selectedMedia.id}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                  <FaDownload />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Note Confirmation Modal */}
        {showNoteModal && pendingStatusChange && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[80] animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  Change status to {pendingStatusChange}?
                </h3>
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setPendingStatusChange(null);
                    setAdminNoteInput("");
                  }}
                  className="text-white hover:text-gray-200 text-xl"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaStickyNote className="text-yellow-500" />
                    Admin Note / Remark (optional)
                  </label>
                  <textarea
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    rows={3}
                    placeholder="Enter any remarks, reason, instructions, or keywords..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This note will be saved with the status change.
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowNoteModal(false);
                      setPendingStatusChange(null);
                      setAdminNoteInput("");
                    }}
                    className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusChange}
                    disabled={updatingId === selectedRequest?.id}
                    className={`px-6 py-2.5 text-white font-medium rounded-lg flex items-center gap-2 ${
                      updatingId === selectedRequest?.id
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {updatingId === selectedRequest?.id ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Confirm Change"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ); 
}