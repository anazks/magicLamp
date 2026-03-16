import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { serviceHistory, cancelServiceRequest } from "../../Api/Service";
import Loader from "../Loader/Loader";
import { baseURL } from "../../Static/Static";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaHistory,
  FaLock,
  FaInfoCircle,
  FaStickyNote,
  FaEdit,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";
import EditHistory from "./EditHistory";

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
  admin_notes?: string;
  media_files?: any[];
}

const getFullUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const base = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
};

export default function History() {
  const [history, setHistory] = useState<ServiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ServiceHistoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<ServiceHistoryItem | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsGuest(true);
      setLoading(false);
      return;
    }

    fetchHistory();
  }, []);

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
        admin_notes: item.admin_notes,
        media_files: item.media_files,
      }));

      setHistory(transformed);
    } catch (err: any) {
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    fetchHistory();
  };
  
  const handleCancel = (id: number) => {
    setCancelConfirmId(id);
  };

  const confirmCancel = async () => {
    if (!cancelConfirmId) return;
    try {
      setLoading(true);
      await cancelServiceRequest(cancelConfirmId);
      showToast("Request cancelled successfully", "success");
      setSelectedItem(null);
      fetchHistory();
    } catch (error) {
      showToast("Failed to cancel request", "error");
    } finally {
      setCancelConfirmId(null);
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = (status || "").toLowerCase().trim();
    if (s === "completed") {
      return {
        label: "Completed",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-100",
        icon: <FaCheckCircle className="text-emerald-500" />,
      };
    }
    if (s === "accepted" || s === "assigned" || s === "in progress") {
      return {
        label: status,
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-100",
        icon: <FaHistory className="text-blue-500" />,
      };
    }
    if (s === "pending") {
      return {
        label: "Pending",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-100",
        icon: <FaHourglassHalf className="text-amber-500 animate-pulse" />,
      };
    }
    return {
      label: status || "Rejected",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-100",
      icon: <FaTimesCircle className="text-rose-500" />,
    };
  };

  if (isGuest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <FaLock size={32} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Guest Mode</h1>
            <p className="text-gray-600 px-4">
              Please log in to view your service history and track your requests.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
            >
              Log in to Continue
            </button>
            <button
              onClick={() => navigate("/register")}
              className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-sm w-full">
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
            <FaInfoCircle size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <FaArrowLeft size={12} />
            </button>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">History</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <FaHistory size={14} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 pt-8">
        {history.length === 0 ? (
          <div className="py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto">
              <FaHistory size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Requests Found</h2>
              <p className="text-gray-500 max-w-xs mx-auto">
                Once you start booking services, they will appear here for you to track.
              </p>
            </div>
            <button
              onClick={() => navigate("/home")}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
            >
              Explore Services
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const statusStyle = getStatusStyle(item.status);
              const isPending = item.status.toLowerCase() === "pending";

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center p-2 border border-gray-200 shrink-0">
                          {item.category_icon ? (
                            <img src={item.category_icon} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-lg font-bold text-gray-400">
                              {item.category_name?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">#{item.request_id}</p>
                          <h3 className="text-lg font-bold text-gray-900 leading-tight truncate" title={item.category_name}>
                            {item.category_name}
                          </h3>
                          {item.subcategory_name && (
                            <p className="text-sm text-gray-500 font-medium truncate">{item.subcategory_name}</p>
                          )}
                          {isPending && (
                            <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600 w-fit">
                              <FaEdit size={8} />
                              EDITABLE OR CANCELABLE
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} text-xs font-semibold self-start whitespace-nowrap`}>
                        {statusStyle.icon}
                        {statusStyle.label}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCalendarAlt className="text-gray-400" size={14} />
                        <span className="font-medium">
                          {new Date(item.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaMapMarkerAlt className="text-gray-400" size={14} />
                        <span className="truncate font-medium">{item.address}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
                          {item.customer_name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate">{item.customer_name}</span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {isPending && (
                          <button
                            onClick={() => setEditingItem(item)}
                            className="flex-1 sm:flex-none p-2.5 flex items-center justify-center bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-all border border-gray-200"
                            title="Edit Request"
                          >
                            <FaEdit size={14} />
                            <span className="sm:hidden ml-2 text-xs font-bold">Edit</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="flex-[2] sm:flex-none px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          View Details
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

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-black/60 animate-fade-in" 
            onClick={() => setSelectedItem(null)} 
          />
          <div className="relative w-full max-w-lg bg-white sm:rounded-xl shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col border border-gray-200">
            {/* Modal Header */}
            <div className="px-4 py-3 sm:px-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100/50 shrink-0">
                  <FaHistory className="text-blue-500 text-sm" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Service Details</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Order #{selectedItem.request_id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all border border-gray-200 shadow-sm"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 pb-8">
              {/* Status & Service Header */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-60"></div>
                <div className="relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1.5">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight break-words">{selectedItem.category_name}</h3>
                    {(() => {
                      const s = getStatusStyle(selectedItem.status);
                      return (
                        <div className={`px-3 py-1 rounded-full border ${s.bg} ${s.text} ${s.border} text-[10px] font-bold uppercase tracking-wider w-fit whitespace-nowrap shadow-sm`}>
                          {s.label}
                        </div>
                      );
                    })()}
                  </div>
                  {selectedItem.subcategory_name && (
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                       {selectedItem.subcategory_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Information Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer</p>
                    <div className="flex items-center gap-3">
                      <FaUser className="text-blue-500" />
                      <p className="text-sm font-bold text-gray-900 leading-none">{selectedItem.customer_name}</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact</p>
                    <div className="flex items-center gap-3">
                      <FaPhone className="text-emerald-500" />
                      <p className="text-sm font-bold text-gray-900 leading-none">{selectedItem.mobile_number}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Service Location</p>
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-rose-500 mt-1" />
                    <p className="text-sm font-medium text-gray-700 leading-relaxed">{selectedItem.address}</p>
                  </div>
                </div>

                {selectedItem.description && (
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</p>
                    <p className="text-sm text-gray-600 leading-relaxed italic border-l-4 border-blue-500 pl-3">
                      "{selectedItem.description}"
                    </p>
                  </div>
                )}
              </div>

               {/* Admin Notes */}
               {selectedItem.admin_notes && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <FaStickyNote className="text-amber-600" size={14} />
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Office Notes</span>
                  </div>
                  <p className="text-sm leading-relaxed text-amber-800 font-medium bg-white/50 p-3 rounded-lg">
                    {selectedItem.admin_notes}
                  </p>
                </div>
              )}

              {/* Media Section */}
              {selectedItem.media_files && selectedItem.media_files.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                     <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Uploads</p>
                     <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full text-gray-600 font-bold uppercase">{selectedItem.media_files.length} ITEMS</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedItem.media_files.map((media: any) => (
                      <div key={media.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                        {media.file_type === 'image' ? (
                          <img 
                            src={getFullUrl(media.file)} 
                            alt="" 
                            className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                            onClick={() => window.open(getFullUrl(media.file), '_blank')}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                            <FaHistory className="text-blue-400 mb-1" />
                            <a 
                              href={getFullUrl(media.file)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-blue-600 hover:underline"
                            >
                              Audio
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 pb-20 sm:pb-24 border-t border-gray-200 bg-white space-y-2.5 sm:space-y-3">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {selectedItem.status.toLowerCase() !== "cancelled" && (
                  <button
                    onClick={() => {
                      const lat = parseFloat(selectedItem.latitude);
                      const lng = parseFloat(selectedItem.longitude);
                      if (!isNaN(lat) && !isNaN(lng)) {
                        window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
                      }
                    }}
                    className="w-full py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-gray-200 transition-all border border-gray-200"
                  >
                    <FaMapMarkerAlt size={12} className="shrink-0" />
                    <span className="hidden sm:inline">Track on Map</span>
                    <span className="sm:hidden">Track</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className={`w-full py-2.5 sm:py-3 bg-gray-900 text-white rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all active:scale-95 text-center ${selectedItem.status.toLowerCase() === "cancelled" ? "col-span-2" : ""}`}
                >
                  Close
                </button>
              </div>

              {selectedItem.status.toLowerCase() === "pending" && (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      setEditingItem(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    <FaEdit size={12} className="shrink-0" />
                    <span className="hidden sm:inline">Edit Request</span>
                    <span className="sm:hidden">Edit</span>
                  </button>
                  <button
                    onClick={() => handleCancel(selectedItem.id)}
                    className="w-full py-2.5 sm:py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-rose-100 transition-all active:scale-95"
                  >
                    <FaTimesCircle size={12} className="shrink-0" />
                    <span className="hidden sm:inline">Cancel Request</span>
                    <span className="sm:hidden">Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit History Modal Overlay */}
      {editingItem && (
        <EditHistory
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onUpdate={handleUpdate}
          showToast={showToast}
        />
      )}

      {/* Cancel Confirmation Custom Modal */}
      {cancelConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 animate-fade-in" 
            onClick={() => setCancelConfirmId(null)} 
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-zoom-in border border-gray-100 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-4 border-4 border-white shadow-sm">
              <FaTimesCircle size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Service?</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Are you sure you want to cancel this service request? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelConfirmId(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-95"
              >
                No, Keep it
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-all shadow-md shadow-rose-200 active:scale-95"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standard Toast */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-slide-down px-6 w-full max-w-sm">
          <div className={`p-4 rounded-xl shadow-lg border-2 bg-white flex items-center gap-4 ${
            toast.type === "success" ? "border-emerald-100" : "border-rose-100"
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === "success" ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
            }`}>
              {toast.type === "success" ? <FaCheckCircle size={20} /> : <FaInfoCircle size={20} />}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-gray-900 truncate">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-all">
               <FaTimes size={14} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-down {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-zoom-in { animation: zoom-in 0.2s ease-out; }
        .animate-slide-down { animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}