import { useEffect, useState, useMemo } from "react";
import { getAllRequestedServices, updateRequestStatus } from "../../Api/Service";
import { FaSearch, FaFilter, FaMapMarkerAlt, FaEye, FaSpinner } from "react-icons/fa";
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

/* ───────────────── MAIN COMPONENT ───────────────── */
export default function History() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  
  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllRequestedServices();
      let data: ServiceRequest[] = [];

      if (res?.data?.results) data = res.data.results;
      else if (res?.data && Array.isArray(res.data)) data = res.data;
      else if (Array.isArray(res)) data = res;

      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: RequestStatus) => {
    if (!window.confirm(`Change status to "${status}"?`)) return;

    try {
      setUpdatingId(id);
      await updateRequestStatus(id, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status. Please try again.");
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

  // Filtered requests
  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (statusFilter !== "all") {
      result = result.filter((req) => req.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((req) =>
        req.request_id.toLowerCase().includes(term) ||
        req.customer_name.toLowerCase().includes(term) ||
        req.mobile_number.includes(term) ||
        req.category_name.toLowerCase().includes(term) ||
        (req.subcategory_name?.toLowerCase().includes(term) ?? false) ||
        (req.service_details?.description?.toLowerCase().includes(term) ?? false) ||
        req.address.toLowerCase().includes(term)
      );
    }

    // Sort by latest first
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result;
  }, [requests, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === "Pending").length,
      assigned: requests.filter(r => r.status === "Assigned").length,
      inProgress: requests.filter(r => r.status === "In Progress").length,
      completed: requests.filter(r => r.status === "Completed").length,
      cancelled: requests.filter(r => r.status === "Cancelled").length,
    };
  }, [requests]);

  if (loading) {
    return (
      <Loader/>
    );
  }

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Assigned": return "bg-blue-100 text-blue-800";
      case "In Progress": return "bg-purple-100 text-purple-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getActionButtonColor = (action: RequestStatus) => {
    switch (action) {
      case "Assigned": return "bg-blue-600 hover:bg-blue-700";
      case "In Progress": return "bg-purple-600 hover:bg-purple-700";
      case "Completed": return "bg-green-600 hover:bg-green-700";
      case "Cancelled": return "bg-red-600 hover:bg-red-700";
      default: return "bg-gray-600 hover:bg-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Assigned</p>
            <p className="text-2xl font-bold text-blue-600">{stats.assigned}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search requests..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
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

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">📋</div>
              <p className="text-gray-500 text-lg">
                {requests.length === 0
                  ? "No service requests found"
                  : "No requests match your filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
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
                        <div className="text-sm font-medium text-gray-900">
                          {req.request_id}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {req.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {req.mobile_number}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {req.category_name}
                          </div>
                          {req.subcategory_name && (
                            <div className="text-sm text-gray-500">
                              {req.subcategory_name}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {availableActions(req.status).map((action) => (
                            <button
                              key={action}
                              disabled={updatingId === req.id}
                              onClick={() => updateStatus(req.id, action)}
                              className={`px-3 py-1 text-xs font-medium text-white rounded ${getActionButtonColor(action)} disabled:opacity-50`}
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
                            className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-1"
                          >
                            <FaEye /> View
                          </button>
                          
                          <button
                            onClick={() => {
                              const mapUrl = `https://www.google.com/maps?q=${req.latitude},${req.longitude}`;
                              window.open(mapUrl, '_blank');
                            }}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 flex items-center gap-1"
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
          )}
        </div>

        {/* Request Details Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Request ID</h3>
                    <p className="mt-1 text-gray-900">{selectedRequest.request_id}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Customer Name</h3>
                      <p className="mt-1 text-gray-900">{selectedRequest.customer_name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Mobile Number</h3>
                      <p className="mt-1 text-gray-900">{selectedRequest.mobile_number}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Service</h3>
                    <p className="mt-1 text-gray-900">
                      {selectedRequest.category_name}
                      {selectedRequest.subcategory_name && ` › ${selectedRequest.subcategory_name}`}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="mt-1 text-gray-900 whitespace-pre-line">{selectedRequest.address}</p>
                  </div>
                  
                  {selectedRequest.service_details?.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-gray-900">{selectedRequest.service_details.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <span className={`mt-1 inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Created Date</h3>
                      <p className="mt-1 text-gray-900">
                        {new Date(selectedRequest.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Update Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableActions(selectedRequest.status).map((action) => (
                        <button
                          key={action}
                          onClick={() => {
                            updateStatus(selectedRequest.id, action);
                            setSelectedRequest(null);
                          }}
                          className={`px-4 py-2 text-sm font-medium text-white rounded ${getActionButtonColor(action)}`}
                        >
                          Mark as {action}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}