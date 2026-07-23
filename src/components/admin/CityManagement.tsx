import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useConfirm } from '../ConfirmDialog';
import {
  MapPin,
  Plus,
  Pencil,
  Trash,
  X,
  MapTrifold,
  MagnifyingGlass,
} from '@phosphor-icons/react';

interface City {
  id: number;
  city_name: string;
  region: string | null;
  country: string;
  status: 'actif' | 'inactif';
  created_at: string;
}

const emptyForm = {
  city_name: '',
  region: '',
  country: 'Cameroun',
  status: 'actif' as 'actif' | 'inactif',
};

const CityManagement = () => {
  const { t }        = useTranslation();
  const { confirm }  = useConfirm();

  const [cities, setCities]         = useState<City[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData]     = useState(emptyForm);

  const token = localStorage.getItem('token');

  useEffect(() => { fetchCities(); }, []);

  // ── Chargement ────────────────────────────────────────────────────────────
  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/admin/cities', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) setCities(response.data.data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des villes');
    } finally {
      setLoading(false);
    }
  };

  // ── Validation côté client ────────────────────────────────────────────────
  // Accepte lettres (avec accents), espaces, tirets, apostrophes
  const regexAlpha = /^[a-zA-ZÀ-ÿ\s\-']+$/u;

  const validateForm = (): boolean => {
    if (!formData.city_name.trim()) {
      toast.error('Le nom de la ville est requis');
      return false;
    }
    if (!regexAlpha.test(formData.city_name)) {
      toast.error('Le nom de la ville ne doit contenir que des lettres');
      return false;
    }
    if (formData.region && !regexAlpha.test(formData.region)) {
      toast.error('Le nom de la région est invalide');
      return false;
    }
    if (!formData.country.trim()) {
      toast.error('Le pays est requis');
      return false;
    }
    if (!regexAlpha.test(formData.country)) {
      toast.error('Le nom du pays est invalide');
      return false;
    }
    return true;
  };

  // ── Soumission (création ou modification) ────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const url    = editingCity
        ? `http://localhost:8000/api/admin/cities/${editingCity.id}`
        : 'http://localhost:8000/api/admin/cities';
      const method = editingCity ? 'put' : 'post';

      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success(response.data.message);

        // Affiche l'avertissement du backend si présent (ex: trajets liés affectés)
        if (response.data.warning) {
          toast(response.data.warning, { icon: '⚠️', duration: 5000 });
        }

        fetchCities();
        closeModal();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur d'enregistrement");
    }
  };

  // ── Édition ───────────────────────────────────────────────────────────────
  const handleEdit = (city: City) => {
    setEditingCity(city);
    setFormData({
      city_name: city.city_name,
      region:    city.region || '',
      country:   city.country,
      status:    city.status,
    });
    setShowModal(true);
  };

  // ── Suppression ───────────────────────────────────────────────────────────
  const handleDelete = async (city: City) => {
    const confirmed = await confirm(`Voulez-vous supprimer ${city.city_name} ?`);
    if (!confirmed) return;

    try {
      const response = await axios.delete(
        `http://localhost:8000/api/admin/cities/${city.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        toast.success(response.data.message || 'Ville supprimée');
        fetchCities();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de suppression');
    }
  };

  // ── Ouverture / fermeture modal ───────────────────────────────────────────
  const openCreateModal = () => {
    setEditingCity(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCity(null);
    // Réinitialisation complète du formulaire à la fermeture
    setFormData(emptyForm);
  };

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const filteredCities = cities.filter(c =>
    c.city_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.region?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // ── Loader ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-dark tracking-tight">Gestion des Villes</h2>
          <p className="text-neutral-400 text-sm font-medium mt-1 uppercase tracking-wider">
            Configuration du réseau de transport
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase text-xs tracking-widest"
        >
          <Plus size={20} weight="bold" />
          Ajouter une destination
        </button>
      </div>

      {/* Barre de recherche + compteur */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative">
          <MagnifyingGlass
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Rechercher une ville ou une région..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-100 rounded-2xl shadow-soft focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
          />
        </div>
        <div className="bg-white px-4 py-3.5 border border-neutral-100 rounded-2xl shadow-soft flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Total</span>
          <span className="text-lg font-bold text-dark">{cities.length} Villes</span>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-3xl shadow-soft border border-neutral-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50/50 border-b border-neutral-100">
              <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Localisation</th>
              <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Région / Pays</th>
              <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Statut</th>
              <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {filteredCities.map(city => (
              <tr key={city.id} className="group hover:bg-neutral-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center text-info">
                      <MapPin size={22} weight="fill" />
                    </div>
                    <div>
                      <p className="font-bold text-dark text-base">{city.city_name}</p>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">ID: #{city.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-dark">{city.region || '—'}</span>
                    <span className="text-xs text-neutral-400">{city.country}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    city.status === 'actif'
                      ? 'bg-success/10 text-success border border-success/20'
                      : 'bg-danger/10 text-danger border border-danger/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${city.status === 'actif' ? 'bg-success' : 'bg-danger'}`} />
                    {city.status}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(city)}
                      className="p-2 text-neutral-400 hover:text-info hover:bg-info/10 rounded-lg transition-all"
                      title="Modifier"
                    >
                      <Pencil size={20} weight="bold" />
                    </button>
                    <button
                      onClick={() => handleDelete(city)}
                      className="p-2 text-neutral-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash size={20} weight="bold" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCities.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapTrifold size={40} className="text-neutral-200" />
            </div>
            <p className="text-neutral-400 font-medium">Aucune ville trouvée pour votre recherche.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border border-white/20">
            <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <div>
                <h3 className="text-xl font-bold text-dark">
                  {editingCity ? 'Modifier la ville' : 'Nouvelle destination'}
                </h3>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">
                  Informations géographiques
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm text-neutral-400"
              >
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Nom */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">
                  Nom de la ville *
                </label>
                <input
                  type="text"
                  value={formData.city_name}
                  onChange={e => setFormData({ ...formData, city_name: e.target.value })}
                  className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary outline-none transition-all font-semibold"
                  placeholder="ex: Douala"
                  required
                />
              </div>

              {/* Région + Pays */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">
                    Région
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={e => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary outline-none transition-all font-semibold"
                    placeholder="ex: Littoral"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">
                    Pays *
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary outline-none transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 ml-1">
                  Statut de la ville
                </label>
                <div className="flex gap-3">
                  {(['actif', 'inactif'] as const).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, status })}
                      className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                        formData.status === status
                          ? 'bg-dark text-white border-dark shadow-lg shadow-dark/20'
                          : 'bg-white text-neutral-400 border-neutral-100 hover:border-neutral-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-4 border border-neutral-100 rounded-2xl font-bold text-neutral-400 uppercase text-[10px] tracking-widest hover:bg-neutral-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {editingCity ? 'Enregistrer les modifications' : 'Confirmer la création'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityManagement;
