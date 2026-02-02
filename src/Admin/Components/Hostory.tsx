import { useState, useEffect, useMemo } from "react";
import { getAllRequestedServices, updateRequestStatus } from "../../Api/Service";
import {
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaEye,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Loader from "../../Component/Loader/Loader";

/* ───────────────── TYPES ───────────────── */
type RequestStatus = "Pending" | "Assigned" | "In Progress" | "Completed" | "Cancelled";

interface User {
  id: number;
  email: string;
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

  // Pagination (URL-based)
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Search & Filter (client-side)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");

  // Stats from API
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async (url?: string) => {
    setLoading(true);
    try {
      const response = url
        ? await getAllRequestedServices(url)
        : await getAllRequestedServices(url);

      console.log("Service requests fetched:", response);

      const data: PaginatedResponse = response.data;

      setRequests(data.results || []);
      setTotalCount(data.count || 0);
      setNextUrl(data.next);
      setPrevUrl(data.previous);

      // Update stats if provided by backend
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

      // Update current page from URL if applicable
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
      setStats({ total: 0, pending: 0, assigned: 0, inProgress: 0, completed: 0, cancelled: 0 });
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

  const updateStatus = async (id: number, status: RequestStatus) => {
    if (!window.confirm(`Change status to "${status}"?`)) return;

    try {
      setUpdatingId(id);
      await updateRequestStatus(id, status);  // ← fixed: now passing both arguments

      // Optimistic UI update
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status } : req))
      );

      // Update local stats
      setStats((prev) => {
        const oldStatusKey = status.toLowerCase() as keyof typeof prev;
        return {
          ...prev,
          [oldStatusKey]: (prev[oldStatusKey] || 0) + 1,
        };
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Could not update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
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

  // Filtered & sorted requests (client-side)
  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((r) =>
        r.request_id.toLowerCase().includes(term) ||
        r.customer_name.toLowerCase().includes(term) ||
        r.mobile_number.includes(term) ||
        r.category_name.toLowerCase().includes(term) ||
        (r.subcategory_name?.toLowerCase().includes(term) ?? false) ||
        (r.service_details?.description?.toLowerCase().includes(term) ?? false) ||
        r.address.toLowerCase().includes(term)
      );
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-gray-900" },
            { label: "Pending", value: stats.pending, color: "text-yellow-600" },
            { label: "Assigned", value: stats.assigned, color: "text-blue-600" },
            { label: "In Progress", value: stats.inProgress, color: "text-purple-600" },
            { label: "Completed", value: stats.completed, color: "text-green-600" },
            { label: "Cancelled", value: stats.cancelled, color: "text-red-600" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, name, phone, service, address..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
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

        {/* Table + Pagination */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-300 text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-lg font-medium">
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
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                          <div className="text-sm font-medium text-gray-900">{req.category_name}</div>
                          {req.subcategory_name && (
                            <div className="text-sm text-gray-500">{req.subcategory_name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              req.status
                            )}`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex flex-wrap gap-2 justify-end">
                            {availableActions(req.status).map((action) => (
                              <button
                                key={action}
                                disabled={updatingId === req.id}
                                onClick={() => updateStatus(req.id, action)}
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
                              <FaEye /> View
                            </button>

                            <button
                              onClick={() => {
                                const mapUrl = `https://www.google.com/maps?q=${req.latitude},${req.longitude}`;
                                window.open(mapUrl, "_blank", "noopener,noreferrer");
                              }}
                              className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 flex items-center gap-1 transition-colors"
                            >
                              <FaMapMarkerAlt /> Map
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-sm gap-4">
                <div className="text-gray-700 text-center sm:text-left">
                  Showing <span className="font-medium">{filteredRequests.length}</span> of{" "}
                  <span className="font-medium">{requests.length}</span> requests
                  {(searchTerm || statusFilter !== "all") && (
                    <div className="text-blue-600 mt-1">
                      (Filtered from {totalCount} total)
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={goToPrevious}
                    disabled={!prevUrl || loading}
                    className="flex items-center gap-2 px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FaChevronLeft />
                    Previous
                  </button>

                  <span className="text-gray-700">
                    Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
                  </span>

                  <button
                    onClick={goToNext}
                    disabled={!nextUrl || loading}
                    className="flex items-center gap-2 px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* View Details Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Service Request Details</h2>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Request ID</h3>
                    <p className="mt-1 font-medium">{selectedRequest.request_id}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                      <p className="mt-1">{selectedRequest.customer_name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                      <p className="mt-1">{selectedRequest.mobile_number}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Service</h3>
                    <p className="mt-1">
                      {selectedRequest.category_name}
                      {selectedRequest.subcategory_name && ` → ${selectedRequest.subcategory_name}`}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="mt-1 whitespace-pre-line">{selectedRequest.address}</p>
                  </div>

                  {selectedRequest.service_details?.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 whitespace-pre-line">{selectedRequest.service_details.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <span
                        className={`mt-1 inline-block px-4 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                          selectedRequest.status
                        )}`}
                      >
                        {selectedRequest.status}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Created</h3>
                      <p className="mt-1">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {availableActions(selectedRequest.status).length > 0 && (
                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Update Status</h3>
                      <div className="flex flex-wrap gap-3">
                        {availableActions(selectedRequest.status).map((action) => (
                          <button
                            key={action}
                            onClick={() => {
                              updateStatus(selectedRequest.id, action);
                              setSelectedRequest(null);
                            }}
                            className={`px-5 py-2 text-white font-medium rounded-md ${getActionButtonColor(action)}`}
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
          </div>
        )}
      </div>
    </div>
  );
}