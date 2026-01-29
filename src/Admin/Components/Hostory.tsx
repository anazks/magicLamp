import { useEffect, useState } from "react";
import { getAllRequestedServices, updateRequestStatus } from "../../Api/Service";

/* ───────────────── TYPES ───────────────── */

type RequestStatus =
  | "Pending"
  | "Accepted"
  | "Completed"
  | "Cancelled"
  | "Rejected";

interface User {
  id: number;
  email: string;
}

interface ServiceRequest {
  id: number;
  request_id: string;
  user: User;
  customer_name: string;
  mobile_number: string;
  category_name: string;
  subcategory_name: string | null;
  service_details: { description: string };
  address: string;
  latitude: string;
  longitude: string;
  status: RequestStatus;
  created_at: string;
}

/* ───────────────── MAP MODAL ───────────────── */

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-xl">
        <div className="p-4 flex justify-between border-b">
          <div>
            <h2 className="font-bold text-lg">Service Location</h2>
            <p className="text-sm text-gray-600">{customerName}</p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-4">
          <p className="mb-3 text-sm text-gray-800">
            <strong>Address:</strong> {address}
          </p>

          {valid ? (
            <iframe
              src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
              className="w-full h-96 rounded-lg border"
              loading="lazy"
              title="Map"
            />
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              Invalid coordinates
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
    const res = await getAllRequestedServices();
    setRequests(res.data?.results ?? res.results);
    setLoading(false);
  };

  const updateStatus = async (id: number, status: RequestStatus) => {
    if (!window.confirm(`Change status to ${status}?`)) return;

    try {
      setUpdatingId(id);
      await updateRequestStatus(id, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const actions = (status: RequestStatus): RequestStatus[] => {
    if (status === "Pending") return ["Accepted", "Rejected", "Cancelled"];
    if (status === "Accepted") return ["Completed", "Cancelled"];
    return [];
  };

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <>
      <div className="p-6 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Service Request History</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Request ID</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Address</th>
                <th className="p-3 text-left">Service</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-t">
                  <td className="p-3 font-mono text-sm">
                    {req.request_id}
                  </td>

                  <td className="p-3">
                    <div className="font-medium">{req.customer_name}</div>
                    <div className="text-xs text-gray-500">
                      {req.mobile_number}
                    </div>
                  </td>

                  {/* ✅ ADDRESS SHOWN HERE */}
                  <td className="p-3 max-w-xs text-sm text-gray-700">
                    {req.address}
                  </td>

                  <td className="p-3 text-sm">
                    <div>{req.category_name}</div>
                    <div className="text-xs text-gray-500">
                      {req.subcategory_name ?? "—"}
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100">
                      {req.status}
                    </span>
                  </td>

                  <td className="p-3 space-x-2">
                    {actions(req.status).map((a) => (
                      <button
                        key={a}
                        disabled={updatingId === req.id}
                        onClick={() => updateStatus(req.id, a)}
                        className="px-3 py-1 text-xs bg-black text-white rounded"
                      >
                        {a}
                      </button>
                    ))}

                    <button
                      onClick={() => setMapData(req)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded"
                    >
                      View Map
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
