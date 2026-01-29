// src/components/pages/Signup.tsx
import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeSlash, UserPlus } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { register, authService } from "../../services/api";
import { Image } from "../atoms/Image";
import Logo from "../../assets/logo3.jpg";

interface FormData {
  name: string;
  first_name: string;
  email: string;
  phone: string;
  cni_number: string;
  civility: string;
  gender: string;
  password: string;
  password_confirmation: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    first_name: "",
    email: "",
    phone: "",
    cni_number: "",
    civility: "",
    gender: "",
    password: "",
    password_confirmation: ""
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.first_name || !formData.email || !formData.password) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);

    try {
      const response = await register(formData);

      if (response.success) {
        toast.success(response.message);
        
        // Check if there's a pending booking to resume
        const pendingBooking = sessionStorage.getItem('pending_booking');
        if (pendingBooking) {
          // After successful registration, user needs to login to continue
          toast.info("Veuillez vous connecter pour continuer votre réservation");
          setTimeout(() => {
            navigate('/admin/login');
          }, 1500);
        } else {
          setTimeout(() => {
            navigate('/admin/login');
          }, 1000);
        }
      } else {
        toast.error(response.message || "Erreur lors de l'inscription");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
        {/* Logo et titre */}
        <div className="text-center">
          <Image 
            as="a" 
            href="/" 
            className="h-16 mx-auto mb-4" 
            image={Logo} 
            alt="Logo KCTRIP" 
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Créer un compte
          </h2>
          <p className="text-sm text-gray-600">
            Rejoignez KCTRIP pour réserver vos voyages facilement
          </p>
        </div>

        {/* Formulaire */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150"
                placeholder="Doe"
              />
            </div>

            {/* Prénom */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150"
                placeholder="John"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150"
                placeholder="john.doe@email.com"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150"
                placeholder="+237 6XX XX XX XX"
              />
            </div>

            {/* Civilité */}
            <div>
              <label htmlFor="civility" className="block text-sm font-medium text-gray-700 mb-1">
                Civilité
              </label>
              <select
                id="civility"
                name="civility"
                value={formData.civility}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150"
              >
                <option value="">Sélectionner</option>
                <option value="Mr">M.</option>
                <option value="Mrs">Mme</option>
                <option value="Miss">Mlle</option>
              </select>
            </div>

            {/* Genre */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Genre
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150"
              >
                <option value="">Sélectionner</option>
                <option value="Male">Homme</option>
                <option value="Female">Femme</option>
              </select>
            </div>

            {/* CNI */}
            <div className="md:col-span-2">
              <label htmlFor="cni_number" className="block text-sm font-medium text-gray-700 mb-1">
                Numéro CNI
              </label>
              <input
                id="cni_number"
                name="cni_number"
                type="text"
                value={formData.cni_number}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150"
                placeholder="Numéro de carte d'identité"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150"
                  placeholder="Min. 8 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150"
                  placeholder="Confirmer le mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            <UserPlus size={20} className="mr-2" weight="bold" />
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </form>

        {/* Login link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{" "}
            <Link
              to="/admin/login"
              className="font-medium text-orange-500 hover:text-orange-600"
            >
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;