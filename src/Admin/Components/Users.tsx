import { useState, useEffect } from "react";
import { getUsers, getUserDetails } from "../../Api/Auth";
import Loader from "../../Component/Loader/Loader";
import {
  FaSearch,
  FaEye,
  FaTimes,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaIdCard,
  FaMapPin,
  FaBirthdayCake,
  FaCalendarDay,
  FaCog,
  FaHistory,
} from "react-icons/fa";

// Basic user (from list endpoint)
interface User {
  id: number | string;
  first_name?: string;
  last_name?: string | null;
  email: string;
  phone_number?: string;
  role?: string;
  is_active?: boolean;
  date_joined?: string;
  profile_picture?: string | null;
  profile_picture_url?: string | null;
}

// Detailed user response structure
interface UserDetailResponse {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string | null;
    phone_number: string;
    profile_picture: string | null;
    profile_picture_url: string | null;
    date_of_birth: string | null;
    pin_code: number | null;
    age: number | null;
    district: string;
    state: string;
    address: string | null;
    role: string;
    is_active: boolean;
  };
  analytics: {
    total_requests: number;
    pending_requests: number;
    completed_requests: number;
  };
  service_requests: Array<{
    id: number;
    request_id: string;
    mobile_number: string;
    customer_name: string;
    category_name: string;
    subcategory_name: string | null;
    service_details: { description: string };
    address: string;
    latitude: string;
    longitude: string;
    status: string;
    created_at: string;
    updated_at: string;
  }>;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [selectedUserId, setSelectedUserId] = useState<number | string | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getUsers();
        console.log("Fetched users list:", response);

        const userList = response?.results || response?.data?.results || response?.data || response || [];

        setUsers(userList);
      } catch (err: any) {
        console.error("Failed to fetch users:", err);
        setError(err?.message || "Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setUserDetail(null);
      setDetailError(null);
      return;
    }

    const fetchDetail = async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);

        const response = await getUserDetails(selectedUserId);
        console.log("User detail full response:", response);

        setUserDetail(response);
      } catch (err: any) {
        console.error("Failed to fetch user details:", err);
        setDetailError(err?.message || "Failed to load detailed user information.");
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedUserId]);

  const filteredUsers = users.filter((user) =>
    `${user.first_name || ""} ${user.last_name || ""} ${user.email || ""} ${user.phone_number || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim())
  );

  const closeModal = () => {
    setSelectedUserId(null);
    setUserDetail(null);
    setDetailError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="text-red-600 text-6xl mb-4">!</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-1">
              Total users: <span className="font-semibold">{users.length}</span>
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Table */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? "No matching users found" : "No users found"}
            </h3>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role / Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.profile_picture_url ?? user.profile_picture ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.profile_picture_url ?? user.profile_picture ?? undefined}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                                {(user.first_name?.[0] || "") + (user.last_name?.[0] || "") || "?"}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.phone_number || "—"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                        {user.role && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.date_joined
                          ? new Date(user.date_joined).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedUserId(user.id)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 justify-end"
                          title="View full details"
                        >
                          <FaEye className="text-lg" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── User Details Modal ────────────────────────────────────── */}
        {selectedUserId && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <FaUser className="text-indigo-600 text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="p-6">
                {detailLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader />
                  </div>
                ) : detailError ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaTimes className="text-red-500 text-2xl" />
                    </div>
                    <p className="text-red-600 text-lg font-medium mb-4">{detailError}</p>
                    <button
                      onClick={closeModal}
                      className="px-6 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                      Close
                    </button>
                  </div>
                ) : userDetail ? (
                  <div className="space-y-8">
                    {/* Profile Header */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b">
                      <div className="flex-shrink-0">
                        {userDetail.user.profile_picture_url ?? userDetail.user.profile_picture ? (
                          <img
                            src={userDetail.user.profile_picture_url ?? userDetail.user.profile_picture ?? undefined}
                            alt="Profile"
                            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                        ) : (
                          <div className="w-28 h-28 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-5xl font-bold border-4 border-white shadow-lg">
                            {(userDetail.user.first_name?.[0] || "") + (userDetail.user.last_name?.[0] || "") || "?"}
                          </div>
                        )}
                      </div>

                      <div className="text-center sm:text-left">
                        <h3 className="text-3xl font-bold text-gray-900">
                          {userDetail.user.first_name || ""} {userDetail.user.last_name || ""}
                        </h3>
                        <p className="text-lg text-gray-600 mt-2 flex items-center gap-2 justify-center sm:justify-start">
                          <FaEnvelope className="text-gray-400" /> {userDetail.user.email}
                        </p>

                        {userDetail.user.phone_number && (
                          <p className="text-lg text-gray-600 mt-2 flex items-center gap-2 justify-center sm:justify-start">
                            <FaPhoneAlt className="text-gray-400" /> {userDetail.user.phone_number}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
                          <span
                            className={`px-4 py-1.5 text-sm font-semibold rounded-full flex items-center gap-2 ${
                              userDetail.user.is_active
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200"
                                : "bg-gray-50 text-gray-700 border border-gray-200"
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${userDetail.user.is_active ? "bg-green-500" : "bg-gray-500"}`}></div>
                            {userDetail.user.is_active ? "Active" : "Inactive"}
                          </span>

                          <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200 flex items-center gap-2">
                            <FaCog className="text-sm" />
                            {userDetail.user.role || "User"}
                          </span>

                          <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 flex items-center gap-2">
                            <FaIdCard className="text-sm" />
                            ID: {userDetail.user.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Analytics Summary */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100">
                      <h4 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                        <FaCalendarAlt /> Activity Summary
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <p className="text-3xl font-bold text-gray-900">{userDetail.analytics.total_requests}</p>
                          <p className="text-sm text-gray-600">Total Requests</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <p className="text-3xl font-bold text-amber-600">{userDetail.analytics.pending_requests}</p>
                          <p className="text-sm text-gray-600">Pending</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <p className="text-3xl font-bold text-emerald-600">{userDetail.analytics.completed_requests}</p>
                          <p className="text-sm text-gray-600">Completed</p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FaMapMarkerAlt className="text-blue-500" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</h4>
                            <p className="text-gray-900 mt-1">{userDetail.user.address || "No address provided"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <FaMapPin className="text-green-500" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Location</h4>
                            <p className="text-gray-900 mt-1">
                              {userDetail.user.district ? `${userDetail.user.district}, ` : ""}
                              {userDetail.user.state || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <FaIdCard className="text-purple-500" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">PIN Code</h4>
                            <p className="text-gray-900 mt-1">{userDetail.user.pin_code || "—"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-pink-50 rounded-lg">
                            <FaBirthdayCake className="text-pink-500" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date of Birth</h4>
                            <p className="text-gray-900 mt-1">
                              {userDetail.user.date_of_birth
                                ? new Date(userDetail.user.date_of_birth).toLocaleDateString("en-IN")
                                : "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-amber-50 rounded-lg">
                            <FaCalendarDay className="text-amber-500" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Age</h4>
                            <p className="text-gray-900 mt-1">{userDetail.user.age || "—"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-indigo-50 rounded-lg">
                            <FaCalendarAlt className="text-indigo-500" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Joined On</h4>
                            <p className="text-gray-900 mt-1">
                              {new Date().toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Service Requests */}
                    {userDetail.service_requests?.length > 0 && (
                      <div className="pt-6 border-t">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <FaHistory className="text-gray-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">Recent Service Requests</h4>
                        </div>
                        <div className="space-y-4">
                          {userDetail.service_requests.map((req) => (
                            <div
                              key={req.id}
                              className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {req.request_id} • {req.category_name}
                                    {req.subcategory_name && ` → ${req.subcategory_name}`}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {new Date(req.created_at).toLocaleString("en-IN")}
                                  </p>
                                </div>
                                <span
                                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    req.status === "Completed"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : req.status === "Pending"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : req.status === "Cancelled"
                                      ? "bg-red-50 text-red-700 border border-red-200"
                                      : "bg-gray-50 text-gray-700 border border-gray-200"
                                  }`}
                                >
                                  {req.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                                {req.service_details?.description || "No description"}
                              </p>
                              <p className="text-sm text-gray-600 mt-2 flex items-start gap-1">
                                <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                                {req.address}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUser className="text-gray-400 text-2xl" />
                    </div>
                    <p className="text-gray-600 text-lg">No detailed information available for this user.</p>
                  </div>
                )}

                <div className="mt-10 flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-medium rounded-lg hover:from-gray-800 hover:to-gray-900 transition focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}