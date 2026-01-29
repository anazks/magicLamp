import { useState, useEffect } from "react";
import { serviceHistory } from "../../Api/Service";

interface ServiceHistoryItem {
  id: number;
  request_id: string;
  service_name: string;
  category_name: string;
  subcategory_name: string | null;
  date: string;
  status: string;
  amount?: string;
  description?: string;
  address: string;
  latitude: string;
  longitude: string;
  mobile_number: string;
  customer_name: string;
  category_icon?: string | null;
}

export default function History() {
  const [history, setHistory] = useState<ServiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ServiceHistoryItem | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await serviceHistory();
        const transformed = data.map((item: any) => ({
          id: item.id,
          request_id: item.request_id,
          service_name: item.category_name,
          category_name: item.category_name,
          subcategory_name: item.subcategory_name,
          date: item.created_at,
          status: item.status,
          description: item.service_details?.description,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          mobile_number: item.mobile_number,
          customer_name: item.customer_name,
          category_icon: item.category_icon,
          amount: "₹---", // ← implement later if needed
        }));
        setHistory(transformed);
      } catch (err: any) {
        setError(err.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === "completed") return "bg-green-100 text-green-700";
    if (s === "accepted")  return "bg-blue-100 text-blue-700";
    if (s === "pending")   return "bg-yellow-100 text-yellow-700";
    if (s === "cancelled" || s === "rejected") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  const handleViewDetails = (item: ServiceHistoryItem) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);

  const openMap = (item: ServiceHistoryItem) => {
    const lat = parseFloat(item.latitude);
    const lng = parseFloat(item.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    }
  };

  const callCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Service History</h1>
        <p className="text-gray-600 mb-8">Your past service requests</p>

        {history.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border">
            <p className="text-6xl mb-4">📪</p>
            <h2 className="text-xl font-semibold mb-2">No requests yet</h2>
            <p className="text-gray-500 mb-6">When you book a service, it will appear here.</p>
            <button
              onClick={() => (window.location.href = "/home")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Find Services
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white border rounded-lg p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left - Main info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {item.category_icon ? (
                          <img src={item.category_icon} alt="" className="w-6 h-6" />
                        ) : (
                          <span className="text-gray-500 font-medium">
                            {item.category_name?.[0] || "?"}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.category_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(item.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.subcategory_name && (
                        <span className="text-xs px-2.5 py-1 bg-gray-100 rounded-full">
                          {item.subcategory_name}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusStyle(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {item.address}
                    </p>
                  </div>

                  {/* Right - Actions */}
                  <div className="flex gap-2 sm:flex-col sm:items-end">
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Details
                    </button>

                    {/* {item.status.toLowerCase() === "pending" && (
                      <button
                        onClick={() => callCustomer(item.mobile_number)}
                        className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Call
                      </button>
                    )} */}

                    <button
                      onClick={() => openMap(item)}
                      disabled={!item.latitude || !item.longitude}
                      className={`px-4 py-1.5 text-sm rounded ${
                        item.latitude && item.longitude
                          ? "border border-purple-300 text-purple-700 hover:bg-purple-50"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Map
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simple Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Service Details</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 text-2xl">
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <div className="text-sm text-gray-500">Service</div>
                <div className="font-medium">{selectedItem.category_name}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(selectedItem.status)}`}>
                  {selectedItem.status}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Date</div>
                <div>{new Date(selectedItem.date).toLocaleString("en-IN")}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Customer</div>
                <div>{selectedItem.customer_name} • {selectedItem.mobile_number}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Address</div>
                <div className="text-gray-700">{selectedItem.address}</div>
              </div>

              {selectedItem.description && (
                <div>
                  <div className="text-sm text-gray-500">Description</div>
                  <div className="text-gray-700 mt-1">{selectedItem.description}</div>
                </div>
              )}
            </div>

            <div className="p-5 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  openMap(selectedItem);
                  closeModal();
                }}
                disabled={!selectedItem.latitude || !selectedItem.longitude}
                className={`px-5 py-2 rounded ${
                  selectedItem.latitude && selectedItem.longitude
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Open Map
              </button>
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}