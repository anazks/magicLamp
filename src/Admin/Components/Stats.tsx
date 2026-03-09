import { useState, useEffect, useMemo } from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaSpinner, FaChartBar, FaUsers, FaUserCog, FaCalendarAlt, FaHistory } from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
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

  // Date filters
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await DashboardStats(startDate, endDate);
      setStats(response.data || response);
    } catch (err: any) {
      console.error("Failed to load dashboard stats:", err);
      setError("Failed to load statistics. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const totalNewUsers = useMemo(() => {
    if (!stats?.user_growth) return 0;
    return stats.user_growth.reduce((sum, item) => sum + item.count, 0);
  }, [stats]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500 text-center bg-red-50 p-6 rounded-lg shadow-sm">
          <FaTimesCircle className="mx-auto text-4xl mb-2" />
          <p className="font-semibold">{error || "No data available"}</p>
          <button 
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Try Again
          </button>
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
    { name: 'Pending', value: summary.pending, fill: '#f59e0b' },
    { name: 'Assigned', value: summary.assigned, fill: '#8b5cf6' },
    { name: 'In Progress', value: summary.in_progress, fill: '#3b82f6' },
    { name: 'Completed', value: summary.completed, fill: '#10b981' },
    { name: 'Cancelled', value: summary.cancelled, fill: '#ef4444' },
  ].filter(item => item.value > 0);

  // Top Categories for Horizontal Bar
  const topCategories = [...category_analytics.summary]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Date Picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
            <FaCalendarAlt className="text-indigo-500" />
            Active range: {stats.date_range.start} to {stats.date_range.end}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <span className="text-xs font-semibold text-gray-500 uppercase">From</span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <span className="text-xs font-semibold text-gray-500 uppercase">To</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={<FaChartBar />}
          title="Total Requests"
          value={summary.total}
          gradient="from-indigo-500 to-indigo-600"
          percentage={100}
        />
        <StatCard
          icon={<FaClock />}
          title="Pending"
          value={summary.pending}
          gradient="from-amber-400 to-amber-500"
          percentage={summary.total > 0 ? (summary.pending / summary.total) * 100 : 0}
        />
        <StatCard
          icon={<FaSpinner />}
          title="In Progress"
          value={summary.in_progress}
          gradient="from-blue-500 to-blue-600"
          percentage={summary.total > 0 ? (summary.in_progress / summary.total) * 100 : 0}
        />
        <StatCard
          icon={<FaCheckCircle />}
          title="Completed"
          value={summary.completed}
          gradient="from-emerald-500 to-emerald-600"
          percentage={summary.total > 0 ? (summary.completed / summary.total) * 100 : 0}
        />
        <StatCard
          icon={<FaTimesCircle />}
          title="Cancelled"
          value={summary.cancelled}
          gradient="from-rose-500 to-rose-600"
          percentage={summary.total > 0 ? (summary.cancelled / summary.total) * 100 : 0}
        />
        <StatCard
          icon={<FaUsers />}
          title="New Users"
          value={totalNewUsers}
          gradient="from-violet-500 to-violet-600"
          percentage={100}
        />
      </div>

      {/* Secondary Charts Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaUsers className="text-indigo-500" /> User Registration Trends
            </h2>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
              {totalNewUsers} New Registrations
            </span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={user_growth}>
              <defs>
                <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#94a3b8'}}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#94a3b8'}}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                name="New Users"
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorUser)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service Requests Status Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaHistory className="text-indigo-500" /> Request Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{fill: '#f8fafc'}}
              />
              <Bar dataKey="value" name="Requests" radius={[6, 6, 0, 0]} barSize={40}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Insights Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Service Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Popular Categories</h2>
          <div className="space-y-4">
            {topCategories.map((cat, idx) => (
              <div key={cat.category} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                  <span className="text-sm font-bold text-indigo-600">{cat.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000 group-hover:bg-indigo-600"
                    style={{ width: `${(cat.count / topCategories[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {topCategories.length === 0 && (
              <p className="text-center text-gray-500 py-10">No category data available for this range</p>
            )}
          </div>
        </div>

        {/* Role Distribution Pie */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">User Base Breakdown</h2>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={user_roles_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {user_roles_distribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="block text-2xl font-bold text-gray-900 border-b border-gray-100 pb-0.5">
                {user_roles_distribution.reduce((acc, curr) => acc + curr.count, 0)}
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mt-1">
                Total Users
              </span>
            </div>
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
  gradient,
  percentage
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  gradient: string;
  percentage: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-[0.03] -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-110`} />
      
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 shadow-sm`}>
        {icon}
      </div>
      
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
        {title}
      </div>
      
      <div className="text-2xl font-black text-gray-900 mb-3">
        {value.toLocaleString()}
      </div>
      
      <div className="mt-auto">
        <div className="w-full bg-gray-50 rounded-full h-1">
          <div 
            className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
}