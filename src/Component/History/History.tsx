import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { serviceHistory } from "../../Api/Service";
import {
  FaMapMarkerAlt,
  FaCalendar,
  FaUser,
  FaPhone,
  FaChevronRight,
  FaExternalLinkAlt,
  FaMapPin,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaHistory,
  FaLock,
  FaInfoCircle,
} from "react-icons/fa";

interface ServiceHistoryItem {
  id: number;
  request_id: string;
  category_name: string;
  subcategory_name: string | null;
  date: string;
  status: string;
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
  const [isGuest, setIsGuest] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsGuest(true);
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await serviceHistory();

        const transformed = data.map((item: any) => ({
          id: item.id,
          request_id: item.request_id,
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

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s === "completed")
      return {
        color: "text-emerald-700",
        bg: "bg-emerald-100",
        icon: <FaCheckCircle className="text-emerald-600" />,
      };
    if (s === "accepted")
      return {
        color: "text-blue-700",
        bg: "bg-blue-100",
        icon: <FaCheckCircle className="text-blue-600" />,
      };
    if (s === "pending")
      return {
        color: "text-amber-700",
        bg: "bg-amber-100",
        icon: <FaHourglassHalf className="text-amber-600" />,
      };
    if (s === "cancelled" || s === "rejected")
      return {
        color: "text-rose-700",
        bg: "bg-rose-100",
        icon: <FaTimesCircle className="text-rose-600" />,
      };
    return {
      color: "text-gray-700",
      bg: "bg-gray-100",
      icon: <FaInfoCircle className="text-gray-500" />,
    };
  };

  if (isGuest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600 mb-6">
              <FaLock size={36} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Guest Mode</h1>
            <p className="text-gray-600 mb-8">
              Login to view your service history, track requests and manage bookings
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
              <FaHistory className="text-blue-600 text-xl" />
              <span className="text-gray-700">Track all your bookings</span>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
              <FaCalendar className="text-purple-600 text-xl" />
              <span className="text-gray-700">View upcoming appointments</span>
            </div>
          </div>

          {/* <button
            onClick={() => navigate("/login")}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition mb-4 flex items-center justify-center gap-3 shadow-md"
          >
            <FaSignInAlt />
            Login Now */}
          {/* </button> */}

          <p className="text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 font-medium hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Service History</h1>
          <p className="text-gray-600 mt-1">View all your service requests</p>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <div className="text-7xl mb-6 opacity-40">📭</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">No requests yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              When you book a service, it will appear here
            </p>
            <button
              onClick={() => navigate("/home")}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
            >
              Book a Service
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const config = getStatusConfig(item.status);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 sm:p-5">
                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {item.category_icon ? (
                            <img
                              src={item.category_icon}
                              alt=""
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <span className="text-xl font-bold text-gray-500">
                              {item.category_name?.charAt(0) || "?"}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {item.category_name}
                          </h3>
                          {item.subcategory_name && (
                            <p className="text-sm text-gray-600 mt-0.5">
                              {item.subcategory_name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <FaCalendar size={14} />
                            <span>
                              {new Date(item.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}
                      >
                        {config.icon}
                        {item.status}
                      </span>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3 mb-4 text-sm text-gray-700">
                      <FaMapMarkerAlt className="text-blue-600 mt-1 flex-shrink-0" />
                      <p className="leading-relaxed">{item.address}</p>
                    </div>

                    {/* Customer info */}
                    <div className="flex flex-wrap gap-6 mb-5 text-sm">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-500" />
                        <span>{item.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-500" />
                        <span>{item.mobile_number}</span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="flex-1 py-3 px-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                      >
                        View Details
                        <FaChevronRight size={14} />
                      </button>

                      <button
                        onClick={() => {
                          const lat = parseFloat(item.latitude);
                          const lng = parseFloat(item.longitude);
                          if (!isNaN(lat) && !isNaN(lng)) {
                            window.open(
                              `https://www.google.com/maps?q=${lat},${lng}`,
                              "_blank"
                            );
                          }
                        }}
                        disabled={!item.latitude || !item.longitude}
                        className={`py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 flex-1 sm:flex-none sm:min-w-[140px] ${
                          item.latitude && item.longitude
                            ? "bg-white border border-blue-200 text-blue-700 hover:bg-blue-50"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <FaMapPin />
                        Map
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-xl font-bold">Service Details</h2>
                <p className="text-sm text-gray-500">#{selectedItem.request_id}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Service</h3>
                <p>{selectedItem.category_name}</p>
                {selectedItem.subcategory_name && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedItem.subcategory_name}
                  </p>
                )}
              </div>

              {selectedItem.description && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Description</h3>
                  <p className="text-gray-700">{selectedItem.description}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Customer</h3>
                <p>{selectedItem.customer_name}</p>
                <p className="text-sm text-gray-600">{selectedItem.mobile_number}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Address</h3>
                <p className="text-gray-700">{selectedItem.address}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Date</h3>
                <p>
                  {new Date(selectedItem.date).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t flex gap-3">
              <button
                onClick={() => {
                  const lat = parseFloat(selectedItem.latitude);
                  const lng = parseFloat(selectedItem.longitude);
                  if (!isNaN(lat) && !isNaN(lng)) {
                    window.open(
                      `https://www.google.com/maps?q=${lat},${lng}`,
                      "_blank"
                    );
                  }
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <FaExternalLinkAlt size={14} />
                Open Map
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
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