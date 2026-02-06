import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { serviceHistory } from "../../Api/Service";
import Loader from "../Loader/Loader";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
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

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase().trim();

    if (s === "completed")
      return {
        label: "Completed",
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: <FaCheckCircle className="text-emerald-600" />,
      };
    if (s === "accepted")
      return {
        label: "Accepted",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <FaCheckCircle className="text-blue-600" />,
      };
    if (s === "pending")
      return {
        label: "Pending",
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: <FaHourglassHalf className="text-amber-600" />,
      };
    if (s === "cancelled" || s === "rejected")
      return {
        label: s === "cancelled" ? "Cancelled" : "Rejected",
        color: "bg-rose-100 text-rose-800 border-rose-200",
        icon: <FaTimesCircle className="text-rose-600" />,
      };

    return {
      label: status || "Unknown",
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: <FaInfoCircle className="text-gray-500" />,
    };
  };

  if (isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600 mb-6 shadow-md">
              <FaLock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Guest Mode</h1>
            <p className="text-gray-600 mb-8">
              Please login to view your service history and track your requests
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <FaHistory className="text-blue-600 text-xl" />
              <span className="text-gray-700 font-medium">Track all your bookings</span>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <FaCalendarAlt className="text-purple-600 text-xl" />
              <span className="text-gray-700 font-medium">View past appointments</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition mb-4"
          >
            Login Now
          </button>

          <p className="text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-6 opacity-70">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Oops!</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto pt-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaHistory className="text-blue-600" />
            Service History
          </h1>
          <p className="text-gray-600 mt-2">View and track all your past service requests</p>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-10 text-center border border-gray-100">
            <div className="text-7xl mb-6 opacity-40">📭</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">No service requests yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              When you book a service, it will appear here so you can track its status
            </p>
            <button
              onClick={() => navigate("/home")}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition"
            >
              Book a Service Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const badge = getStatusBadge(item.status);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="p-4 sm:p-5">
                    {/* Top section */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-200">
                          {item.category_icon ? (
                            <img
                              src={item.category_icon}
                              alt=""
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-gray-400">
                              {item.category_name?.charAt(0) || "?"}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {item.category_name}
                          </h3>
                          {item.subcategory_name && (
                            <p className="text-sm text-gray-600 mt-0.5">
                              {item.subcategory_name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                            <FaCalendarAlt size={14} />
                            <span>
                              {new Date(item.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border ${badge.color}`}
                      >
                        {badge.icon}
                        {badge.label}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3 mb-4 text-sm text-gray-700">
                      <FaMapMarkerAlt className="text-blue-600 mt-1 flex-shrink-0 text-lg" />
                      <p className="leading-relaxed line-clamp-2">{item.address}</p>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 sm:flex sm:gap-6 mb-5 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-500" />
                        <span>{item.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-500" />
                        <span>{item.mobile_number}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="flex-1 py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        View Full Details
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
                        className={`py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 flex-1 sm:flex-none sm:min-w-[130px] transition ${
                          item.latitude && item.longitude
                            ? "bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <FaMapPin size={14} />
                        View on Map
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in-up">
            {/* Header */}
            <div className="p-5 border-b bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Service Details</h2>
                <p className="text-sm text-gray-500 mt-0.5">#{selectedItem.request_id}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-600 hover:text-gray-900 text-2xl p-2 hover:bg-gray-100 rounded-full transition"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Service</h3>
                  <p className="font-medium">{selectedItem.category_name}</p>
                  {selectedItem.subcategory_name && (
                    <p className="text-sm text-gray-600 mt-1">{selectedItem.subcategory_name}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  {(() => {
                    const badge = getStatusBadge(selectedItem.status);
                    return (
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${badge.color}`}
                      >
                        {badge.icon}
                        {badge.label}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {selectedItem.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedItem.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Customer</h3>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{selectedItem.customer_name}</p>
                  <p className="text-gray-600">{selectedItem.mobile_number}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
                <p className="text-gray-700">{selectedItem.address}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Requested On</h3>
                <p className="text-gray-700">
                  {new Date(selectedItem.date).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t bg-gray-50 flex gap-4">
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
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 shadow-sm"
              >
                <FaExternalLinkAlt size={14} />
                Open in Maps
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition"
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