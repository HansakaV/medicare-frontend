import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pill,
  Mail,
  Lock,
  AlertCircle,
  User,
  Plus,
  Stethoscope,
  Activity,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import anime from "animejs";
import { useAuthStore } from "../store/useAuthStore";
import { authService } from "../services/authService";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useToast } from "../components/Toast";

export const Login = () => {
  const { showToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "receptionist">("receptionist");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const formRef = useRef(null);
  const infoRef = useRef(null);
  const charRef = useRef(null);

  useEffect(() => {
    // Entrance Animation for the whole screen
    anime
      .timeline({ easing: "easeOutExpo" })
      .add({
        targets: infoRef.current,
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 1000,
      })
      .add(
        {
          targets: formRef.current,
          translateX: [50, 0],
          opacity: [0, 1],
          duration: 1000,
        },
        "-=800",
      );

    // Custom Character Animation
    // 1. Blinking Eyes
    anime({
      targets: ".char-eye",
      scaleY: [1, 0, 1],
      duration: 200,
      delay: () => anime.random(2000, 4000),
      loop: true,
      easing: "easeInOutSine",
    });

    // 2. Pulsing Heart
    anime({
      targets: ".char-heart",
      scale: [1, 1.2, 1],
      opacity: [0.8, 1, 0.8],
      duration: 1000,
      loop: true,
      easing: "easeInOutQuad",
    });

    // 3. Floating Bubbles
    anime({
      targets: ".char-bubble",
      translateY: [0, -20],
      opacity: [0.4, 0.8, 0.4],
      duration: () => anime.random(2000, 4000),
      delay: () => anime.random(0, 2000),
      loop: true,
      direction: "alternate",
      easing: "easeInOutSine",
    });
  }, []);

  // Custom SVG Medical Character Component (Resized to fit perfectly)
  const MedicalCharacter = () => (
    <svg viewBox="0 0 400 400" className="w-full h-full max-w-[220px]">
      {/* Background Circle */}
      <circle cx="200" cy="200" r="160" fill="#f0fdf4" />
      
      {/* Body */}
      <path d="M120 380 Q200 340 280 380 L280 400 L120 400 Z" fill="#e2e8f0" />
      <path
        d="M140 280 Q200 240 260 280 L280 380 Q200 350 120 380 Z"
        fill="#ffffff"
        stroke="#e2e8f0"
        strokeWidth="2"
      />
      
      {/* Stethoscope */}
      <path
        d="M160 230 Q160 270 200 270 Q240 270 240 230"
        fill="none"
        stroke="#64748b"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="200" cy="285" r="12" fill="#94a3b8" />
      
      {/* Head */}
      <circle cx="200" cy="180" r="65" fill="#fecaca" />
      <path d="M135 180 Q135 110 200 110 Q265 110 265 180" fill="#475569" />
      
      {/* Face Details */}
      <circle className="char-eye" cx="175" cy="185" r="5" fill="#1e293b" />
      <circle className="char-eye" cx="225" cy="185" r="5" fill="#1e293b" />
      <path
        d="M185 215 Q200 225 215 215"
        fill="none"
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Pulsing Heart Icon */}
      <g className="char-heart" style={{ transformOrigin: "280px 150px" }}>
        <path
          d="M280 140 Q280 130 290 130 Q300 130 300 140 Q300 155 280 170 Q260 155 260 140 Q260 130 270 130 Q280 130 280 140"
          fill="#ef4444"
        />
      </g>
      
      {/* Floating Medical Bubbles */}
      <circle className="char-bubble" cx="100" cy="150" r="15" fill="#10b981" />
      <circle className="char-bubble" cx="300" cy="220" r="10" fill="#3b82f6" />
      <circle className="char-bubble" cx="80" cy="250" r="8" fill="#f59e0b" />
    </svg>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        const data = await authService.login({ email, password });
        loginStore(data.data, data.token);
        showToast(`Welcome back, ${data.data.name}!`, "success");
      } else {
        const data = await authService.register({
          name,
          email,
          password,
          role,
        });
        loginStore(data.data, data.token);
        showToast("Account created successfully!", "success");
      }
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.message || `Invalid ${isLogin ? "email or password" : "registration details"}`;
      setError(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuth = () => {
    anime({
      targets: formRef.current,
      opacity: [1, 0, 1],
      translateY: [0, 5, 0],
      duration: 400,
      easing: "easeInOutQuad",
      changeBegin: () => {
        setTimeout(() => {
          setIsLogin(!isLogin);
          setError("");
        }, 200);
      },
    });
  };

  return (
    <div className="h-screen w-full bg-white flex overflow-hidden font-sans relative">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
        {[...Array(6)].map((_, i) => {
          const Icons = [Plus, Activity, Stethoscope, Pill];
          const Icon = Icons[i % Icons.length];
          return (
            <div
              key={i}
              className="bg-element absolute"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                color: "#059669",
              }}
            >
              <Icon size={anime.random(40, 80)} strokeWidth={1} />
            </div>
          );
        })}
      </div>

      {/* Left Side: Illustration & Branding (Hidden on mobile) */}
      <div
        ref={infoRef}
        className="hidden lg:flex flex-[1.2] bg-slate-50 relative flex-col items-center justify-between py-12 px-8 xl:px-16 overflow-hidden border-r border-slate-100"
      >
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-emerald-100/40 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-100/40 blur-[100px] rounded-full" />

        <div className="relative z-10 max-w-lg w-full flex flex-col items-start my-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Pill className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              Medicare<span className="text-emerald-600">Pro</span>
            </h2>
          </div>

          <h1 className="text-3xl xl:text-4xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
            Managing your clinic is <br />
            <span className="text-emerald-600">now easier</span> than ever.
          </h1>

          <p className="text-slate-500 text-base mb-10 leading-relaxed font-medium max-w-md">
            The all-in-one healthcare management solution for modern medical
            centers. Secure, fast, and reliable.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            {[
              {
                icon: <CheckCircle2 className="text-emerald-500 h-4 w-4" />,
                text: "Real-time Queue",
              },
              {
                icon: <CheckCircle2 className="text-emerald-500 h-4 w-4" />,
                text: "Smart Inventory",
              },
              {
                icon: <CheckCircle2 className="text-emerald-500 h-4 w-4" />,
                text: "Automated Billing",
              },
              {
                icon: <CheckCircle2 className="text-emerald-500 h-4 w-4" />,
                text: "Patient History",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs font-bold text-slate-700"
              >
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Custom Medical Character Animation (No external assets needed) */}
          <div
            ref={charRef}
            className="w-full flex items-center justify-center mt-6"
          >
            <MedicalCharacter />
          </div>
        </div>

        <p className="relative z-10 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
          Powered by Medicare Pro Smart Health
        </p>
      </div>

      {/* Right Side: Login Form */}
      <div
        ref={formRef}
        className="flex-1 flex items-center justify-center p-6 bg-white z-10 overflow-y-auto"
      >
        <div className="w-full max-w-[360px] py-8">
          {/* Back to Home Button */}
          <button 
            onClick={() => navigate('/')}
            className="mb-8 flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-colors group"
          >
            <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <div className="lg:hidden flex flex-col items-center mb-6">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white mb-2">
              <Pill className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight text-center">
              Medicare<span className="text-emerald-600">Pro</span>
            </h2>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl xl:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {isLogin ? "Sign In" : "Create Account"}
            </h2>
            <p className="text-slate-500 text-xs xl:text-sm mt-2 font-medium">
              {isLogin
                ? "Welcome back! Please enter your credentials."
                : "Join MedicarePro and start managing your center today."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-2xl flex items-center gap-2 text-xs border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-bold">{error}</span>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-400">
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  type="text"
                  icon={<User className="h-4 w-4 text-emerald-500" />}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11 bg-slate-50/50 border-slate-200 text-sm"
                />
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Account Type
                  </label>
                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "admin" | "receptionist")
                    }
                    className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-2xl px-4 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer appearance-none"
                  >
                    <option value="receptionist">
                      Receptionist (Standard)
                    </option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>
              </div>
            )}

            <Input
              label="Email Address"
              placeholder="e.g. admin@medicare.com"
              type="email"
              icon={<Mail className="h-4 w-4 text-emerald-500" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 bg-slate-50/50 border-slate-200 text-sm"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              icon={<Lock className="h-4 w-4 text-emerald-500" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 bg-slate-50/50 border-slate-200 text-sm"
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-12 text-sm font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100 active:scale-[0.98] transition-transform rounded-2xl"
                isLoading={isLoading}
              >
                {isLogin ? "CONTINUE TO DASHBOARD" : "CREATE MY ACCOUNT"}
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={toggleAuth}
              className="text-slate-500 font-bold hover:text-emerald-600 transition-colors text-[10px] uppercase tracking-widest flex flex-col items-center gap-1 mx-auto"
            >
              <span className="opacity-60">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </span>
              <span className="text-emerald-600 text-[12px] font-black">
                {isLogin ? "REGISTER NOW" : "LOG IN INSTEAD"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
