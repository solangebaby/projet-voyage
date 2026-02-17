import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Users,
  MagnifyingGlass,
  CheckCircle,
  XCircle,
  Eye,
  Trash,
  UserCircle,
  Envelope,
  Phone,
  Calendar,
  ArrowLeft,
  FunnelSimple,
} from '@phosphor-icons/react';
import { authService } from '../../services/api';

interface User {
  id: number;
  name: string;
  first_name?: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  reservations_count: number;
  created_at: string;
}

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (roleFilter !== 'all') params.append('role', roleFilter);

      const response = await axios.get(
        `http://localhost:8000/api/users?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setUsers(response.data.data.data || response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir activer ce compte ?')) return;

    try {
      const token = authService.getToken();
      const response = await axios.post(
        `http://localhost:8000/api/users/${userId}/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Compte activé avec succès. Email envoyé à l\'utilisateur.');
        fetchUsers();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de l\'activation';
      toast.error(message);
    }
  };

  const handleDeactivate = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver ce compte ?')) return;

    try {
      const token = authService.getToken();
      const response = await axios.post(
        `http://localhost:8000/api/users/${userId}/deactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Compte désactivé avec succès');
        fetchUsers();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la désactivation';
      toast.error(message);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('⚠️ ATTENTION : Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) return;

    try {
      const token = authService.getToken();
      const response = await axios.delete(
        `http://localhost:8000/api/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Utilisateur supprimé avec succès');
        fetchUsers();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-dark text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-dark" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-dark flex items-center gap-3">
                  <Users size={32} weight="duotone" className="text-primary" />
                  Gestion des Utilisateurs
                </h1>
                <p className="text-sm text-neutral-500 mt-1">
                  {filteredUsers.length} utilisateur(s) trouvé(s)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlass 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" 
              />
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FunnelSimple 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" 
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>

            {/* Role Filter */}
            <div className="relative">
              <FunnelSimple 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" 
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
              >
                <option value="all">Tous les rôles</option>
                <option value="voyageur">Voyageur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Réservations
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <UserCircle size={24} weight="fill" className="text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-dark">{user.name}</p>
                          <p className="text-xs text-neutral-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Envelope size={16} />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Phone size={16} />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-secondary-100 text-secondary-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'admin' ? 'Administrateur' : 'Voyageur'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                        user.status === 'active' 
                          ? 'bg-success-100 text-success-700'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {user.status === 'active' ? (
                          <>
                            <CheckCircle size={16} weight="fill" />
                            Actif
                          </>
                        ) : (
                          <>
                            <XCircle size={16} weight="fill" />
                            Inactif
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-dark">
                        {user.reservations_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Calendar size={16} />
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === 'inactive' && user.role !== 'admin' && (
                          <button
                            onClick={() => handleActivate(user.id)}
                            className="p-2 bg-success-100 text-success-700 rounded-lg hover:bg-success-200 transition-colors"
                            title="Activer le compte"
                          >
                            <CheckCircle size={20} weight="fill" />
                          </button>
                        )}
                        {user.status === 'active' && user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeactivate(user.id)}
                            className="p-2 bg-warning-100 text-warning-700 rounded-lg hover:bg-warning-200 transition-colors"
                            title="Désactiver le compte"
                          >
                            <XCircle size={20} weight="fill" />
                          </button>
                        )}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 bg-danger-100 text-danger-700 rounded-lg hover:bg-danger-200 transition-colors"
                            title="Supprimer l'utilisateur"
                          >
                            <Trash size={20} weight="fill" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users size={48} className="text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
