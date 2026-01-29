import React, { useState, useEffect } from 'react';
import { getAllRequestedServices, updateRequestStatus } from '../../Api/Service';

// ────────────────────────────────────────────────
// Interfaces
// ────────────────────────────────────────────────
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string | null;
  phone_number: string;
  profile_picture: string | null;
  profile_picture_url: string | null;
  date_of_birth: string;
  pin_code: number;
  age: number | null;
  district: string;
  state: string;
  address: string | null;
  role: string;
  is_active: boolean;
}

interface ServiceRequest {
  id: number;
  request_id: string;
  user: User;
  mobile_number: string;
  customer_name: string;
  category: number;
  category_name: string;
  category_icon: string | null;
  subcategory: number | null;
  subcategory_name: string | null;
  service_details: {
    description: string;
  };
  address: string;
  latitude: string;
  longitude: string;
  status: 'Pending' | 'Accepted' | 'Completed' | 'Cancelled' | 'Rejected';
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ServiceRequest[];
}

// Map Modal Component
function MapModal({ 
  latitude, 
  longitude, 
  address, 
  customerName,
  onClose 
}: { 
  latitude: string;
  longitude: string;
  address: string;
  customerName: string;
  onClose: () => void;
}) {
  const [mapUrl, setMapUrl] = useState<string>('');
  
  useEffect(() => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      setMapUrl('');
      return;
    }
    
    // Generate Google Maps embed URL
    const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    setMapUrl(embedUrl);
  }, [latitude, longitude]);

  const openInGoogleMaps = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
  };

  const openInAppleMaps = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      window.open(`https://maps.apple.com/?q=${lat},${lng}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Service Location</h2>
            <p className="text-sm text-gray-600 mt-1">{customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
            <p className="text-gray-900">{address}</p>
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>Coordinates: {latitude}, {longitude}</span>
            </div>
          </div>
          
          {mapUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-gray-300 h-96">
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Service Location Map"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={openInGoogleMaps}
                  className="bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Open in Google Maps
                </button>
                <button
                  onClick={openInAppleMaps}
                  className="bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Open in Maps
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg h-96 flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 font-medium">Invalid location coordinates</p>
              <p className="text-gray-500 text-sm mt-2">{latitude}, {longitude}</p>
            </div>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Map Button Component
function LocationButton({ latitude, longitude }: { latitude: string; longitude: string }) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  const hasValidLocation = !isNaN(lat) && !isNaN(lng);
  
  return (
    <button
      onClick={() => {
        if (hasValidLocation) {
          window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
        }
      }}
      disabled={!hasValidLocation}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        hasValidLocation
          ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
      title={hasValidLocation ? "Open in Google Maps" : "Invalid coordinates"}
    >
      <svg className={`w-4 h-4 ${hasValidLocation ? 'text-blue-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
      {hasValidLocation ? 'View Map' : 'No Map'}
    </button>
  );
}

export default function History() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: string;
    longitude: string;
    address: string;
    customerName: string;
  } | null>(null);

  useEffect(() => {
    fetchRequestedServices();
  }, []);

  const fetchRequestedServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllRequestedServices();
      console.log('Service history response:', response);

      const res: PaginatedResponse = response?.data || response;

      if (!res || typeof res !== 'object' || !('results' in res)) {
        throw new Error('Unexpected response format');
      }

      setRequests(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err: any) {
      console.error('Failed to fetch:', err);
      setError(err.message || 'Failed to load service requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: number, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to mark this request as "${newStatus}"?`)) {
      return;
    }

    try {
      setUpdatingId(requestId);
      await updateRequestStatus(requestId, newStatus);
      
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );

      alert(`Status updated to "${newStatus}" successfully!`);
    } catch (err: any) {
      console.error('Status update failed:', err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        `Failed to update status to "${newStatus}".`;
      alert(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewMap = (request: ServiceRequest) => {
    setSelectedLocation({
      latitude: request.latitude,
      longitude: request.longitude,
      address: request.address,
      customerName: request.customer_name
    });
    setShowMapModal(true);
  };

  const getAvailableActions = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return ['Accept', 'Reject', 'Cancel'];
      case 'accepted':
        return ['Complete', 'Cancel'];
      case 'completed':
      case 'cancelled':
      case 'rejected':
        return [];
      default:
        return ['Cancel'];
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') return 'bg-green-100 text-green-800 border border-green-200';
    if (s === 'accepted') return 'bg-blue-100 text-blue-800 border border-blue-200';
    if (s === 'pending') return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    if (s === 'cancelled' || s === 'rejected') return 'bg-red-100 text-red-800 border border-red-200';
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getActionButtonStyle = (action: string) => {
    if (action === 'Accept') return 'bg-green-600 hover:bg-green-700 text-white';
    if (action === 'Complete') return 'bg-blue-600 hover:bg-blue-700 text-white';
    if (action === 'Reject' || action === 'Cancel') return 'bg-red-600 hover:bg-red-700 text-white';
    return 'bg-gray-600 hover:bg-gray-700 text-white';
  };

  const formatCoordinates = (lat: string, lng: string) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      return 'Invalid coordinates';
    }
    
    const latDir = latNum >= 0 ? 'N' : 'S';
    const lngDir = lngNum >= 0 ? 'E' : 'W';
    
    return `${Math.abs(latNum).toFixed(6)}°${latDir}, ${Math.abs(lngNum).toFixed(6)}°${lngDir}`;
  };

  return (
    <>
      <div className="min-h-[70vh] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Service Request History</h1>
            <p className="mt-2 text-gray-600">
              View and manage all customer service booking requests
              {totalCount > 0 && <span className="ml-2 text-gray-500">({totalCount} total)</span>}
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading service requests...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && requests.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                There are no service requests at the moment. New requests will appear here once customers place them.
              </p>
            </div>
          )}

          {/* Data Table */}
          {!loading && !error && requests.length > 0 && (
            <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address & Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested On
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((req) => {
                      const isUpdating = updatingId === req.id;
                      const actions = getAvailableActions(req.status);
                      const hasValidLocation = !isNaN(parseFloat(req.latitude)) && !isNaN(parseFloat(req.longitude));

                      return (
                        <tr key={req.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono font-medium text-gray-900">
                              {req.request_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {req.customer_name || 'Anonymous'}
                            </div>
                            {req.user?.email && (
                              <div className="text-xs text-gray-500">{req.user.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <a 
                              href={`tel:${req.mobile_number}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {req.mobile_number}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {req.category_name || `Cat #${req.category}`}
                            </div>
                            <div className="text-sm text-gray-600">
                              {req.subcategory_name || `Sub #${req.subcategory || 'None'}`}
                            </div>
                            {req.service_details?.description && (
                              <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                {req.service_details.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 mb-2 max-w-xs">
                              {req.address}
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="text-xs text-gray-600">
                                {formatCoordinates(req.latitude, req.longitude)}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleViewMap(req)}
                                  disabled={!hasValidLocation}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    hasValidLocation
                                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                  </svg>
                                  {hasValidLocation ? 'View Full Map' : 'No Location'}
                                </button>
                                <LocationButton
                                  latitude={req.latitude}
                                  longitude={req.longitude}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(req.status)}`}
                            >
                              {req.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span>{new Date(req.created_at).toLocaleDateString('en-IN')}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(req.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-wrap gap-2">
                                {actions.map((action) => (
                                  <button
                                    key={action}
                                    onClick={() => handleUpdateStatus(req.id, action)}
                                    disabled={isUpdating}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${getActionButtonStyle(action)} disabled:opacity-50 disabled:cursor-not-allowed`}
                                  >
                                    {isUpdating ? 'Updating...' : action}
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={() => {
                                  // View details - you can expand this to show more info
                                  alert(`Service Details:\n\nCategory: ${req.category_name}\nSubcategory: ${req.subcategory_name || 'None'}\n\nDescription: ${req.service_details?.description || 'No description provided'}`);
                                }}
                                className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition"
                              >
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer info */}
              <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-600 flex justify-between items-center">
                <div>Showing {requests.length} of {totalCount} requests</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Locations are shown on interactive maps
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && selectedLocation && (
        <MapModal
          latitude={selectedLocation.latitude}
          longitude={selectedLocation.longitude}
          address={selectedLocation.address}
          customerName={selectedLocation.customerName}
          onClose={() => {
            setShowMapModal(false);
            setSelectedLocation(null);
          }}
        />
      )}
    </>
  );
}