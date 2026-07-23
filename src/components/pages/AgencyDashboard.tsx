import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { agencyService } from '../../services/api';

import AgencyStatsTab from '../agency/AgencyStatsTab';
import AgencyTripsTab from '../agency/AgencyTripsTab';
import AgencyPassengersTab from '../agency/AgencyPassengersTab';
import AgencyPromotionsTab from '../agency/AgencyPromotionsTab';
import AgencyProfileTab from '../agency/AgencyProfileTab';

import {
  ChartBar,
  Bus,
  Users,
  CurrencyDollar,
  Gear,
  SignOut,
  CaretLeft,
  CaretRight
} from "@phosphor-icons/react";

export default function AgencyDashboard() {

  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [agencyName, setAgencyName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const TABS = [
    { id: 'overview',   label: t('agency.dashboard.overview'),   icon: ChartBar },
    { id: 'trips',      label: t('agency.dashboard.trips'),      icon: Bus },
    { id: 'passengers', label: t('agency.dashboard.passengers'), icon: Users },
    { id: 'commercial', label: t('agency.dashboard.commercial'), icon: CurrencyDollar },
    { id: 'profile',    label: t('agency.dashboard.profile'),    icon: Gear },
  ];

  useEffect(() => {
    agencyService.getStats()
      .then((d: any) => {
        const data = d?.data || d;
        if (data?.agency?.agency_name) setAgencyName(data.agency.agency_name);
        else if (data?.agency_name) setAgencyName(data.agency_name);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':   return <AgencyStatsTab onNavigate={setActiveTab} />;
      case 'trips':      return <AgencyTripsTab />;
      case 'passengers': return <AgencyPassengersTab />;
      case 'commercial': return <AgencyPromotionsTab />;
      case 'profile':    return <AgencyProfileTab />;
      default:           return <AgencyStatsTab onNavigate={setActiveTab} />;
    }
  };

  const ActiveIcon = TABS.find(tab => tab.id === activeTab)?.icon;

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden">

      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 bg-dark text-white flex flex-col transition-all duration-300`}>

        <div className="p-4 border-b border-neutral-700 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">
            {agencyName?.charAt(0)?.toUpperCase()}
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{agencyName}</p>
              <p className="text-xs text-neutral-300">
                {t('agency.dashboard.title')}
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 space-y-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/20 text-white font-semibold border-r-4 border-primary'
                    : 'text-neutral-200 hover:bg-white/10'
                }`}
              >
                <Icon size={20} weight="duotone" />
                {sidebarOpen && (
                  <span className="text-sm">{tab.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-700 space-y-2">
          <button
            onClick={() => setSidebarOpen(s => !s)}
            className="w-full flex items-center gap-3 px-2 py-2 text-neutral-300 hover:text-white text-sm"
          >
            {sidebarOpen ? <CaretLeft size={18} /> : <CaretRight size={18} />}
            {sidebarOpen && t('common.close')}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-2 py-2 text-danger hover:text-danger-light text-sm"
          >
            <SignOut size={18} />
            {sidebarOpen && t('common.logout')}
          </button>
        </div>

      </aside>

      <main className="flex-1 overflow-auto">

        <header className="bg-white shadow-soft px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            {ActiveIcon && <ActiveIcon size={22} weight="duotone" />}
            {TABS.find(tab => tab.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <span className="bg-success/20 text-success px-3 py-1 rounded-full text-xs font-semibold">
              ● {t('agency.dashboard.online')}
            </span>
            <span className="text-sm text-neutral-500">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </span>
          </div>
        </header>

        <div className="p-6">
          {renderTab()}
        </div>

      </main>

    </div>
  );
}