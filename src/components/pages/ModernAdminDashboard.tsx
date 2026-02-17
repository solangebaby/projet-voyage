import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
  Money,
  TrendUp,
  Calendar,
  SignOut,
  ChartLine,
  Buildings,
  CaretRight,
  List,
  CirclesThree,
  GearSix,
  CreditCard,
  UserCircle,
} from '@phosphor-icons/react';
import { authService } from '../../services/api';

interface DashboardStats {
  totalReservations: number;
  totalRevenue: number;
  totalTrips: number;
  totalBuses: number;
  recentBookings: any[];
  monthlyRevenue: any[];
  popularRoutes: any[];
}

const ModernAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'analytics'>('overview');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get('http://localhost:8000/api/statistics/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bus size={24} weight="fill" className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">KCTrip</h1>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <UserCircle size={20} className="text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">
                  {authService.getUser()?.name || 'Admin'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
              >
                <SignOut size={20} weight="bold" />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`${(stats?.totalRevenue || 0).toLocaleString()} FCFA`}
            icon={Money}
            gradient="from-green-500 to-emerald-600"
            trend="+12.5%"
          />
          <StatCard
            title="Total Bookings"
            value={stats?.totalReservations || 0}
            icon={Ticket}
            gradient="from-blue-500 to-indigo-600"
            trend="+8.2%"
          />
          <StatCard
            title="Active Trips"
            value={stats?.totalTrips || 0}
            icon={MapPin}
            gradient="from-purple-500 to-pink-600"
            trend="+5.7%"
          />
          <StatCard
            title="Fleet Size"
            value={stats?.totalBuses || 0}
            icon={Bus}
            gradient="from-orange-500 to-red-600"
            trend="+2.1%"
          />
        </div>

        {/* Section Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveSection('overview')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
              activeSection === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <CirclesThree size={20} weight="fill" />
              Overview
            </span>
          </button>
          <button
            onClick={() => setActiveSection('analytics')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
              activeSection === 'analytics'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <ChartLine size={20} weight="fill" />
              Analytics
            </span>
          </button>
        </div>

        {activeSection === 'overview' && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <QuickActionCard
                title="Manage Cities"
                icon={Buildings}
                onClick={() => navigate('/admin/cities')}
                color="blue"
              />
              <QuickActionCard
                title="Manage Routes"
                icon={MapPin}
                onClick={() => navigate('/admin/routes')}
                color="purple"
              />
              <QuickActionCard
                title="Manage Fleet"
                icon={Bus}
                onClick={() => navigate('/admin/buses')}
                color="orange"
              />
              <QuickActionCard
                title="Manage Voyages"
                icon={Calendar}
                onClick={() => navigate('/admin/voyages')}
                color="green"
              />
              <QuickActionCard
                title="Manage Tarifs"
                icon={Money}
                onClick={() => navigate('/admin/tarifs')}
                color="pink"
              />
              <QuickActionCard
                title="Reservations"
                icon={Ticket}
                onClick={() => navigate('/admin/reservations')}
                color="indigo"
              />
              <QuickActionCard
                title="Payments"
                icon={CreditCard}
                onClick={() => navigate('/admin/payments')}
                color="teal"
              />
              <QuickActionCard
                title="Settings"
                icon={GearSix}
                onClick={() => toast('Settings coming soon')}
                color="gray"
              />
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <Ticket size={28} weight="fill" className="text-blue-600" />
                  Recent Bookings
                </h2>
                <button
                  onClick={() => navigate('/admin/reservations')}
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  View All <CaretRight size={16} weight="bold" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Passenger
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Seat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats?.recentBookings?.slice(0, 5).map((booking: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{booking.passenger_name}</div>
                          <div className="text-sm text-gray-500">{booking.passenger_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.departure} → {booking.destination}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(booking.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {booking.selected_seat}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                          {booking.amount?.toLocaleString()} FCFA
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeSection === 'analytics' && (
          <>
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Revenue Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendUp size={24} weight="fill" className="text-green-600" />
                  Monthly Revenue
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats?.monthlyRevenue || []}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Popular Routes Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ChartLine size={24} weight="fill" className="text-blue-600" />
                  Popular Routes
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.popularRoutes || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="route" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart - Booking Status Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Confirmed', value: 65 },
                      { name: 'Pending', value: 25 },
                      { name: 'Cancelled', value: 10 },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[0, 1, 2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  gradient: string;
  trend?: string;
}

const StatCard = ({ title, value, icon: Icon, gradient, trend }: StatCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">{title}</p>
          <p className="text-3xl font-black text-gray-900 mb-2">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-green-600">
              <TrendUp size={16} weight="bold" />
              <span className="text-sm font-bold">{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon size={28} weight="fill" className="text-white" />
        </div>
      </div>
    </div>
  );
};

interface QuickActionCardProps {
  title: string;
  icon: any;
  onClick: () => void;
  color: string;
}

const QuickActionCard = ({ title, icon: Icon, onClick, color }: QuickActionCardProps) => {
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
    purple: 'from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700',
    orange: 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
    green: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    pink: 'from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700',
    indigo: 'from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700',
    teal: 'from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700',
    gray: 'from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700',
  };

  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-white rounded-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 group`}
    >
      <Icon size={32} weight="fill" className="mb-3 group-hover:scale-110 transition-transform" />
      <p className="font-bold text-lg">{title}</p>
    </button>
  );
};

export default ModernAdminDashboard;
