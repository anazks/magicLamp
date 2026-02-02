import { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaSpinner, FaChartBar, FaUsers, FaUserCog } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
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
    summary: Array<{
      category: string;
      count: number
    }>;
    trend: Array<{
      date: string;
      category: string;
      count: number
    }>;
  };
  subcategory_analytics: {
    summary: Array<{
      subcategory: string;
      count: number
    }>;
    trend: Array<{
      date: string;
      subcategory: string;
      count: number
    }>;
  };
  user_growth: Array<{
    date: string;
    count: number
  }>;
  user_roles_distribution: Array<{
    role: string;
    count: number
  }>;
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          {error || "No data available"}
        </div>
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">
          {stats.date_range.start} → {stats.date_range.end}
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard
          icon={<FaChartBar />}
          title="Total Requests"
          value={summary.total}
          color="#6366f1"
        />
        <StatCard
          icon={<FaClock />}
          title="Pending"
          value={summary.pending}
          color="#f59e0b"
        />
        <StatCard
          icon={<FaSpinner />}
          title="In Progress"
          value={summary.in_progress}
          color="#3b82f6"
        />
        <StatCard
          icon={<FaCheckCircle />}
          title="Completed"
          value={summary.completed}
          color="#10b981"
        />
        <StatCard
          icon={<FaTimesCircle />}
          title="Cancelled"
          value={summary.cancelled}
          color="#ef4444"
        />
        <StatCard
          icon={<FaUsers />}
          title="New Users"
          value={user_growth.reduce((s, i) => s + i.count, 0)}
          color="#8b5cf6"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Service Requests Status - Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Service Requests by Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Categories - Horizontal Bar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Top Service Categories
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCategories} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row - User Roles & Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roles - Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <FaUserCog /> User Roles Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={user_roles_distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ role, percent }) => `${role} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {user_roles_distribution.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* New Users Growth */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <FaUsers /> New Users (Period)
          </h2>
          <div className="text-center">
            <div className="text-5xl font-bold text-indigo-600 mb-2">
              {user_growth.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <p className="text-gray-500 mb-4">
              New registrations from {stats.date_range.start} to {stats.date_range.end}
            </p>
            {user_growth.length > 1 && (
              <div className="mt-6 text-left">
                <h3 className="font-semibold text-gray-700 mb-2">Daily breakdown:</h3>
                <ul className="space-y-1 text-sm text-gray-600 max-h-40 overflow-y-auto">
                  {user_growth.map((day) => (
                    <li key={day.date} className="flex justify-between">
                      <span>{day.date}:</span>
                      <span className="font-medium">{day.count} new user{day.count !== 1 ? 's' : ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
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
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
      <div className="text-sm text-gray-500 mb-2">{title}</div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value.toLocaleString()}
      </div>
      <div className="mt-2 text-right" style={{ color }}>
        {icon}
      </div>
    </div>
  );
}