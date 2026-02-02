import { useState, useEffect } from 'react';
import { 
  FaClock, FaCheckCircle, FaTimesCircle, FaSpinner, 
  FaChartBar, FaUsers, FaUserCog 
} from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { DashboardStats } from '../../Api/Service';
import Loader from '../../Component/Loader/Loader';

interface StatsResponse {
  date_range: {
    start: string;
    end: string;
  };
  service_requests_summary: {
    total: number;
    pending: number;
    assigned: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  service_requests_trend: Array<{
    date: string;
    status: string;
    count: number;
  }>;
  category_analytics: {
    summary: Array<{ category: string; count: number }>;
    trend: Array<{ date: string; category: string; count: number }>;
  };
  subcategory_analytics: {
    summary: Array<{ subcategory: string; count: number }>;
    trend: Array<{ date: string; subcategory: string; count: number }>;
  };
  user_growth: Array<{ date: string; count: number }>;
  user_roles_distribution: Array<{ role: string; count: number }>;
}

const COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

export default function Stats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await DashboardStats();  
        setStats(response.data || response);
      } catch (err: any) {
        console.error("Failed to load dashboard stats:", err);
        setError("Failed to load statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">{error || "No data available"}</p>
      </div>
    );
  }

  const { 
    service_requests_summary: summary,
    category_analytics,
    user_growth,
    user_roles_distribution 
  } = stats;

  // Prepare data for Service Requests Status Bar Chart
  const statusData = [
    { name: 'Total', value: summary.total, fill: '#6366f1' },
    { name: 'Pending', value: summary.pending, fill: '#f59e0b' },
    { name: 'In Progress', value: summary.in_progress, fill: '#3b82f6' },
    { name: 'Completed', value: summary.completed, fill: '#10b981' },
    { name: 'Cancelled', value: summary.cancelled, fill: '#ef4444' },
  ].filter(item => item.value > 0);

  // Top Categories for Horizontal Bar
  const topCategories = [...category_analytics.summary]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">
          {stats.date_range.start} → {stats.date_range.end}
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <StatCard icon={<FaChartBar />} title="Total Requests" value={summary.total} color="#6366f1" />
        <StatCard icon={<FaClock />} title="Pending" value={summary.pending} color="#f59e0b" />
        <StatCard icon={<FaSpinner />} title="In Progress" value={summary.in_progress} color="#3b82f6" />
        <StatCard icon={<FaCheckCircle />} title="Completed" value={summary.completed} color="#10b981" />
        <StatCard icon={<FaTimesCircle />} title="Cancelled" value={summary.cancelled} color="#ef4444" />
        <StatCard icon={<FaUsers />} title="New Users" value={user_growth.reduce((s, i) => s + i.count, 0)} color="#8b5cf6" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Requests Status - Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Service Requests by Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories - Horizontal Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Top Service Categories</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topCategories}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="category" width={180} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row - User Roles & Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Roles - Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <FaUserCog className="text-purple-600" /> User Roles Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={user_roles_distribution}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {user_roles_distribution.map((entry, index) => (   // ← fixed: added entry, index
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* New Users Growth */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <FaUsers className="text-green-600" /> New Users (Period)
          </h3>
          <div className="text-4xl font-bold text-green-700 mb-2">
            {user_growth.reduce((sum, item) => sum + item.count, 0)}
          </div>
          <p className="text-sm text-gray-500 mb-4">
            New registrations from {stats.date_range.start} to {stats.date_range.end}
          </p>

          {user_growth.length > 1 && (
            <div className="text-sm text-gray-600">
              Daily breakdown:
              <ul className="mt-2 space-y-1 list-disc pl-5">
                {user_growth.map((day) => (
                  <li key={day.date}>
                    {day.date}: <strong>{day.count}</strong> new user{day.count !== 1 ? 's' : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1" style={{ color }}>
            {value.toLocaleString()}
          </p>
        </div>
        <div className="text-3xl opacity-80" style={{ color }}>
          {icon}
        </div>
      </div>
    </div>
  );
}