import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import {
  Envelope,
  LockKey,
  Eye,
  EyeSlash,
  ShieldCheck,
  ArrowLeft,
} from '@phosphor-icons/react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password,
      });

      console.log('Response:', response.data); // DEBUG

      // Check different response structures
      const data = response.data;
      const user = data.user || data.data?.user;
      const token = data.token || data.data?.token;

      if (!user || !token) {
        console.error('Invalid response structure:', data);
        toast.error('Erreur de connexion: structure de réponse invalide');
        return;
      }

      console.log('User:', user); // DEBUG
      console.log('Role:', user.role); // DEBUG

      if (user.role !== 'admin') {
        toast.error('Accès refusé. Connexion administrateur requise.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('Connexion réussie !', {
        duration: 2000,
      });
      
      // Rediriger vers le dashboard admin
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 500);
    } catch (error: any) {
      console.error('Login error:', error); // DEBUG
      const message = error.response?.data?.message || 'Erreur de connexion';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-dark hover:text-primary transition-colors group"
      >
        <ArrowLeft size={20} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Retour à l'accueil</span>
      </button>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-primary mb-4 animate-bounce-soft">
            <ShieldCheck size={40} weight="duotone" className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-dark mb-2">
            Espace Administrateur
          </h1>
          <p className="text-gray-600">
            Connectez-vous pour accéder au dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-strong p-8 backdrop-blur-sm animate-scale-up">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <Input
                label="Email Administrateur"
                type="email"
                placeholder="admin@jadootravels.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Envelope size={20} weight="duotone" />}
                required
                autoComplete="email"
                className="transition-all duration-300 focus:scale-[1.02]"
              />
            </div>

            {/* Password Input with Toggle */}
            <div>
              <div className="relative">
                <Input
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<LockKey size={20} weight="duotone" />}
                  required
                  autoComplete="current-password"
                  className="transition-all duration-300 focus:scale-[1.02]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[42px] text-gray-400 hover:text-primary transition-colors z-10"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlash size={20} weight="duotone" />
                  ) : (
                    <Eye size={20} weight="duotone" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2 transition"
                />
                <span className="text-gray-600 group-hover:text-dark transition">
                  Se souvenir de moi
                </span>
              </label>
              <button
                type="button"
                className="text-primary hover:text-primary-dark font-medium transition"
                onClick={() => toast('Please contact the super administrator')}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              className="shadow-primary hover:shadow-lg transition-all duration-300"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Informations</span>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 border border-primary-100">
            <p className="text-sm text-gray-700 text-center">
              <span className="font-semibold text-dark">🔒 Accès sécurisé</span>
              <br />
              Réservé aux administrateurs uniquement
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600 animate-fade-in">
          <p>
            © 2026 Jadoo Travels. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
