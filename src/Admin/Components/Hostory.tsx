import { useState, useEffect, useMemo } from "react";
import { getAllRequestedServices, updateRequestStatus } from "../../Api/Service";
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
  FaExpand,
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

interface PaginatedResponse {
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
    fetchRequests();
  }, []);

  const fetchRequests = async (url?: string) => {
    setLoading(true);
    try {
      const response = url
        ? await getAllRequestedServices(url)
        : await getAllRequestedServices(undefined); // Fixed: added undefined parameter
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

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

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

    result.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return result;
  }, [requests, searchTerm, statusFilter]);

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
    <div className="min-h-screen bg-gray-50 p-6">
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

        {/* Search + Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, name, phone, service, address, note..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "all")}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Media Files
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
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
                <div className="flex gap-2">
                  <button
                    onClick={goToPrevious}
                    disabled={!prevUrl}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaChevronLeft />
                    Previous
                  </button>
                  <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                    Page {currentPage} of {totalPages || 1}
                  </div>
                  <button
                    onClick={goToNext}
                    disabled={!nextUrl}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-300">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-900">Service Request Details</h2>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setSelectedMedia(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Request ID</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedRequest.request_id}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Customer</h3>
                  <p className="text-lg text-gray-900">{selectedRequest.customer_name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                  <p className="text-lg text-gray-900">{selectedRequest.mobile_number}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Service</h3>
                  <p className="text-lg text-gray-900">
                    {selectedRequest.category_name}{" "}
                    {selectedRequest.subcategory_name && `→ ${selectedRequest.subcategory_name}`}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Stored Address</h3>
                  <p className="text-gray-900">{selectedRequest.address}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-500" />
                    Approximate Location
                  </h3>
                  {reverseLoading ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaSpinner className="animate-spin" />
                      Loading location...
                    </div>
                  ) : (
                    <p className="text-gray-900">{reverseAddress}</p>
                  )}
                  {selectedRequest.latitude && selectedRequest.longitude && (
                    <button
                      onClick={() => {
                        const mapUrl = `https://www.google.com/maps?q=${selectedRequest.latitude},${selectedRequest.longitude}`;
                        window.open(mapUrl, "_blank", "noopener,noreferrer");
                      }}
                      className="mt-2 px-4 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 flex items-center gap-2"
                    >
                      <FaMapMarkerAlt />
                      Get Directions
                    </button>
                  )}
                </div>

                {/* Media Files Section */}
                {selectedRequest.media_files && selectedRequest.media_files.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                      <FaImage className="text-blue-500" />
                      Media Files ({selectedRequest.media_files.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedRequest.media_files.map((media) => (
                        <div
                          key={media.id}
                          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div 
                            className="aspect-square bg-gray-100 relative cursor-pointer group"
                            onClick={() => setSelectedMedia(media)}
                          >
                            {media.file_type === 'image' ? (
                              <>
                                <img
                                  src={getMediaUrl(media.file)}
                                  alt={`Media ${media.id}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" font-family="Arial" font-size="10" fill="%236b7280" text-anchor="middle" dy=".3em">Image</text></svg>';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                                  <FaExpand className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                <div className="text-3xl mb-2">
                                  {getFileIcon(media.file_type)}
                                </div>
                                <span className="text-xs text-gray-600 text-center">
                                  {getFileTypeLabel(media.file_type)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-2 bg-white border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500 truncate">
                                {new Date(media.created_at).toLocaleDateString()}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(getMediaUrl(media.file), '_blank');
                                  }}
                                  className="p-1 text-gray-500 hover:text-blue-600"
                                  title="View"
                                >
                                  <FaExternalLinkAlt size={12} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const link = document.createElement('a');
                                    link.href = getMediaUrl(media.file);
                                    link.download = media.file.split('/').pop() || `file-${media.id}`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  className="p-1 text-gray-500 hover:text-green-600"
                                  title="Download"
                                >
                                  <FaDownload size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequest.service_details?.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedRequest.service_details.description}
                    </p>
                  </div>
                )}

                {selectedRequest.admin_notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                      <FaStickyNote className="text-yellow-500" />
                      Admin Notes
                    </h3>
                    <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg border border-yellow-200 whitespace-pre-wrap">
                      {selectedRequest.admin_notes}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <span
                    className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(
                      selectedRequest.status
                    )}`}
                  >
                    {selectedRequest.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                  <p className="text-gray-900">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>

                {availableActions(selectedRequest.status).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Update Status</h3>
                    <div className="flex flex-wrap gap-3">
                      {availableActions(selectedRequest.status).map((action) => (
                        <button
                          key={action}
                          onClick={() => requestStatusChange(action)}
                          disabled={updatingId === selectedRequest.id}
                          className={`px-5 py-2 text-white font-medium rounded-md ${getActionButtonColor(action)} disabled:opacity-50`}
                        >
                          Mark as {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Media Preview Modal */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl w-full max-h-[90vh]">
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
          <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border border-gray-300">
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