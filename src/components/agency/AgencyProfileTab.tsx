import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAgencyProfile } from '../../services/api'; // ← corrigé

interface AgencyProfile {
  id?: number;
  agency_name?: string;
  phone?: string;
  address?: string;
  email?: string;
  status?: string;
  neighborhood?: string;
  user_id?: number;
  destination_id?: number;
  destination?: {
    city_name?: string;
  };
}

export default function AgencyProfileTab() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<AgencyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getAgencyProfile(); // ← corrigé
      setProfile(data.data || data);         // ← corrigé
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':    return 'bg-green-100 text-green-800';
      case 'pending':   return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default:          return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':    return 'Actif';
      case 'pending':   return "En attente d'approbation";
      case 'suspended': return 'Suspendu';
      default:          return status;
    }
  };

  const InfoCard = ({ label, value, icon }: { label: string; value: string | undefined; icon: string }) => (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <span className="text-3xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm text-gray-600 font-medium">{label}</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      ) : profile ? (
        <>
          {/* Status Section */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{profile.agency_name || 'Agency'}</h2>
                <p className="text-gray-600 mt-2">Profil agence</p>
              </div>
              <span className={`px-6 py-3 rounded-lg font-semibold text-lg ${getStatusBadgeColor(profile.status || '')}`}>
                {getStatusLabel(profile.status || '')}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard label="Numéro de téléphone" value={profile.phone} icon="📱" />
            <InfoCard label="Email" value={profile.email} icon="✉️" />
            <InfoCard label="Adresse" value={profile.address} icon="📍" />
            <InfoCard label="Quartier" value={profile.neighborhood} icon="🏘️" />
            <InfoCard label="Destination" value={profile.destination?.city_name} icon="🗺️" />
            <InfoCard label="ID Utilisateur" value={profile.user_id?.toString()} icon="🔑" />
          </div>

          {/* Agency Details Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Détails Agence</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Nom agence</span>
                <span className="text-gray-900 font-semibold">{profile.agency_name}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-700 font-medium">ID Agence</span>
                <span className="text-gray-900 font-mono">{profile.id}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Statut</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(profile.status || '')}`}>
                  {getStatusLabel(profile.status || '')}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Destination</span>
                <span className="text-gray-900">{profile.destination?.city_name || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Adresse complète</span>
                <span className="text-gray-900">{profile.address || '-'}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Coordonnées</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-3xl">📞</span>
                <div>
                  <p className="text-sm text-gray-600">Numéro de téléphone</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.phone || 'Non fourni'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-3xl">✉️</span>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.email || 'Non fourni'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <span className="text-3xl">📍</span>
                <div>
                  <p className="text-sm text-gray-600">Adresse</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.address || 'Non fourni'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Information */}
          {profile.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">⏳</span>
                <div>
                  <h4 className="font-semibold text-yellow-900">En attente d'approbation</h4>
                  <p className="text-yellow-800 mt-2">
                    Votre agence est en attente d'approbation par l'administrateur. Vous recevrez une notification une fois que votre demande aura été traitée.
                  </p>
                </div>
              </div>
            </div>
          )}

          {profile.status === 'suspended' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">🚫</span>
                <div>
                  <h4 className="font-semibold text-red-900">Compte suspendu</h4>
                  <p className="text-red-800 mt-2">
                    Votre compte d'agence a été suspendu. Veuillez contacter l'administrateur pour plus d'informations ou pour contester cette décision.
                  </p>
                </div>
              </div>
            </div>
          )}

          {profile.status === 'active' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">✅</span>
                <div>
                  <h4 className="font-semibold text-green-900">Compte actif</h4>
                  <p className="text-green-800 mt-2">
                    Votre agence est active et fonctionnelle. Vous pouvez créer des trajets et gérer vos réservations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Read-only Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 text-sm">
              <span className="font-semibold">ℹ️ Note:</span> Ce profil est actuellement en lecture seule. Pour modifier les informations de votre agence, veuillez contacter l'administrateur.
            </p>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-12">
          Impossible de charger le profil agence
        </div>
      )}
    </div>
  );
}