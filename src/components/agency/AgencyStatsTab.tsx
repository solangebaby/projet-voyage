import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAgencyStats, getAgencyReservations } from '../../services/api';

interface Stats {
  total_reservations?: number;
  revenue?: number;
  fill_rate?: number;
  active_trips?: number;
  pending_trips?: number;
  completed_trips?: number;
}

interface Reservation {
  id: number;
  passenger_first_name?: string;
  passenger_last_name?: string;
  selected_seat?: string;
  status?: string;
  created_at?: string;
}

interface Props {
  onNavigate: (tab: string) => void;
}

export default function AgencyStatsTab({ onNavigate }: Props) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await getAgencyStats();
        setStats(statsData.stats || statsData);
        const resData = await getAgencyReservations({ limit: 5 });
        setReservations(resData.data || resData || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':             return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':           return 'bg-green-100 text-green-800';
      case 'cancelled':           return 'bg-red-100 text-red-800';
      case 'reserved_at_counter': return 'bg-blue-100 text-blue-800';
      default:                    return 'bg-gray-100 text-gray-800';
    }
  };

  const kpiCards = [
    {
      title: t('agency.stats.totalReservations'),
      value: stats?.total_reservations ?? 0,
      icon: '📋',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-600',
      tab: 'passengers',
    },
    {
      title: t('agency.stats.revenue'),
      value: `${stats?.revenue ?? 0} ${t('common.currency')}`,
      icon: '💵',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-600',
      tab: 'commercial',
    },
    {
      title: t('agency.stats.fillRate'),
      value: `${stats?.fill_rate ?? 0}%`,
      icon: '📊',
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-600',
      tab: 'trips',
    },
    {
      title: t('agency.stats.activeTrips'),
      value: stats?.active_trips ?? 0,
      icon: '🚌',
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-600',
      tab: 'trips',
    },
  ];

  return (
    <div className="space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            onClick={() => onNavigate(card.tab)}
            className={`${card.color} border rounded-lg p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{card.title}</p>
                <p className={`text-3xl font-bold ${card.textColor} mt-2`}>{card.value}</p>
              </div>
              <span className="text-4xl">{card.icon}</span>
            </div>
            <p className="text-xs text-gray-400 mt-3">{t('common.view')} →</p>
          </div>
        ))}
      </div>

      {/* Trip Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t('agency.dashboard.trips')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('trips')}
            className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="text-yellow-600 text-sm font-medium">
              {t('agency.stats.pendingTrips')}
            </div>
            <div className="text-3xl font-bold text-yellow-700 mt-2">
              {stats?.pending_trips ?? 0}
            </div>
          </div>
          <div
            onClick={() => onNavigate('trips')}
            className="p-4 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="text-green-600 text-sm font-medium">
              {t('agency.stats.activeTrips')}
            </div>
            <div className="text-3xl font-bold text-green-700 mt-2">
              {stats?.active_trips ?? 0}
            </div>
          </div>
          <div
            onClick={() => onNavigate('trips')}
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="text-blue-600 text-sm font-medium">
              {t('agency.stats.completedTrips')}
            </div>
            <div className="text-3xl font-bold text-blue-700 mt-2">
              {stats?.completed_trips ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div
          onClick={() => onNavigate('passengers')}
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        >
          <h3 className="text-lg font-semibold text-gray-800">
            {t('agency.stats.recentReservations')}
          </h3>
          <span className="text-sm text-blue-500 font-medium">
            {t('common.view')} →
          </span>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            {t('common.loading')}
          </div>
        ) : reservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('agency.passengers.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('agency.passengers.seat')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('common.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('common.date')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations.map((res) => (
                  <tr
                    key={res.id}
                    onClick={() => onNavigate('passengers')}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {res.passenger_first_name} {res.passenger_last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {res.selected_seat}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(res.status || '')}`}>
                        {t(`statuses.${res.status}`, res.status || '')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {res.created_at
                        ? new Date(res.created_at).toLocaleDateString('fr-FR')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            {t('agency.stats.recentReservations')}
          </div>
        )}
      </div>

    </div>
  );
}