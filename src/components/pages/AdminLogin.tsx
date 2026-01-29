// src/components/pages/AdminLogin.tsx
import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeSlash, SignIn } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { login, authService } from "../../services/api";
import { Image } from "../atoms/Image";
import Logo from "../../assets/logo3.jpg";

interface LoginFormData {
  email: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      
      if (response.success) {
        // Store token and user data
        authService.setToken(response.data.token);
        authService.setUser(response.data.user);

        toast.success("Login successful!");

        // Check if there's a pending booking to resume
        const pendingBooking = sessionStorage.getItem('pending_booking');
        if (pendingBooking) {
          // Clear the pending booking
          sessionStorage.removeItem('pending_booking');
          // Redirect back to payment page
          toast.success("Reprise de votre réservation...");
          setTimeout(() => {
            navigate("/payment", { 
              state: JSON.parse(pendingBooking)
            });
          }, 1000);
          return;
        }

        // Redirect based on role
        if (response.data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/traveler/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            image={Logo}
            alt="Jadoo Travels"
            className="w-24 h-24 object-contain"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h1>
          <p className="text-gray-600">Welcome back! Please login to your account.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Logging in...</span>
            ) : (
              <>
                <SignIn size={20} weight="bold" />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Test Credentials Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-semibold mb-2">Test Credentials:</p>
          <p className="text-xs text-blue-700">Email: admin@jadoo.com</p>
          <p className="text-xs text-blue-700">Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
