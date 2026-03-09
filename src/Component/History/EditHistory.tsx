import { useState } from "react";
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaUser, 
  FaTimes, 
  FaCamera, 
  FaSpinner, 
  FaTrash, 
  FaSave,
  FaCloudUploadAlt, 
  FaMinusCircle,
} from "react-icons/fa";
import { updateServiceRequest, deleteServiceMedia } from "../../Api/Service";
import { baseURL } from "../../Static/Static";

interface MediaItem {
  id: number;
  file: string;
  file_type: "image" | "audio";
}

interface EditHistoryProps {
  item: any;
  onClose: () => void;
  onUpdate: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
}

const getFullUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const base = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
};

export default function EditHistory({ item, onClose, onUpdate, showToast }: EditHistoryProps) {
  const [formData, setFormData] = useState({
    customer_name: item.customer_name || "",
    mobile_number: item.mobile_number || "",
    address: item.address || "",
    description: item.description || "",
    latitude: item.latitude || "",
    longitude: item.longitude || "",
  });

  const [existingMedia, setExistingMedia] = useState<MediaItem[]>(item.media_files || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`${file.name} exceeds 5MB limit`, "error");
        return;
      }
      setNewImages(prev => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingMedia = async (mediaId: number) => {
    setDeletingMediaId(mediaId);
    try {
      await deleteServiceMedia(mediaId);
      setExistingMedia(prev => prev.filter(m => m.id !== mediaId));
      showToast("Attachment removed successfully", "success");
    } catch (err) {
      showToast("Failed to remove attachment", "error");
    } finally {
      setDeletingMediaId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("customer_name", formData.customer_name);
      data.append("mobile_number", formData.mobile_number);
      data.append("address", formData.address);
      data.append("service_details", JSON.stringify({ description: formData.description }));
      data.append("latitude", formData.latitude);
      data.append("longitude", formData.longitude);

      newImages.forEach(img => {
        data.append("images", img);
      });

      await updateServiceRequest(item.id, data);
      showToast("Changes saved successfully", "success");
      onUpdate();
      onClose();
    } catch (err) {
      showToast("Failed to save changes", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-zoom-in max-h-[90vh] flex flex-col border border-gray-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Request</h2>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-0.5">ORDER #{item.request_id}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-all"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 pb-12 custom-scrollbar flex-1">
          <form id="edit-request-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Name */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Customer Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaUser size={14} />
                  </div>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-gray-900 transition-all"
                    placeholder="Enter customer name"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Mobile Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaPhone size={14} />
                  </div>
                  <input
                    type="tel"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-gray-900 transition-all"
                    placeholder="Mobile Number"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">Requirement Details</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-gray-900 transition-all resize-none"
                placeholder="Describe your service requirements..."
              />
            </div>

            {/* Address */}
            <div className="space-y-1">
               <label className="block text-sm font-medium text-gray-600">Deployment Address</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FaMapMarkerAlt size={14} />
                </div>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-gray-900 transition-all resize-none"
                  placeholder="Service address details"
                />
              </div>
            </div>

            {/* Current Attachments */}
            {existingMedia.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                   <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Active Assets</p>
                   <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-bold uppercase">{existingMedia.length} SAVED</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {existingMedia.map((media) => (
                    <div key={media.id} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50 group">
                      {media.file_type === "image" ? (
                        <img src={getFullUrl(media.file)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-blue-500 bg-blue-50/30">
                          <FaCloudUploadAlt size={20} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingMedia(media.id)}
                          disabled={deletingMediaId === media.id}
                          className="w-8 h-8 bg-white text-rose-600 rounded-lg shadow-lg flex items-center justify-center hover:bg-rose-50 transition-colors"
                        >
                          {deletingMediaId === media.id ? <FaSpinner className="animate-spin" /> : <FaTrash size={12} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Asset Addition */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                 <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Add Evidence</p>
                 <span className="text-[9px] text-gray-500 italic">Max 5MB per file</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {imagePreviews.map((url, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-emerald-200 shadow-sm group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-white text-rose-500 rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <FaMinusCircle size={12} />
                    </button>
                  </div>
                ))}
                
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer bg-gray-50/50">
                  <FaCamera size={20} className="mb-1" />
                  <span className="text-[10px] font-bold">Upload</span>
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-lg font-bold text-sm hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            form="edit-request-form"
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <FaSave />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
