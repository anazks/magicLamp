import { useState, useEffect } from "react";
import { serviceHistory } from "../../Api/Service";
import {
  FaMapMarkerAlt,
  FaCalendar,
  FaUser,
  FaPhone,
  FaClock,
  FaChevronRight,
  FaExternalLinkAlt,
  FaInfoCircle,
  FaMapPin,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
} from "react-icons/fa";

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
          amount: "₹---",
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
    if (s === "completed") return { bg: "from-emerald-500 to-green-500", text: "text-green-700", icon: <FaCheckCircle className="text-emerald-500" />, badge: "bg-emerald-100 text-emerald-700", glow: "shadow-lg shadow-emerald-500/20" };
    if (s === "accepted")   return { bg: "from-blue-500 to-cyan-500",    text: "text-blue-700",   icon: <FaCheckCircle className="text-blue-500" />,   badge: "bg-blue-100 text-blue-700",   glow: "shadow-lg shadow-blue-500/20" };
    if (s === "pending")    return { bg: "from-amber-500 to-orange-500", text: "text-amber-700",  icon: <FaHourglassHalf className="text-amber-500" />, badge: "bg-amber-100 text-amber-700",  glow: "shadow-lg shadow-amber-500/20" };
    if (s === "cancelled" || s === "rejected") return { bg: "from-rose-500 to-pink-500", text: "text-rose-700", icon: <FaTimesCircle className="text-rose-500" />, badge: "bg-rose-100 text-rose-700", glow: "shadow-lg shadow-rose-500/20" };
    return { bg: "from-gray-500 to-slate-500", text: "text-gray-700", icon: <FaInfoCircle className="text-gray-500" />, badge: "bg-gray-100 text-gray-700", glow: "shadow-lg shadow-gray-500/20" };
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative w-20 h-20 border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-border rounded-full animate-spin">
              <div className="absolute inset-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading your history...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-4">
        <div className="text-center max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/40">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl text-white">⚠️</span>
            </div>
          </div>
          <p className="text-gray-800 mb-6 text-lg font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 z-10 pt-6 pb-6 backdrop-blur-sm bg-white/30 rounded-b-3xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Service History
              </h1>
              <p className="text-gray-500 mt-1">Track all your service requests</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/40 shadow-sm">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {history.length} {history.length === 1 ? "Request" : "Requests"}
              </span>
            </div>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 mt-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full flex items-center justify-center">
                <span className="text-6xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">📭</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No requests yet</h2>
            <p className="text-gray-500 mb-10 max-w-md mx-auto">
              Your service history will appear here once you book your first service
            </p>
            <button
              onClick={() => (window.location.href = "/home")}
              className="px-10 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg group"
            >
              <span className="flex items-center gap-2 justify-center">
                Book First Service
                <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-5 mt-6">
            {history.map((item, index) => {
              const statusConfig = getStatusConfig(item.status);

              return (
                <div
                  key={item.id}
                  className="group relative animate-fade"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />

                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                    <div className={`h-1 bg-gradient-to-r ${statusConfig.bg} ${statusConfig.glow}`} />

                    <div className="p-5">
                      <div className="flex items-start gap-4 mb-5">
                        <div className="relative">
                          <div className={`absolute inset-0 bg-gradient-to-r ${statusConfig.bg} rounded-2xl blur-md opacity-20`} />
                          <div className="relative w-16 h-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl flex items-center justify-center shadow-lg border border-white">
                            {item.category_icon ? (
                              <img src={item.category_icon} alt="" className="w-8 h-8 object-contain" />
                            ) : (
                              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {item.category_name?.[0] || "S"}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                                {item.category_name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <FaCalendar className="text-blue-500" />
                                <span>{new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                <span className="mx-1">•</span>
                                <FaClock className="text-purple-500" />
                                <span>{new Date(item.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                            </div>

                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.badge} border border-white/40 shadow-sm`}>
                              {statusConfig.icon}
                              <span className="text-xs font-bold">{item.status.toUpperCase()}</span>
                            </div>
                          </div>

                          {item.subcategory_name && (
                            <div className="mt-3">
                              <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100/50">
                                {item.subcategory_name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Address, Customer info, Buttons – same as before */}
                      <div className="mb-5 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl border border-blue-100/30">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <FaMapMarkerAlt className="text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 line-clamp-2">{item.address}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <FaUser className="text-blue-600 text-sm" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{item.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                              <FaPhone className="text-green-600 text-sm" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{item.mobile_number}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">ID: {item.request_id}</div>
                      </div>

                      <div className="flex gap-3 flex-col sm:flex-row">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg group"
                        >
                          <span className="flex items-center justify-center gap-2">
                            View Details
                            <FaChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
                          </span>
                        </button>
                        <button
                          onClick={() => openMap(item)}
                          disabled={!item.latitude || !item.longitude}
                          className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 flex-1 sm:flex-none sm:w-28 ${
                            item.latitude && item.longitude
                              ? "bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg hover:scale-105"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200"
                          }`}
                        >
                          <FaMapPin />
                          Map
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal – using Tailwind animate-[...] */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade">
          <div className="bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-xl rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/40 transform animate-[slide-up_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <div className="relative p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Service Details</h2>
                  <p className="text-blue-100/90 text-sm">Request #{selectedItem.request_id}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90"
                >
                  <span className="text-2xl leading-none">×</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Keep your modal content the same – just remove animate classes if any */}
              {/* ... your existing modal cards ... */}
            </div>

            <div className="p-6 border-t border-gray-100/50 flex gap-3">
              <button
                onClick={() => { openMap(selectedItem); closeModal(); }}
                disabled={!selectedItem.latitude || !selectedItem.longitude}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  selectedItem.latitude && selectedItem.longitude
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl hover:scale-105 shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <FaExternalLinkAlt />
                Open Map
              </button>
              <button
                onClick={closeModal}
                className="px-8 py-3 bg-gradient-to-br from-gray-100 to-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 border border-gray-200"
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