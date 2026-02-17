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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  Bus,
  MapPin,
  Ticket,
  CurrencyDollar,
  TrendUp,
  Calendar,
  SignOut,
  ChartLine,
  Buildings,
  CaretRight,
  List,
  CreditCard,
  UserCircle,
  Star,
  ChatCircle,
  Money,
  MapTrifold,
  ClockCounterClockwise,
  ArrowUp,
  ArrowDown,
} from '@phosphor-icons/react';
import { authService } from '../../services/api';

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
    bus_usage: Array<{ bus_name: string; total_seats: number; bookings: number; usage_percentage: number }>;
  };
  recent_bookings: Array<any>;
}

const ProfessionalAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'analytics' | 'management'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast.success('Déconnexion réussie');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-dark text-lg font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  const user = authService.getUser();

  // Calcul des tendances
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Menu items
  const menuItems = [
    {
      section: 'Aperçu',
      items: [
        { icon: ChartLine, label: 'Tableau de bord', path: '/admin/dashboard', active: true },
      ]
    },
    {
      section: 'Gestion',
      items: [
        { icon: Buildings, label: 'Villes', path: '/admin/cities' },
        { icon: MapTrifold, label: 'Routes', path: '/admin/routes' },
        { icon: Bus, label: 'Flotte de bus', path: '/admin/buses' },
        { icon: Calendar, label: 'Voyages', path: '/admin/voyages' },
        { icon: Money, label: 'Tarifs', path: '/admin/tarifs' },
      ]
    },
    {
      section: 'Opérations',
      items: [
        { icon: Ticket, label: 'Réservations', path: '/admin/reservations' },
        { icon: CreditCard, label: 'Paiements', path: '/admin/payments' },
        { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-dark text-white transition-all duration-300 fixed h-screen overflow-y-auto z-50`}>
        {/* Header */}
        <div className="p-6 border-b border-dark-light">
          {sidebarOpen ? (
            <div>
              <h1 className="text-2xl font-bold text-primary">Jadoo Admin</h1>
              <p className="text-sm text-neutral-300 mt-1">Système de gestion</p>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">J</span>
            </div>
          )}
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-6 border-b border-dark-light bg-dark-light">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <UserCircle size={32} weight="fill" className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{user?.name || 'Administrateur'}</h3>
                <p className="text-xs text-neutral-300">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="p-4 space-y-6">
          {menuItems.map((section, idx) => (
            <div key={idx}>
              {sidebarOpen && (
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-3">
                  {section.section}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        item.active
                          ? 'bg-primary text-white shadow-lg'
                          : 'text-neutral-300 hover:bg-dark-light hover:text-white'
                      }`}
                    >
                      <item.icon size={22} weight={item.active ? 'fill' : 'regular'} />
                      {sidebarOpen && <span className="font-medium">{item.label}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-dark-light mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-300 hover:bg-danger hover:text-white transition-all duration-200"
          >
            <SignOut size={22} />
            {sidebarOpen && <span className="font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-72' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-dark">Tableau de bord</h2>
              <p className="text-sm text-neutral-500 mt-1">
                Bienvenue, gérez votre système de réservation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-neutral-500">Aujourd'hui</p>
                <p className="text-lg font-semibold text-dark">
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Réservations totales"
              value={stats?.overview.total_bookings || 0}
              subtitle={`${stats?.overview.confirmed_bookings || 0} confirmées`}
              icon={Ticket}
              color="primary"
              trend={12.5}
            />
            <StatCard
              title="Revenu total"
              value={`${(stats?.overview.total_revenue || 0).toLocaleString()} FCFA`}
              subtitle={`${(stats?.overview.monthly_revenue || 0).toLocaleString()} ce mois`}
              icon={CurrencyDollar}
              color="secondary"
              trend={8.3}
            />
            <StatCard
              title="Voyages actifs"
              value={stats?.overview.total_trips || 0}
              subtitle={`${stats?.overview.active_buses || 0} bus actifs`}
              icon={Bus}
              color="blue"
              trend={5.2}
            />
            <StatCard
              title="Voyageurs"
              value={stats?.overview.total_users || 0}
              subtitle={`Note: ${stats?.overview.average_rating || 0}/5 ⭐`}
              icon={Users}
              color="accent"
              trend={15.7}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-dark">Revenus mensuels</h3>
                  <p className="text-sm text-neutral-500">6 derniers mois</p>
                </div>
                <div className="p-3 bg-primary-50 rounded-xl">
                  <ChartLine size={24} className="text-primary" weight="duotone" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats?.charts.revenue_by_month || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FA9C0F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FA9C0F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#FA9C0F" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bookings Chart */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-dark">Réservations</h3>
                  <p className="text-sm text-neutral-500">6 derniers mois</p>
                </div>
                <div className="p-3 bg-secondary-50 rounded-xl">
                  <Ticket size={24} className="text-secondary" weight="duotone" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.charts.bookings_by_month || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#D7573B" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Destinations & Recent Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Destinations */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-dark">Destinations populaires</h3>
                  <p className="text-sm text-neutral-500">Top 5 destinations</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <MapPin size={24} className="text-blue" weight="duotone" />
                </div>
              </div>
              <div className="space-y-4">
                {stats?.charts.popular_destinations.slice(0, 5).map((dest, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark">{dest.city_name}</h4>
                        <p className="text-sm text-neutral-500">{dest.booking_count} réservations</p>
                      </div>
                    </div>
                    <CaretRight size={20} className="text-neutral-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-dark">Réservations récentes</h3>
                  <p className="text-sm text-neutral-500">Dernières activités</p>
                </div>
                <div className="p-3 bg-accent-50 rounded-xl">
                  <ClockCounterClockwise size={24} className="text-accent" weight="duotone" />
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stats?.recent_bookings.slice(0, 5).map((booking, idx) => (
                  <div key={idx} className="p-4 border border-neutral-200 rounded-xl hover:border-primary hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-dark">
                        {booking.passenger_name || booking.user?.name || 'Invité'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-success-100 text-success-700'
                          : booking.status === 'pending'
                          ? 'bg-warning-100 text-warning-700'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600">
                      {booking.trip?.departure?.city_name} → {booking.trip?.destination?.city_name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(booking.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-strong p-8 text-white">
            <h3 className="text-2xl font-bold mb-2">Actions rapides</h3>
            <p className="text-white/80 mb-6">Accédez rapidement aux fonctionnalités principales</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickActionButton
                icon={Calendar}
                label="Créer un voyage"
                onClick={() => navigate('/admin/voyages')}
              />
              <QuickActionButton
                icon={Bus}
                label="Gérer les bus"
                onClick={() => navigate('/admin/buses')}
              />
              <QuickActionButton
                icon={Ticket}
                label="Voir réservations"
                onClick={() => navigate('/admin/reservations')}
              />
              <QuickActionButton
                icon={CreditCard}
                label="Paiements"
                onClick={() => navigate('/admin/payments')}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: 'primary' | 'secondary' | 'blue' | 'accent';
  trend?: number;
}

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary',
    secondary: 'bg-secondary-50 text-secondary',
    blue: 'bg-blue-50 text-blue',
    accent: 'bg-accent-50 text-accent',
  };

  const borderClasses = {
    primary: 'border-primary/20',
    secondary: 'border-secondary/20',
    blue: 'border-blue/20',
    accent: 'border-accent/20',
  };

  return (
    <div className={`bg-white rounded-2xl shadow-soft p-6 border-l-4 ${borderClasses[color]} hover:shadow-medium transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={28} weight="duotone" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend >= 0 ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
          }`}>
            {trend >= 0 ? <ArrowUp size={14} weight="bold" /> : <ArrowDown size={14} weight="bold" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-neutral-600 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-dark mb-1">{value}</p>
      <p className="text-xs text-neutral-500">{subtitle}</p>
    </div>
  );
};

// Quick Action Button Component
interface QuickActionButtonProps {
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
}

const QuickActionButton = ({ icon: Icon, label, onClick }: QuickActionButtonProps) => (
  <button
    onClick={onClick}
    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl p-4 transition-all duration-200 flex flex-col items-center space-y-2 border border-white/20"
  >
    <Icon size={32} weight="duotone" />
    <span className="text-sm font-medium text-center">{label}</span>
  </button>
);

export default ProfessionalAdminDashboard;
