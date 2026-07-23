import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login, authService } from '../../services/api';
import NavBar from '../organs/NavBar';
import Footer from '../organs/Footer';
import toast from 'react-hot-toast';
import { Fade, Slide } from "react-awesome-reveal";
import { User, Eye, EyeSlash, SignIn } from '@phosphor-icons/react';
import bgImage from "../../assets/HeroVector.png";

const TravelerLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('errors.requiredField')); // Utilise la clé d'erreur de ton JSON
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password);
      authService.setToken(data.token);
      authService.setUser(data.user);
      toast.success(t('auth.loginSuccess'));
      
      const route = data.user.role === 'admin' ? '/admin-dashboard' 
                  : data.user.role === 'agence' ? '/agency-dashboard' 
                  : '/traveler-dashboard';
      
      setTimeout(() => navigate(route), 400);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-color2 transition-all bg-gray-50/50 text-sm";

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      {/* NavBar Fixe */}
      <div className="fixed top-0 w-full z-50 bg-white shadow-sm">
        <NavBar />
      </div>

      {/* Fond vectoriel */}
      <img 
        className="h-[70%] w-[50%] lg:h-[85%] lg:w-[45%] absolute right-0 top-0 -z-10 object-cover opacity-60" 
        src={bgImage} 
        alt="" 
      />

      <main className="flex-1 flex items-center justify-center px-4 pt-32 pb-12">
        <div className="w-full max-w-md">
          <Fade triggerOnce direction="up">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-gray-100">
              
              {/* Header - Individu droit et textes traduits */}
              <div className="text-center mb-8">
                <div className="relative inline-flex mb-4">
                  <div className="absolute inset-0 rounded-2xl bg-color1 opacity-20 animate-ping"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-color1 to-color2 rounded-2xl flex items-center justify-center shadow-lg">
                    <User size={32} weight="fill" className="text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-color3">
                  {t('nav.login')}
                </h1>
                <p className="text-gray-500 mt-2 text-sm italic">
                  {t('hero.subtitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Slide direction="up" triggerOnce cascade damping={0.1}>
                  
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">
                      {t('auth.email')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="exemple@email.com" 
                      className={inputClass}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-sm font-semibold text-gray-700">
                        {t('auth.password')}
                      </label>
                      <button type="button" className="text-xs text-color2 hover:underline">
                        {t('auth.forgotPassword')}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={inputClass}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-color1 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeSlash size={22} /> : <Eye size={22} />}
                      </button>
                    </div>
                  </div>

                  {/* Bouton de connexion */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-color2 hover:bg-color3 text-white py-4 rounded-2xl font-bold shadow-lg shadow-color2/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 flex items-center justify-center gap-3 mt-4"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        <span>{t('common.loading')}</span>
                      </div>
                    ) : (
                      <>
                        <span>{t('auth.loginButton')}</span>
                        <SignIn size={22} weight="bold" />
                      </>
                    )}
                  </button>
                </Slide>
              </form>

              {/* Pied de carte */}
              <div className="mt-8 text-center border-t border-gray-100 pt-6">
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">
                  {t('footer.company')} - {t('footer.tagline')}
                </p>
              </div>

            </div>
          </Fade>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TravelerLogin;