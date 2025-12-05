import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/atoms/Button";
import { Text } from "../../components/atoms/Text";
import { Envelope, Lock, ArrowLeft, ShieldCheck } from "@phosphor-icons/react";
import { Fade } from "react-awesome-reveal";
import toast from "react-hot-toast";
import { loginAdmin } from "../../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    toast.loading("Verifying credentials...");

    try {
      const admin = await loginAdmin(email, password);
      
      toast.dismiss();
      
      if (admin) {
        localStorage.setItem("adminEmail", admin.email);
        toast.success("Login successful! Welcome Admin 🎉");
        
        setTimeout(() => {
          navigate("/admin");
        }, 1000);
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Connection error. Please check if json-server is running.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <Fade>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-gray-200">
          <button
            onClick={() => navigate("/")}
            className="mb-6 text-gray-600 hover:text-color2 transition-all flex items-center gap-2 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-color2 to-color3 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldCheck size={40} weight="duotone" className="text-white" />
            </div>
            <Text as="h1" className="text-3xl font-bold text-gray-800 mb-2">
              Admin Login
            </Text>
            <Text as="p" className="text-gray-600">
              Access your Finexs Voyage dashboard
            </Text>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Envelope size={16} weight="duotone" className="inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-color2 transition-all"
                placeholder="admin@finexs.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Lock size={16} weight="duotone" className="inline mr-1" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-color2 transition-all"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-color2 to-color3 hover:from-color3 hover:to-color2"
              }`}
            >
              {loading ? "Verifying..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <Text as="p" className="text-sm text-gray-700">
              <strong> Test Credentials:</strong>
              <br />
              Email: *******
              <br />
              Password: ********
            </Text>
          </div>

          <div className="mt-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
            <Text as="p" className="text-xs text-gray-700">
               <strong>Note:</strong> ************************
            </Text>
          </div>
        </div>
      </Fade>
    </div>
  );
};

export default Login;