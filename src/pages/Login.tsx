import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Mail, Lock, AlertCircle, User } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Logging details as requested
    console.log(`[AUTH] Attempting ${isLogin ? 'Login' : 'Signup'}:`, {
      email,
      name: isLogin ? 'N/A' : name,
      role: isLogin ? 'N/A' : role,
      timestamp: new Date().toISOString()
    });

    try {
      if (isLogin) {
        const data = await authService.login({ email, password });
        console.log('[AUTH] Login successful:', data.data);
        loginStore(data.data, data.token);
      } else {
        const data = await authService.register({ name, email, password, role });
        console.log('[AUTH] Registration successful:', data.data);
        loginStore(data.data, data.token);
      }
      navigate('/');
    } catch (err: any) {
      console.error('[AUTH] Error:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || `Invalid ${isLogin ? 'email or password' : 'registration details'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 blur-[120px] rounded-full" />
      </div>

      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-emerald-200/50 mb-4 transform hover:rotate-12 transition-transform cursor-pointer">
          <Pill className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Medicare<span className="text-emerald-600">Pro</span></h1>
        <p className="text-slate-400 mt-1 font-medium uppercase tracking-widest text-[10px]">Medical Management System</p>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 ring-1 ring-slate-200/50">
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-slate-500 text-sm mt-1">
              {isLogin ? 'Please enter your details to sign in' : 'Register to start managing your clinic'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm border border-red-100 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  type="text"
                  icon={<User className="h-4 w-4" />}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-slate-50/50"
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Account Type</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'receptionist')}
                    className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    <option value="receptionist">Receptionist (Standard Access)</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>
              </div>
            )}

            <Input
              label="Email Address"
              placeholder="admin@medicare.com"
              type="email"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-50/50"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-50/50"
            />

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold shadow-lg shadow-emerald-200/50"
              isLoading={isLoading}
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-slate-500 font-medium hover:text-emerald-600 transition-colors text-sm"
            >
              {isLogin ? (
                <>Don't have an account? <span className="text-emerald-600 font-bold">Sign Up</span></>
              ) : (
                <>Already have an account? <span className="text-emerald-600 font-bold">Sign In</span></>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      
      <p className="mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        © 2026 Medicare Pro Center • Health Systems
      </p>
    </div>
  );
};

