import { useEffect, useState } from "react";
import { getAllRequestedServices, updateRequestStatus } from "../../Api/Service";

/* ───────────────── TYPES ───────────────── */

type RequestStatus =
  | "Pending"
  | "Assigned"
  | "In Progress"
  | "Completed"
  | "Cancelled";

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

/* ───────────────── STATUS COLORS ───────────────── */

const statusColors: Record<RequestStatus, string> = {
  Pending:     "bg-yellow-100 text-yellow-800 border-yellow-300",
  Assigned:    "bg-indigo-100 text-indigo-800 border-indigo-300",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-300",
  Completed:   "bg-green-100 text-green-800 border-green-300",
  Cancelled:   "bg-red-100 text-red-800 border-red-300",
};

/* ───────────────── MAP MODAL ───────────────── */
// (unchanged – keeping it as is)
function MapModal({
  latitude,
  longitude,
  address,
  customerName,
  onClose,
}: {
  latitude: string;
  longitude: string;
  address: string;
  customerName: string;
  onClose: () => void;
}) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const valid = !isNaN(lat) && !isNaN(lng);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b bg-gray-50">
          <div>
            <h2 className="font-bold text-xl">Service Location</h2>
            <p className="text-sm text-gray-600 mt-1">{customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          <p className="mb-4 text-sm text-gray-800 leading-relaxed">
            <strong>Address:</strong> {address}
          </p>

          {valid ? (
            <iframe
              src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
              className="w-full h-[500px] rounded-xl border border-gray-200"
              loading="lazy"
              allowFullScreen
              title="Service Location Map"
            />
          ) : (
            <div className="h-96 flex items-center justify-center bg-gray-50 rounded-xl text-gray-500 text-lg">
              Invalid coordinates provided
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────── MAIN COMPONENT ───────────────── */

export default function History() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [mapData, setMapData] = useState<ServiceRequest | null>(null);

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Service Request History
        </h1>

        {requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
            No service requests found at the moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap font-mono text-sm text-gray-600">
                      {req.request_id}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">
                        {req.customer_name}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {req.mobile_number}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {req.user ? "Registered" : "Guest User"}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                      {req.address.split("\n").map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      <div className="font-medium">{req.category_name}</div>
                      {req.subcategory_name && (
                        <div className="text-xs text-gray-500 mt-1">
                          {req.subcategory_name}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                      {req.service_details?.description ? (
                        <div className="line-clamp-2" title={req.service_details.description}>
                          {req.service_details.description}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${statusColors[req.status]}`}
                      >
                        {req.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        {availableActions(req.status).map((action) => (
                          <button
                            key={action}
                            disabled={updatingId === req.id}
                            onClick={() => updateStatus(req.id, action)}
                            className={`
                              px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                              ${
                                action === "Assigned" || action === "In Progress" || action === "Completed"
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : action === "Cancelled"
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "bg-gray-600 hover:bg-gray-700 text-white"
                              }
                              disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                          >
                            {action}
                          </button>
                        ))}

                        <button
                          onClick={() => setMapData(req)}
                          className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          View Map
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

      {mapData && (
        <MapModal
          latitude={mapData.latitude}
          longitude={mapData.longitude}
          address={mapData.address}
          customerName={mapData.customer_name}
          onClose={() => setMapData(null)}
        />
      )}
    </>
  );
}