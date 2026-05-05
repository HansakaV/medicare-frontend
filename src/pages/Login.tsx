import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Mail, Lock, AlertCircle, User, Plus, Stethoscope, Activity, Heart } from 'lucide-react';
import anime from 'animejs';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent } from '../components/Card';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'receptionist'>('receptionist');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  
  const cardRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    // Entrance Animation
    anime.timeline({ easing: 'easeOutExpo' })
      .add({
        targets: logoRef.current,
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 1000,
        delay: 100
      })
      .add({
        targets: textRef.current,
        translateY: [15, 0],
        opacity: [0, 1],
        duration: 800
      }, '-=700')
      .add({
        targets: cardRef.current,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 1000
      }, '-=700');

    // Floating Background Elements Animation
    anime({
      targets: '.bg-element',
      translateY: () => anime.random(-15, 15),
      translateX: () => anime.random(-15, 15),
      rotate: () => anime.random(-10, 10),
      duration: () => anime.random(4000, 6000),
      delay: () => anime.random(0, 500),
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        const data = await authService.login({ email, password });
        loginStore(data.data, data.token);
      } else {
        const data = await authService.register({ name, email, password, role });
        loginStore(data.data, data.token);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || `Invalid ${isLogin ? 'email or password' : 'registration details'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuth = () => {
    anime({
      targets: cardRef.current,
      opacity: [1, 0, 1],
      scale: [1, 0.98, 1],
      duration: 500,
      easing: 'easeInOutQuad',
      changeBegin: () => {
        setTimeout(() => {
          setIsLogin(!isLogin);
          setError('');
        }, 250);
      }
    });
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements - Subtler for light theme */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08]">
        {[...Array(10)].map((_, i) => {
          const Icons = [Plus, Heart, Activity, Stethoscope, Pill];
          const Icon = Icons[i % Icons.length];
          return (
            <div 
              key={i}
              className="bg-element absolute"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                color: i % 2 === 0 ? '#059669' : '#2563eb'
              }}
            >
              <Icon size={anime.random(32, 72)} strokeWidth={1.5} />
            </div>
          );
        })}
      </div>

      {/* Background Gradient Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/30 blur-[100px] rounded-full -z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[100px] rounded-full -z-0" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[380px] flex flex-col items-center">
        <div ref={logoRef} className="mb-4 flex flex-col items-center">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 mb-3 transform hover:rotate-6 transition-transform duration-300">
            <Pill className="h-8 w-8" />
          </div>
          <div ref={textRef} className="text-center">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              Medicare<span className="text-emerald-600">Pro</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[8px] mt-1">
              Medical Center Management
            </p>
          </div>
        </div>

        <div ref={cardRef} className="w-full">
          <Card className="bg-white/80 backdrop-blur-lg border-slate-200 shadow-2xl shadow-slate-200/50">
            <CardContent className="p-6 md:p-8">
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {isLogin ? 'Welcome Back' : 'Get Started'}
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  {isLogin ? 'Sign in to access your dashboard' : 'Create an account to manage clinic'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-xs border border-red-100 animate-pulse">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="font-semibold">{error}</span>
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      type="text"
                      icon={<User className="h-3.5 w-3.5 text-emerald-500" />}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-10 bg-slate-50/50"
                    />
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Type</label>
                      <select 
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'admin' | 'receptionist')}
                        className="w-full h-10 bg-slate-50/50 border border-slate-200 rounded-xl px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                      >
                        <option value="receptionist">Receptionist</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>
                )}

                <Input
                  label="Email Address"
                  placeholder="admin@medicare.com"
                  type="email"
                  icon={<Mail className="h-3.5 w-3.5 text-emerald-500" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 bg-slate-50/50"
                />

                <Input
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  icon={<Lock className="h-3.5 w-3.5 text-emerald-500" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 bg-slate-50/50"
                />

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-[0.98] transition-transform rounded-xl mt-2"
                  isLoading={isLoading}
                >
                  {isLogin ? 'SIGN IN' : 'REGISTER'}
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <button 
                  onClick={toggleAuth}
                  className="text-slate-500 font-bold hover:text-emerald-600 transition-colors text-[10px] uppercase tracking-widest"
                >
                  {isLogin ? (
                    <>New here? <span className="text-emerald-600">Create Account</span></>
                  ) : (
                    <>Member? <span className="text-emerald-600">Sign In instead</span></>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="mt-6 text-slate-400 text-[8px] font-bold uppercase tracking-[0.3em] opacity-60">
          © 2026 Medicare Pro • Smart Health
        </p>
      </div>
    </div>
  );
};



