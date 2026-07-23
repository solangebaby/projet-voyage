import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Users, Bus, Ticket, CurrencyDollar,
  SignOut, ChartLine, Buildings,
  CaretRight, CreditCard, UserCircle,
  MapTrifold, CheckCircle, WarningCircle,
  Storefront, House, List, X,
  Bell,
} from '@phosphor-icons/react';
import { authService } from '../../services/api';

// Types et Menu (Inchangés)
interface MenuItem { icon: React.ComponentType<any>; label: string; path: string; badge?: string | number; }
interface MenuSection { section: string; items: MenuItem[]; }

const menuSections: MenuSection[] = [
  { section: 'Aperçu', items: [{ icon: ChartLine, label: 'Tableau de bord', path: '/admin-dashboard' }] },
  { section: 'Infrastructure', items: [
    { icon: Buildings, label: 'Villes', path: '/admin/cities' },
    { icon: MapTrifold, label: 'Routes', path: '/admin/routes' },
    { icon: Bus, label: 'Flotte de bus', path: '/admin/buses' },
  ]},
  { section: 'Opérations', items: [
    { icon: Ticket, label: 'Réservations', path: '/admin/reservations' },
    { icon: CreditCard, label: 'Paiements', path: '/admin/payments' },
    { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
  ]},
  { section: 'Marketplace', items: [
    { icon: Storefront, label: 'Agences', path: '/admin/agencies' },
    { icon: CheckCircle, label: 'Validation Voyages', path: '/admin/trip-validation' },
    { icon: WarningCircle, label: 'Litiges', path: '/admin/disputes' },
  ]},
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const token = authService.getToken();
        const res = await axios.get('http://localhost:8000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setPendingCount(res.data.data?.pending_trips_count ?? 0);
      } catch { /* silencieux */ }
    };
    fetchPending();
  }, [location.pathname]);

  const handleLogout = () => {
    authService.logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  const user = authService.getUser();
  const currentLabel = menuSections.flatMap(s => s.items).find(i => i.path === location.pathname)?.label ?? 'Administration';

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 transition-opacity hover:opacity-80">
          {(sidebarOpen || mobile) ? (
            <><span className="text-xl font-bold text-primary">KCTRIP</span><span className="text-xl font-bold text-white">Admin</span></>
          ) : (
            <span className="text-xl font-bold text-primary mx-auto">K</span>
          )}
        </button>
        {mobile && <button onClick={() => setMobileSidebar(false)} className="text-white/40"><X size={20} /></button>}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none py-4 space-y-6">
        {/* Profil & Navigation (Logique identique, défilement interne) */}
        {(sidebarOpen || mobile) && (
          <div className="px-5 mb-4">
             <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <UserCircle size={24} weight="fill" className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">{user?.name || 'Admin'}</p>
                </div>
             </div>
          </div>
        )}

        <nav className="px-4 space-y-6">
          {menuSections.map((section) => (
            <div key={section.section}>
              {(sidebarOpen || mobile) && <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 px-3">{section.section}</p>}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const badge = item.path === '/admin/trip-validation' ? pendingCount : item.badge;
                  return (
                    <li key={item.path}>
                      <button onClick={() => { navigate(item.path); if (mobile) setMobileSidebar(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${isActive ? 'bg-primary text-white shadow-lg' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}>
                        <item.icon size={20} weight={isActive ? 'fill' : 'regular'} />
                        {(sidebarOpen || mobile) && <span className="font-semibold flex-1 text-left">{item.label}</span>}
                        {(sidebarOpen || mobile) && Number(badge) > 0 && <span className="bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5 flex-shrink-0">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
          <SignOut size={20} />
          {(sidebarOpen || mobile) && <span className="font-bold text-sm">Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full flex overflow-hidden bg-neutral-50 font-poppins">
      {/* Sidebar Desktop */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 bg-dark text-white transition-all duration-300 relative ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <SidebarContent />
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute -right-3 top-10 w-6 h-6 bg-dark border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white z-50">
          <CaretRight size={12} weight="bold" className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Mobile Drawer (Inchangé mais avec z-index assuré) */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebar(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-dark shadow-2xl"><SidebarContent mobile /></aside>
        </div>
      )}

      {/* Zone de contenu */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center px-6 gap-4 flex-shrink-0 z-40 shadow-sm">
          <button onClick={() => setMobileSidebar(true)} className="md:hidden p-2 rounded-lg hover:bg-neutral-100"><List size={24} /></button>
          <div className="flex-1 font-semibold text-dark truncate">{currentLabel}</div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-xs font-bold text-primary bg-primary/5 px-3 py-2 rounded-lg border border-primary/10 hover:bg-primary hover:text-white transition-all">SITE</button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">{user?.name?.charAt(0) || 'A'}</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-neutral-50 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;