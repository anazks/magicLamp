import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { serviceHistory } from "../../Api/Service";
import Loader from "../Loader/Loader";
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
      return { color: "text-emerald-700", bg: "bg-emerald-100", icon: <FaCheckCircle className="text-emerald-600" /> };
    if (s === "accepted")
      return { color: "text-blue-700", bg: "bg-blue-100", icon: <FaCheckCircle className="text-blue-600" /> };
    if (s === "pending")
      return { color: "text-amber-700", bg: "bg-amber-100", icon: <FaHourglassHalf className="text-amber-600" /> };
    if (s === "cancelled" || s === "rejected")
      return { color: "text-rose-700", bg: "bg-rose-100", icon: <FaTimesCircle className="text-rose-600" /> };
    return { color: "text-gray-700", bg: "bg-gray-100", icon: <FaInfoCircle className="text-gray-500" /> };
  };

  if (isGuest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
              <FaLock size={28} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Guest Mode</h1>
            <p className="text-sm text-gray-600 mb-6">
              Login to view your service history and track requests
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
              <FaHistory className="text-blue-600 text-lg" />
              <span className="text-sm text-gray-700">Track all bookings</span>
            </div>
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
              <FaCalendar className="text-purple-600 text-lg" />
              <span className="text-sm text-gray-700">View appointments</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mb-4"
          >
            Login
          </button>
          <p className="text-sm text-gray-600">
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
      <Loader/>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto pt-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Service History</h1>
          <p className="text-sm text-gray-600 mt-0.5">Your past service requests</p>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-6xl mb-4 opacity-40">📭</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">No requests yet</h2>
            <p className="text-sm text-gray-600 mb-6">
              Book a service to see it here
            </p>
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Book a Service
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const config = getStatusConfig(item.status);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow transition-shadow"
                >
                  <div className="p-3.5 sm:p-4">
                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {item.category_icon ? (
                            <img
                              src={item.category_icon}
                              alt=""
                              className="w-7 h-7 object-contain"
                            />
                          ) : (
                            <span className="text-lg font-bold text-gray-500">
                              {item.category_name?.charAt(0) || "?"}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 text-base">
                            {item.category_name}
                          </h3>
                          {item.subcategory_name && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              {item.subcategory_name}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <FaCalendar size={12} />
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
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
                      >
                        {config.icon}
                        {item.status}
                      </span>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2.5 mb-3 text-xs sm:text-sm text-gray-700">
                      <FaMapMarkerAlt className="text-blue-600 mt-0.5 flex-shrink-0 text-sm" />
                      <p className="leading-relaxed line-clamp-2">{item.address}</p>
                    </div>

                    {/* Customer info */}
                    <div className="flex flex-wrap gap-4 mb-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <FaUser className="text-gray-500 text-sm" />
                        <span>{item.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaPhone className="text-gray-500 text-sm" />
                        <span>{item.mobile_number}</span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-1.5"
                      >
                        View Details
                        <FaChevronRight size={12} />
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
                        className={`py-2.5 px-5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 flex-1 sm:flex-none sm:min-w-[110px] ${
                          item.latitude && item.longitude
                            ? "bg-white border border-blue-200 text-blue-700 hover:bg-blue-50"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <FaMapPin size={13} />
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

      {/* Compact Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[85vh] overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-lg font-bold">Service Details</h2>
                <p className="text-xs text-gray-500">#{selectedItem.request_id}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85vh-120px)] text-sm">
              <div>
                <h3 className="font-semibold text-gray-800 mb-0.5">Service</h3>
                <p>{selectedItem.category_name}</p>
                {selectedItem.subcategory_name && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    {selectedItem.subcategory_name}
                  </p>
                )}
              </div>

              {selectedItem.description && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-0.5">Description</h3>
                  <p className="text-gray-700">{selectedItem.description}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-800 mb-0.5">Customer</h3>
                <p>{selectedItem.customer_name}</p>
                <p className="text-xs text-gray-600">{selectedItem.mobile_number}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-0.5">Address</h3>
                <p className="text-gray-700">{selectedItem.address}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-0.5">Date</h3>
                <p className="text-gray-700">
                  {new Date(selectedItem.date).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex gap-3">
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
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center justify-center gap-1.5"
              >
                <FaExternalLinkAlt size={12} />
                Open Map
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
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