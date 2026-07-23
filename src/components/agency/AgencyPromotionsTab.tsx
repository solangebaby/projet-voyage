import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPromotions, createPromotion, updatePromotion, deletePromotion, togglePromotion, getAgencyPayments } from '../../services/api';

interface Promotion {
  id: number;
  code?: string;
  description?: string;
  discount_type?: 'percent' | 'fixed';
  discount_value?: number;
  min_amount?: number;
  max_uses?: number;
  usage_count?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
}

interface Payment {
  id: number;
  amount?: number;
  method?: string;
  status?: string;
  created_at?: string;
}

export default function AgencyPromotionsTab() {
  const { t } = useTranslation();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: '',
    min_amount: '',
    max_uses: '',
    valid_from: '',
    valid_until: '',
  });

  useEffect(() => {
    fetchPromotions();
    fetchPayments();
  }, []);

  const fetchPromotions = async () => {
    try {
      const data = await getPromotions();
      setPromotions(data.data || data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const data = await getAgencyPayments();
      setPayments(data.data || data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code,
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_amount: formData.min_amount ? parseFloat(formData.min_amount) : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
      };

      if (editingId) {
        await updatePromotion(editingId, payload);
      } else {
        await createPromotion(payload);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({
        code: '',
        description: '',
        discount_type: 'percent',
        discount_value: '',
        min_amount: '',
        max_uses: '',
        valid_from: '',
        valid_until: '',
      });
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
      try {
        await deletePromotion(id);
        fetchPromotions();
      } catch (error) {
        console.error('Error deleting promotion:', error);
      }
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await togglePromotion(id);
      fetchPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingId(promotion.id);
    setFormData({
      code: promotion.code || '',
      description: promotion.description || '',
      discount_type: promotion.discount_type || 'percent',
      discount_value: promotion.discount_value?.toString() || '',
      min_amount: promotion.min_amount?.toString() || '',
      max_uses: promotion.max_uses?.toString() || '',
      valid_from: promotion.valid_from || '',
      valid_until: promotion.valid_until || '',
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Add New Promotion Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              code: '',
              description: '',
              discount_type: 'percent',
              discount_value: '',
              min_amount: '',
              max_uses: '',
              valid_from: '',
              valid_until: '',
            });
            setShowModal(true);
          }}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          + Nouvelle Promotion
        </button>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Promotions Actives</h3>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">{t('common.loading')}</div>
        ) : promotions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-gray-900">{promo.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{promo.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {promo.discount_type === 'percent' ? '%' : 'XAF'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {promo.discount_value} {promo.discount_type === 'percent' ? '%' : 'XAF'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {promo.usage_count || 0} / {promo.max_uses || '∞'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {promo.valid_from} à {promo.valid_until}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleToggle(promo.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          promo.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {promo.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(promo)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">Aucune promotion</div>
        )}
      </div>

      {/* Payments Summary */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Résumé des Paiements</h3>
        </div>
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{payment.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{payment.amount} XAF</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.method}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">Aucun paiement</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Éditer Promotion' : 'Nouvelle Promotion'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Code (ex: NOEL20)"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percent' | 'fixed' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (XAF)</option>
              </select>
              <input
                type="number"
                placeholder="Valeur de la réduction"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                placeholder="Montant minimum (optionnel)"
                value={formData.min_amount}
                onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Nombre max d'utilisations (optionnel)"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
