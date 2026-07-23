import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

import {
  Users, Bus, Ticket, CurrencyDollar,
  Buildings, CaretRight,
  CreditCard, MapTrifold,
  ArrowUp, ArrowDown, CheckCircle,
  WarningCircle, Storefront, Clock,
  XCircle, House, Bell
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
    revenue_by_month:  Array<{ month: string; total: number }>;
    popular_destinations: Array<{ city_name: string; booking_count: number }>;
    bus_usage: Array<{ bus_name: string; total_seats: number; bookings: number; usage_percentage: number }>;
  };
  recent_bookings: Array<any>;
  pending_trips_count?: number;
  total_agencies?: number;
  total_disputes?: number;
}

const ProfessionalAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    fetchDashboardStats(); 
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get('http://localhost:8000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) setStats(response.data.data);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-CM', { style: 'decimal', maximumFractionDigits: 0 }).format(amount) + ' FCFA';

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-dark text-sm font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  const allBookings = stats?.recent_bookings ?? [];
  const pendingBookings = allBookings.filter((b: any) => b.status === 'pending');
  const confirmedBookings = allBookings.filter((b: any) => b.status === 'confirmed');
  const cancelledBookings = allBookings.filter((b: any) => b.status === 'cancelled');

  // ── StatCard ────────────────────────────────────────────────────────────────
  const StatCard = ({
    icon: Icon, label, value, change, positive, color, path,
  }: {
    icon: any; label: string; value: string | number;
    change?: number; positive?: boolean; color: string; path: string;
  }) => (
    <div
      onClick={() => navigate(path)}
      className="bg-white rounded-2xl shadow-sm p-6 border border-neutral-100
                 hover:shadow-md transition-all duration-300 cursor-pointer
                 hover:scale-[1.01] active:scale-[0.99]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-sm`}>
          <Icon size={24} weight="fill" className="text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-bold ${positive ? 'text-green-500' : 'text-red-500'}`}>
            {positive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-dark">{value}</p>
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );

  // ── BookingColumn ────────────────────────────────────────────────────────────
  const BookingColumn = ({
    title, bookings, icon: Icon, headerCls, badgeCls, iconCls, emptyMsg,
  }: {
    title: string; bookings: any[]; icon: any;
    headerCls: string; badgeCls: string; iconCls: string; emptyMsg: string;
  }) => (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden flex flex-col h-full shadow-sm">
      <div className={`px-5 py-3 ${headerCls} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon size={14} weight="fill" className={iconCls} />
          <span className={`text-xs font-bold uppercase tracking-widest ${iconCls}`}>{title}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeCls}`}>
          {bookings.length}
        </span>
      </div>
      <div className="divide-y divide-neutral-50 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
        {bookings.length === 0 ? (
          <div className="px-5 py-8 text-center text-neutral-400 text-xs">{emptyMsg}</div>
        ) : (
          bookings.slice(0, 5).map((b: any, i: number) => (
            <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-dark font-bold text-[10px] uppercase flex-shrink-0">
                {b.passenger_first_name?.charAt(0) || 'V'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-dark truncate">
                  {b.passenger_first_name || 'Voyageur'} {b.passenger_last_name || ''}
                </p>
                <p className="text-[10px] text-neutral-400 truncate">
                  {b.trip?.departure?.city_name || '-'} → {b.trip?.destination?.city_name || '-'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      {bookings.length > 5 && (
        <div className="px-5 py-2.5 border-t border-neutral-50 mt-auto">
          <button
            onClick={() => navigate('/admin/reservations')}
            className={`text-[10px] font-bold ${iconCls} flex items-center gap-1 uppercase tracking-widest`}
          >
            +{bookings.length - 5} de plus <CaretRight size={10} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* En-tête avec Boutons de Navigation Rapide */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-dark tracking-tight">Vue d'ensemble</h2>
          <p className="text-neutral-400 text-sm font-medium mt-1 uppercase tracking-wider">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        
        {/* Barre d'outils Home / Notifications */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-neutral-100 shadow-sm">
           <button 
             onClick={() => navigate('/')}
             className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all"
           >
             <House size={18} weight="fill" />
             <span>RETOUR AU SITE</span>
           </button>
           
           {stats?.pending_trips_count && stats.pending_trips_count > 0 && (
             <button 
               onClick={() => navigate('/admin/trip-validation')}
               className="relative p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors"
             >
               <Bell size={20} weight="bold" />
               <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                 {stats.pending_trips_count}
               </span>
             </button>
           )}
        </div>
      </div>

      {/* StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Buildings} label="Villes" value={stats?.overview.total_destinations ?? 0} color="bg-blue-500" path="/admin/cities" />
        <StatCard icon={MapTrifold} label="Routes" value={stats?.overview.total_trips ?? 0} color="bg-neutral-700" path="/admin/routes" />
        <StatCard icon={Bus} label="Flotte de bus" value={stats?.overview.active_buses ?? 0} color="bg-orange-500" path="/admin/buses" />
        <StatCard icon={Ticket} label="Réservations" value={stats?.overview.total_bookings ?? 0} color="bg-blue-600" path="/admin/reservations" change={8} positive />
        <StatCard icon={CurrencyDollar} label="Paiements" value={formatCurrency(stats?.overview.total_revenue ?? 0)} color="bg-green-500" path="/admin/payments" change={12} positive />
        <StatCard icon={Users} label="Utilisateurs" value={stats?.overview.total_users ?? 0} color="bg-purple-500" path="/admin/users" change={5} positive />
        <StatCard icon={Storefront} label="Agences" value={stats?.total_agencies ?? 0} color="bg-indigo-400" path="/admin/agencies" />
        <StatCard icon={CheckCircle} label="Validation" value={stats?.pending_trips_count ?? 0} color="bg-amber-500" path="/admin/trip-validation" />
      </div>

      {/* Graphiques */}
      {stats?.charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
            <h3 className="text-lg font-bold text-dark mb-5">Réservations par mois</h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.charts.bookings_by_month}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="count" stroke="#FA9C0F" fill="#FFF8E8" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
            <h3 className="text-lg font-bold text-dark mb-5">Revenus par mois (FCFA)</h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.charts.revenue_by_month}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip formatter={(v: any) => formatCurrency(v)} cursor={{ fill: '#f9fafb' }} />
                  <Bar dataKey="total" fill="#10B981" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Réservations récentes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-dark">Réservations récentes</h3>
          <button onClick={() => navigate('/admin/reservations')} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-widest">
            Voir tout <CaretRight size={14} weight="bold" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <BookingColumn title="En attente" bookings={pendingBookings} icon={Clock} headerCls="bg-amber-50" badgeCls="bg-amber-100 text-amber-700" iconCls="text-amber-600" emptyMsg="Aucune réservation" />
          <BookingColumn title="Confirmées" bookings={confirmedBookings} icon={CheckCircle} headerCls="bg-green-50" badgeCls="bg-green-100 text-green-700" iconCls="text-green-600" emptyMsg="Aucune réservation" />
          <BookingColumn title="Annulées" bookings={cancelledBookings} icon={XCircle} headerCls="bg-red-50" badgeCls="bg-red-100 text-red-700" iconCls="text-red-600" emptyMsg="Aucune réservation" />
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2" />
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h3 className="font-bold text-dark mb-5 text-sm uppercase tracking-wider">Actions rapides</h3>
          <div className="space-y-2.5">
            {[
              { icon: Storefront, label: 'Gérer les agences', path: '/admin/agencies', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100' },
              { icon: CheckCircle, label: 'Valider voyages', path: '/admin/trip-validation', color: 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' },
              { icon: WarningCircle, label: 'Traiter litiges', path: '/admin/disputes', color: 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100' },
              { icon: Users, label: 'Utilisateurs', path: '/admin/users', color: 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100' },
              { icon: CreditCard, label: 'Paiements', path: '/admin/payments', color: 'bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100' },
            ].map(a => (
              <button key={a.path} onClick={() => navigate(a.path)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${a.color}`}>
                <a.icon size={18} weight="fill" /> {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAdminDashboard;