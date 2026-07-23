import React, { useState, useEffect, useCallback } from 'react';
import { adminGetPendingTrips, adminApproveTrip, adminRejectTrip } from '../../services/api';
import {
  CheckCircle, XCircle, Clock, Bus as BusIcon,
  MapPin, ArrowRight, CalendarBlank,
} from '@phosphor-icons/react';

interface TripRow {
  id: number;
  departure?: { city_name: string };
  destination?: { city_name: string };
  departure_date: string;
  departure_time: string;
  bus?: { bus_name: string; total_seats: number };
  agency?: { agency_name: string };
  available_seats: number;
  price: number;
  created_at: string;
  status: string;
  validation_status?: string;
}

export default function TripValidation() {
  const [trips, setTrips]         = useState<TripRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showAll, setShowAll]     = useState(false);
  const [rejectMap, setRejectMap] = useState<Record<number, string>>({});
  const [expandId, setExpandId]   = useState<number | null>(null);
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [working, setWorking]     = useState<number | null>(null);

  const flash = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminGetPendingTrips();
      const finalData = response.data?.data?.data ?? response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
      setTrips(Array.isArray(finalData) ? finalData : []);
    } catch {
      flash('Erreur chargement voyages', false);
      setTrips([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const isPendingValidation = (trip: TripRow) => trip.validation_status === 'pending_validation';
  const pending   = trips.filter(isPendingValidation);
  const displayed = showAll ? trips : pending;

  const handleApprove = async (id: number) => {
    setWorking(id);
    try { await adminApproveTrip(id); flash('Voyage approuvé ✓'); fetchTrips(); }
    catch { flash('Erreur approbation', false); }
    finally { setWorking(null); }
  };

  const handleReject = async (id: number) => {
    const reason = rejectMap[id] || '';
    if (!reason.trim()) { flash('Veuillez saisir une raison de rejet', false); return; }
    setWorking(id);
    try {
      await adminRejectTrip(id, { reason });
      flash('Voyage rejeté');
      setExpandId(null);
      setRejectMap(m => { const n = { ...m }; delete n[id]; return n; });
      fetchTrips();
    } catch { flash('Erreur rejet', false); }
    finally { setWorking(null); }
  };

  const statusBadge = (validation_status: string, status: string) => {
    const config: Record<string, { cls: string; label: string }> = {
      pending_validation: { cls: 'bg-amber-100 text-amber-700 border border-amber-200',     label: 'En attente'  },
      active:             { cls: 'bg-success/10 text-success border border-success/20',     label: 'Approuvé'    },
      rejected:           { cls: 'bg-danger/10 text-danger border border-danger/20',        label: 'Rejeté'      },
      cancelled:          { cls: 'bg-neutral-100 text-neutral-500 border border-neutral-200', label: 'Annulé'    },
    };
    const key = validation_status || status || 'pending_validation';
    const { cls, label } = config[key] ?? { cls: 'bg-neutral-100 text-neutral-500', label: key };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${key === 'active' ? 'bg-success' : key === 'pending_validation' ? 'bg-amber-500' : key === 'rejected' ? 'bg-danger' : 'bg-neutral-400'}`} />
        {label}
      </span>
    );
  };

  const statsData = [
    { label: 'Total',      value: trips.length,                                             color: 'bg-neutral-700', icon: BusIcon       },
    { label: 'En attente', value: pending.length,                                            color: 'bg-amber-500',   icon: Clock         },
    { label: 'Approuvés',  value: trips.filter(t => t.validation_status === 'active').length, color: 'bg-green-500',  icon: CheckCircle   },
    { label: 'Rejetés',    value: trips.filter(t => t.validation_status === 'rejected').length, color: 'bg-red-500', icon: XCircle       },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-dark tracking-tight">Validation des Voyages</h2>
          <p className="text-neutral-400 text-sm font-medium mt-1 uppercase tracking-wider">Approbation des voyages soumis</p>
        </div>
        {pending.length > 0 && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl">
            <Clock size={18} className="text-amber-600" weight="fill" />
            <span className="text-amber-700 font-bold text-sm">{pending.length} en attente</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {statsData.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon size={20} weight="fill" className="text-white" />
            </div>
            <p className="text-2xl font-bold text-dark">{s.value}</p>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div>
        <button onClick={() => setShowAll(s => !s)}
          className="px-5 py-2.5 bg-white border border-neutral-100 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-50 transition uppercase tracking-widest">
          {showAll ? 'Afficher uniquement en attente' : 'Afficher tous les voyages'}
        </button>
      </div>

      {/* Empty */}
      {!loading && displayed.length === 0 && (
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-16 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-400" weight="fill" />
          </div>
          <h3 className="text-xl font-bold text-dark mb-2">Aucun voyage en attente</h3>
          <p className="text-neutral-400">Tous les voyages soumis ont été traités.</p>
        </div>
      )}

      {/* Tableau */}
      {(loading || displayed.length > 0) && (
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-100">
                  {['Trajet', 'Date / Heure', 'Agence', 'Bus / Places', 'Prix', 'Soumis le', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {loading ? (
                  <tr><td colSpan={8} className="px-6 py-16 text-center">
                    <div className="inline-block h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </td></tr>
                ) : displayed.map(trip => {
                  const canValidate = isPendingValidation(trip);
                  const isExpanded  = expandId === trip.id;
                  return (
                    <React.Fragment key={trip.id}>
                      <tr className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-bold text-dark">
                            <MapPin size={14} className="text-primary flex-shrink-0" weight="fill" />
                            <span>{trip.departure?.city_name || '—'}</span>
                            <ArrowRight size={13} className="text-neutral-400" weight="bold" />
                            <span>{trip.destination?.city_name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-dark font-medium">
                            <CalendarBlank size={13} className="text-neutral-400" />
                            {new Date(trip.departure_date).toLocaleDateString('fr-FR')}
                          </div>
                          <p className="font-mono text-xs text-neutral-400 ml-5">{trip.departure_time}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-dark">{trip.agency?.agency_name || '—'}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-dark">{trip.bus?.bus_name || '—'}</p>
                          <p className="text-xs text-neutral-400">{trip.available_seats} / {trip.bus?.total_seats || '?'} places</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-dark">{trip.price.toLocaleString()} <span className="text-xs font-normal text-neutral-400">FCFA</span></td>
                        <td className="px-6 py-4 text-sm text-neutral-400">{new Date(trip.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4">{statusBadge(trip.validation_status ?? '', trip.status)}</td>
                        <td className="px-6 py-4">
                          {canValidate ? (
                            <div className="flex gap-2">
                              <button disabled={working === trip.id} onClick={() => handleApprove(trip.id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 disabled:opacity-50 transition">
                                <CheckCircle size={13} weight="fill" />
                                {working === trip.id ? '...' : 'Approuver'}
                              </button>
                              <button disabled={working === trip.id} onClick={() => setExpandId(isExpanded ? null : trip.id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 disabled:opacity-50 transition">
                                <XCircle size={13} weight="fill" /> Rejeter
                              </button>
                            </div>
                          ) : (
                            <span className="text-neutral-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>

                      {isExpanded && canValidate && (
                        <tr className="bg-red-50/60 border-t border-red-100">
                          <td colSpan={8} className="px-8 py-5">
                            <div className="max-w-lg space-y-3">
                              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-widest">Raison du rejet *</label>
                              <textarea rows={3}
                                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none bg-white"
                                placeholder="Expliquez pourquoi ce voyage est rejeté..."
                                value={rejectMap[trip.id] || ''}
                                onChange={e => setRejectMap(m => ({ ...m, [trip.id]: e.target.value }))}
                              />
                              <div className="flex gap-3">
                                <button onClick={() => setExpandId(null)}
                                  className="px-5 py-2.5 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-50 transition uppercase tracking-widest">
                                  Annuler
                                </button>
                                <button disabled={working === trip.id} onClick={() => handleReject(trip.id)}
                                  className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 disabled:opacity-50 transition uppercase tracking-widest">
                                  {working === trip.id ? 'Rejet...' : 'Confirmer le rejet'}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 px-5 py-3 rounded-2xl text-white shadow-xl z-50 text-sm font-bold ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
