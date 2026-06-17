import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { BarChart3, Lock, Mail, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const autoFill = (role: "admin" | "user") => {
    setEmail(`${role}@businessanalytics.com`);
    setPassword(`${role}123`);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#0a0a0a]">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#a0aecd]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      {/* Left Section - Hero */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 lg:p-16 relative z-10 border-r border-white/5 bg-white/[0.02]">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              <BarChart3 className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl tracking-tight">Business Analytics</h1>
              <p className="text-white/50 text-xs tracking-widest uppercase font-medium mt-1">Enterprise Edition</p>
            </div>
          </div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              Intelligence that <br/>drives <span className="text-[#a0aecd]">growth.</span>
            </h2>
            <p className="text-lg text-white/60 max-w-md font-light leading-relaxed mb-10">
              Access real-time insights, predict future trends, and manage your inventory with our enterprise-grade dashboard.
            </p>
            
            <div className="space-y-5">
              <div className="flex items-center gap-4 text-white/70">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-[#a0aecd]" />
                </div>
                <span className="font-medium">Enterprise-grade security</span>
              </div>
              <div className="flex items-center gap-4 text-white/70">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Zap className="w-5 h-5 text-[#a0aecd]" />
                </div>
                <span className="font-medium">Lightning fast analytics</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-3xl p-8 lg:p-10 rounded-[2rem] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
        >
          <div className="text-center mb-8 lg:hidden">
             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          </div>

          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h2>
            <p className="text-white/50 font-medium text-sm">Please sign in to your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#a0aecd]/50 transition-all font-medium"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#a0aecd]/50 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400 font-medium text-center">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-white text-[#0a0a0a] rounded-xl font-bold text-sm tracking-wide hover:bg-[#a0aecd] hover:shadow-[0_0_30px_rgba(160,174,205,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-4"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-4">Quick Testing Credentials</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => autoFill("admin")}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white/80 transition-all"
              >
                Admin Role
              </button>
              <button
                onClick={() => autoFill("user")}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white/80 transition-all"
              >
                User Role
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
