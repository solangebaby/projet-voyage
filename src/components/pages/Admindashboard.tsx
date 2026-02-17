import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Bus,
  MapPin,
  Ticket,
  ChartLine,
  ChatCircleDots,
  Calendar,
  SignOut,
  ShieldCheck,
  Money,
  Coins,
  CurrencyDollar,
} from '@phosphor-icons/react';
import AdminCommentModeration from '../AdminCommentModeration';

interface DashboardStats {
  overview: {
    total_trips: number;
    active_buses: number;
    total_destinations: number;
    total_bookings: number;
    confirmed_bookings: number;
    total_users: number;
    total_revenue: number;
    monthly_revenue: number;
    average_rating: number;
    total_comments: number;
    pending_comments: number;
  };
  charts: {
    bookings_by_month: Array<{ month: string; count: number }>;
    revenue_by_month: Array<{ month: string; total: number }>;
    popular_destinations: Array<{ city_name: string; booking_count: number }>;
    bus_usage: Array<{ bus_name: string; bookings: number; total_seats: number; usage_percentage: number }>;
  };
  recent_bookings: Array<any>;
}

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'buses' | 'destinations' | 'comments'>('overview');

  useEffect(() => {
    if (!token || user.role !== 'admin') {
      toast.error('Unauthorized. Admin access required.');
      navigate('/login');
      return;
    }
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/statistics/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const COLORS = ['#DF6951', '#F1A501', '#181E4B', '#5E6282', '#79B8F3'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-color2 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-primary flex items-center justify-center">
                <ShieldCheck size={28} weight="duotone" className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t('dashboard.admin.title')}
                </h1>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-success rounded-full animate-pulse"></span>
                  {t('common.welcome')}, <span className="font-semibold text-dark">{user.first_name || user.name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary-50 rounded-lg transition-all duration-300"
              >
                {t('nav.home')}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-danger to-danger-dark text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <SignOut size={20} weight="bold" />
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-soft border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: 'overview', label: t('dashboard.admin.overview'), icon: ChartLine, color: 'primary' },
              { key: 'trips', label: t('dashboard.admin.manageTrips'), icon: Calendar, color: 'secondary' },
              { key: 'buses', label: t('dashboard.admin.manageBuses'), icon: Bus, color: 'success' },
              { key: 'destinations', label: t('dashboard.admin.manageDestinations'), icon: MapPin, color: 'info' },
              { key: 'comments', label: t('dashboard.admin.manageComments'), icon: ChatCircleDots, color: 'warning' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-3 transition-all duration-300 whitespace-nowrap group ${
                  activeTab === tab.key
                    ? `border-${tab.color} text-${tab.color} bg-${tab.color}-50`
                    : 'border-transparent text-gray-600 hover:text-dark hover:bg-neutral-50'
                }`}
              >
                <tab.icon 
                  size={22} 
                  weight={activeTab === tab.key ? 'duotone' : 'regular'} 
                  className="group-hover:scale-110 transition-transform"
                />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title={t('dashboard.admin.totalTrips')}
                value={stats.overview.total_trips}
                icon={Calendar}
                color="bg-blue-500"
              />
              <StatCard
                title={t('dashboard.admin.totalBuses')}
                value={stats.overview.active_buses}
                icon={Bus}
                color="bg-green-500"
              />
              <StatCard
                title={t('dashboard.admin.totalBookings')}
                value={stats.overview.total_bookings}
                icon={Ticket}
                color="bg-purple-500"
              />
              <StatCard
                title="Total Users"
                value={stats.overview.total_users}
                icon={Users}
                color="bg-orange-500"
              />
            </div>

            {/* Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-2xl shadow-soft p-6 border-l-4 border-success hover:shadow-medium transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-success-700 font-semibold mb-2">{t('dashboard.admin.totalRevenue')}</p>
                    <p className="text-4xl font-bold text-success-900 group-hover:scale-105 transition-transform">
                      {stats.overview.total_revenue.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-success to-success-dark rounded-2xl shadow-success group-hover:rotate-12 transition-transform">
                    <Money size={36} className="text-white" weight="duotone" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-info-50 to-info-100 rounded-2xl shadow-soft p-6 border-l-4 border-info hover:shadow-medium transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-info-700 font-semibold mb-2">{t('dashboard.admin.monthlyRevenue')}</p>
                    <p className="text-4xl font-bold text-info-900 group-hover:scale-105 transition-transform">
                      {stats.overview.monthly_revenue.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-info to-info-dark rounded-2xl shadow-info group-hover:rotate-12 transition-transform">
                    <Coins size={36} className="text-white" weight="duotone" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Bookings Chart */}
              <div className="bg-white rounded-2xl shadow-soft p-6 border border-neutral-100 hover:shadow-medium transition-all">
                <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-secondary to-secondary-dark rounded-full"></div>
                  Bookings Trend (Last 6 Months)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.charts.bookings_by_month}>
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DF6951" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#DF6951" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#DF6951" fillOpacity={1} fill="url(#colorBookings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl shadow-soft p-6 border border-neutral-100 hover:shadow-medium transition-all">
                <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-primary to-primary-dark rounded-full"></div>
                  Revenue Trend (Last 6 Months)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.charts.revenue_by_month}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#181E4B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Popular Destinations & Bus Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Popular Destinations */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.admin.popularDestinations')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.charts.popular_destinations}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => `${props.city_name}: ${props.booking_count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="booking_count"
                    >
                      {stats.charts.popular_destinations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bus Usage */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.admin.busUsage')}</h3>
                <div className="space-y-4">
                  {stats.charts.bus_usage.map((bus, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{bus.bus_name}</span>
                        <span className="text-gray-500">{Math.round(bus.usage_percentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-color2 h-2.5 rounded-full transition-all"
                          style={{ width: `${Math.min(bus.usage_percentage, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{bus.bookings} bookings</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.admin.recentBookings')}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recent_bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.user?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.trip?.departure?.city_name} → {booking.trip?.destination?.city_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'trips' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-dark mb-6">Trip Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => window.location.href = '/admin/voyages'}
                className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 border-l-4 border-secondary text-left group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl shadow-secondary group-hover:rotate-12 transition-transform">
                    <Calendar size={32} className="text-white" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">Trip Planning</h3>
                    <p className="text-sm text-gray-500 mt-1">Créer et gérer les voyages</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/admin/tarifs'}
                className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 border-l-4 border-primary text-left group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-primary group-hover:rotate-12 transition-transform">
                    <CurrencyDollar size={32} className="text-white" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">Fare Management</h3>
                    <p className="text-sm text-gray-500 mt-1">Définir les prix</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/admin/reservations'}
                className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 border-l-4 border-success text-left group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-success to-success-dark rounded-xl shadow-success group-hover:rotate-12 transition-transform">
                    <Ticket size={32} className="text-white" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">Reservations</h3>
                    <p className="text-sm text-gray-500 mt-1">Gérer les réservations</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/admin/payments'}
                className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 border-l-4 border-info text-left group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-info to-info-dark rounded-xl shadow-info group-hover:rotate-12 transition-transform">
                    <CurrencyDollar size={32} className="text-white" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">{t('admin.payments.title')}</h3>
                    <p className="text-sm text-gray-500 mt-1">Gérer les paiements</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'buses' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-dark mb-6">Fleet Management</h2>
            
            <button
              onClick={() => window.location.href = '/admin/buses'}
              className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 border-l-4 border-success text-left group w-full"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-success to-success-dark rounded-xl shadow-success group-hover:rotate-12 transition-transform">
                  <Bus size={32} className="text-white" weight="duotone" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark">Bus Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Gérez vos bus et leur configuration</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {activeTab === 'destinations' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-dark mb-6">Cities & Routes Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => window.location.href = '/admin/cities'}
                className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 border-l-4 border-info text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-info to-info-dark rounded-xl shadow-info group-hover:rotate-12 transition-transform">
                    <MapPin size={32} className="text-white" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">City Management</h3>
                    <p className="text-sm text-gray-500 mt-1">Gérez les villes pour les trajets</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/admin/routes'}
                className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 border-l-4 border-success text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-success to-success-dark rounded-xl shadow-success group-hover:rotate-12 transition-transform">
                    <MapPin size={32} className="text-white" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">Route Management</h3>
                    <p className="text-sm text-gray-500 mt-1">Gérez les trajets entre villes</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <AdminCommentModeration />
        )}
      </div>
    </div>
  );
};

// Stats Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: any;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => {
  // Extract color name from class (e.g., 'bg-blue-500' -> 'blue')
  const colorName = color.includes('blue') ? 'blue' : 
                    color.includes('green') ? 'success' :
                    color.includes('purple') ? 'secondary' :
                    color.includes('orange') ? 'primary' : 'primary';
                    
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium hover:scale-105 transition-all duration-300 border border-neutral-100 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-2 font-medium">{title}</p>
          <p className="text-4xl font-bold text-dark group-hover:scale-110 transition-transform">{value}</p>
        </div>
        <div className={`p-4 bg-gradient-to-br ${color} to-${colorName}-600 rounded-2xl shadow-${colorName} group-hover:rotate-12 transition-transform duration-300`}>
          <Icon size={32} className="text-white" weight="duotone" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
