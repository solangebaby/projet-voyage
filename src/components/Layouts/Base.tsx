import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Partials/Sidebar';
import { Footer } from './Partials/Footer';
import Header from './Partials/Header';
import localData from './db.json';
import clsx from 'clsx';

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
  pending_trips_count?: number;
  total_agencies?: number;
  total_disputes?: number;
}

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  active?: boolean;
  badge?: string | number;
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}


const BaseApp: React.FC = () => {

    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    useEffect(() => { fetchDashboardStats(); }, []);
    const fetchDashboardStats = async () => {
        try {
        const token = authService.getToken();
        const response = await axios.get('http://localhost:8000/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
            setStats(response.data.data);
        }
        } catch (error) {
        console.error("Erreur de chargement:", error);
        toast.error('Erreur lors du chargement des données');
        } finally {
        setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        toast.success('Déconnexion réussie');
        navigate('/login');
    };

    if (loading) {
        return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-poppins">
            <div className="text-center animate-scale-up">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4" />
            <p className="text-dark text-lg font-medium">Chargement du tableau de bord...</p>
            </div>
        </div>
        );
    }

    const user = authService.getUser();

    const allBookings       = stats?.recent_bookings ?? [];
    const pendingBookings   = allBookings.filter((b: any) => b.status === 'pending');
    const confirmedBookings = allBookings.filter((b: any) => b.status === 'confirmed');
    const cancelledBookings = allBookings.filter((b: any) => b.status === 'cancelled');

    const menuItems: MenuSection[] = [
        {
        section: 'Aperçu',
        items: [
            { icon: ChartLine, label: 'Tableau de bord', path: '/admin-dashboard', active: true },
        ],
        },
        {
        section: 'Infrastructure',
        items: [
            { icon: Buildings,  label: 'Villes',        path: '/admin/cities' },
            { icon: MapTrifold, label: 'Routes',        path: '/admin/routes' },
            { icon: Bus,        label: 'Flotte de bus', path: '/admin/buses'  },
        ],
        },
        {
        section: 'Opérations',
        items: [
            { icon: Ticket,     label: 'Réservations', path: '/admin/reservations' },
            { icon: CreditCard, label: 'Paiements',    path: '/admin/payments'     },
            { icon: Users,      label: 'Utilisateurs', path: '/admin/users'        },
        ],
        },
        {
        section: 'Marketplace',
        items: [
            { icon: Storefront,    label: 'Agences',            path: '/admin/agencies'        },
            { icon: CheckCircle,   label: 'Validation Voyages', path: '/admin/trip-validation' },
            { icon: WarningCircle, label: 'Litiges',            path: '/admin/disputes'        },
        ],
        },
    ];

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('fr-CM', { style: 'decimal', maximumFractionDigits: 0 }).format(amount) + ' FCFA';

    // ── StatCard cliquable ────────────────────────────────────────────
    const StatCard = ({
        icon: Icon, label, value, change, positive, color, path,
    }: {
        icon: any; label: string; value: string | number;
        change?: number; positive?: boolean; color: string; path: string;
    }) => (
        <div
        onClick={() => navigate(path)}
        className="bg-white rounded-2xl shadow-soft p-6 border border-neutral-100 hover:shadow-medium transition-all duration-300 animate-slide-up cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
        <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg`}>
            <Icon size={24} weight="fill" className="text-white" />
            </div>
            {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-bold ${positive ? 'text-success' : 'text-danger'}`}>
                {positive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                {Math.abs(change)}%
            </div>
            )}
        </div>
        <div>
            <p className="text-2xl font-bold text-dark">{value}</p>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mt-1">{label}</p>
        </div>
        </div>
    );

    // ── BookingColumn ─────────────────────────────────────────────────
    const BookingColumn = ({
        title, bookings, icon: Icon, headerCls, badgeCls, iconCls, emptyMsg,
    }: {
        title: string; bookings: any[]; icon: any;
        headerCls: string; badgeCls: string; iconCls: string; emptyMsg: string;
    }) => (
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden animate-slide-up flex flex-col">
        <div className={`px-5 py-3 ${headerCls} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
            <Icon size={14} weight="fill" className={iconCls} />
            <span className={`text-xs font-bold uppercase tracking-widest ${iconCls}`}>{title}</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeCls}`}>
            {bookings.length}
            </span>
        </div>
        <div className="divide-y divide-neutral-50 flex-1">
            {bookings.length === 0 ? (
            <div className="px-5 py-8 text-center text-neutral-400 text-xs">{emptyMsg}</div>
            ) : (
            bookings.slice(0, 5).map((b: any, i: number) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-neutral-50/50 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-dark font-bold text-[10px] uppercase flex-shrink-0">
                    {b.passenger_first_name?.charAt(0) || 'V'}
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-dark truncate">
                    {b.passenger_first_name || b.first_name || 'Voyageur'}{' '}
                    {b.passenger_last_name  || b.last_name  || ''}
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
            <div className="px-5 py-2.5 border-t border-neutral-50">
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
        <div className="min-h-screen bg-neutral-50 flex font-poppins">

            {/* ── Sidebar ── */}
            <aside className={`${sidebarOpen ? 'w-72' : 'w-24'} bg-dark text-white transition-all duration-300 fixed h-screen overflow-y-auto z-50 flex flex-col shadow-strong`}>
                <div className="p-6 border-b border-white/5">
                {sidebarOpen ? (
                    <div className="animate-fade-in">
                    <h1 className="text-xl font-bold text-primary">KCTRIP<span className="text-white">Admin</span></h1>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Marketplace Transport</p>
                    </div>
                ) : (
                    <div className="text-center">
                    <span className="text-xl font-bold text-primary">J</span>
                    </div>
                )}
                </div>

                <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full flex items-center justify-center py-2 text-white/30 hover:text-primary transition-colors text-[10px] font-bold uppercase">
                {sidebarOpen ? '← Réduire' : '→'}
                </button>

                {sidebarOpen && (
                <div className="px-6 pb-4 border-b border-white/5 animate-fade-in">
                    <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-primary">
                        <UserCircle size={28} weight="fill" className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-white truncate">{user?.name || 'Administrateur'}</h3>
                        <p className="text-[10px] text-neutral-500 truncate">{user?.email}</p>
                    </div>
                    </div>
                </div>
                )}

                <nav className="p-4 space-y-6 flex-1 overflow-y-auto">
                {menuItems.map((section, idx) => (
                    <div key={idx}>
                    {sidebarOpen && (
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 px-4">
                        {section.section}
                        </p>
                    )}
                    <ul className="space-y-1">
                        {section.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                            <button
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                item.active
                                ? 'bg-primary text-white shadow-primary'
                                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                            }`}
                            >
                            <item.icon size={20} weight={item.active ? 'fill' : 'regular'} className={item.active ? '' : 'group-hover:text-primary transition-colors'} />
                            {sidebarOpen && <span className="font-semibold text-sm flex-1 text-left">{item.label}</span>}
                            {sidebarOpen && item.badge !== undefined && (
                                <span className="bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {String(item.badge)}
                                </span>
                            )}
                            </button>
                        </li>
                        ))}
                    </ul>
                    </div>
                ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-secondary/10 hover:text-secondary transition-all"
                >
                    <SignOut size={20} />
                    {sidebarOpen && <span className="font-bold text-sm">Déconnexion</span>}
                </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className={`${sidebarOpen ? 'ml-72' : 'ml-24'} flex-1 transition-all duration-300 p-8`}>
                <Outlet />
            </main>
        </div>
    );
};

export default BaseApp;