import React, { useState } from 'react';
import { useApp, SEED_USERS } from '../context/AppContext';
import {
  X,
  Lock,
  Mail,
  User,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  KeyRound,
} from 'lucide-react';
import { DukaanIqLogo } from './DukaanIqLogo';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    signup,
    sendPasswordReset,
    loginWithGoogle,
    loginWithDemo,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('Apex Tech Retail');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isAuthModalOpen) return null;

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Forgot password flow
    if (authModalMode === 'forgot_password') {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError('Please enter a valid email address.');
        return;
      }
      setLoading(true);
      try {
        await sendPasswordReset(email.trim());
        setResetSuccess(true);
      } catch (err: any) {
        setError(err?.message || 'Could not send reset email. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Sign In flow
    if (authModalMode === 'login') {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      if (!password) {
        setError('Please enter your account password.');
        return;
      }
      setLoading(true);
      try {
        await login(email.trim(), password);
      } catch (err: any) {
        setError(err?.message || 'Login failed. Please check your email and password.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 3. Sign Up flow
    if (authModalMode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must have at least 6 characters.');
        return;
      }
      setLoading(true);
      try {
        await signup(name.trim(), email.trim(), password, businessName.trim());
      } catch (err: any) {
        setError(err?.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Google Sign In
  const handleGoogleAuth = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in was interrupted. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Try Demo (Restricted)
  const handleTryDemo = async (role: 'owner' | 'manager' | 'cashier' = 'cashier') => {
    setError(null);
    setDemoLoading(true);
    try {
      await loginWithDemo(role);
    } catch (err: any) {
      setError(err?.message || 'Demo access failed. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white  rounded-3xl shadow-2xl border border-slate-200  w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Top Header Branding */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-indigo-50/70 via-white to-teal-50/40    border-b border-slate-200/80  relative">
          <button
            onClick={closeAuthModal}
            aria-label="Close"
            className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700  hover:bg-slate-100  transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <DukaanIqLogo size="md" className="mb-2" />
          
          <h3 className="text-xl font-bold text-slate-900  font-heading">
            {authModalMode === 'login' && 'Sign in to DukaanIQ'}
            {authModalMode === 'signup' && 'Create your Retail Account'}
            {authModalMode === 'forgot_password' && 'Reset your Password'}
          </h3>
          <p className="text-xs text-slate-500  mt-0.5">
            {authModalMode === 'login' && 'Enter your shop credentials to access billing, stock, and reports.'}
            {authModalMode === 'signup' && 'Start managing your retail shop with high-speed POS and GST.'}
            {authModalMode === 'forgot_password' && 'We will send a secure password reset link to your email.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Mode Switch Tabs (Sign In / Sign Up) */}
          {authModalMode !== 'forgot_password' && (
            <div className="grid grid-cols-2 p-1 bg-slate-100  rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  openAuthModal('login');
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  authModalMode === 'login'
                    ? 'bg-white  text-slate-900  shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 '
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  openAuthModal('signup');
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  authModalMode === 'signup'
                    ? 'bg-white  text-slate-900  shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 '
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Try Demo Option Highlighted */}
          {authModalMode !== 'forgot_password' && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50   border border-amber-200/80 ">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-900 ">
                      Try Demo (Instant Access)
                    </span>
                    <span className="text-[10px] bg-amber-200/70  text-amber-900  px-1.5 py-0.2 rounded font-semibold">
                      Restricted
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800/80  mt-0.5 leading-snug">
                    Explore POS counter, stock manager, and GST bills with sample store data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTryDemo('cashier')}
                  disabled={demoLoading}
                  className="shrink-0 px-3 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {demoLoading ? 'Starting...' : 'Try Demo'}
                </button>
              </div>

              {/* Quick role pickers */}
              <div className="mt-2.5 pt-2 border-t border-amber-200/60  flex items-center gap-1.5 text-[11px]">
                <span className="text-amber-800/70  font-medium text-[10px]">Or role:</span>
                <button
                  type="button"
                  onClick={() => handleTryDemo('owner')}
                  className="px-2 py-0.5 rounded-md bg-white/80  hover:bg-white text-amber-900  font-medium text-[10px] border border-amber-200  cursor-pointer"
                >
                  Owner
                </button>
                <button
                  type="button"
                  onClick={() => handleTryDemo('manager')}
                  className="px-2 py-0.5 rounded-md bg-white/80  hover:bg-white text-amber-900  font-medium text-[10px] border border-amber-200  cursor-pointer"
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => handleTryDemo('cashier')}
                  className="px-2 py-0.5 rounded-md bg-white/80  hover:bg-white text-amber-900  font-medium text-[10px] border border-amber-200  cursor-pointer"
                >
                  Cashier
                </button>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          {authModalMode !== 'forgot_password' && (
            <>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading}
                className="w-full h-11 px-4 border border-slate-300  hover:border-slate-400  bg-white  text-slate-800  rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              <div className="flex items-center gap-2 my-1">
                <div className="flex-1 h-px bg-slate-200 " />
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  or email & password
                </span>
                <div className="flex-1 h-px bg-slate-200 " />
              </div>
            </>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 bg-rose-50  border border-rose-200  text-rose-800  rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 " />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {resetSuccess && (
            <div className="p-3.5 bg-emerald-50  border border-emerald-200  text-emerald-900  rounded-xl text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600  shrink-0" />
                <span>Password Reset Email Sent</span>
              </div>
              <p className="text-[11px] text-emerald-800 ">
                We sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
              </p>
              <button
                type="button"
                onClick={() => {
                  setResetSuccess(false);
                  openAuthModal('login');
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700  underline pt-1 cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          )}

          {/* Auth Form */}
          {!resetSuccess && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Full Name & Business Name (Sign Up only) */}
              {authModalMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700  mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sanjeev Singh"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300  rounded-xl bg-slate-50/50  text-slate-900  focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700  mb-1">
                      Store / Shop Name
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Apex Tech Retail"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300  rounded-xl bg-slate-50/50  text-slate-900  focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700  mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@store.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300  rounded-xl bg-slate-50/50  text-slate-900  focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Password Field (Sign In & Sign Up) */}
              {authModalMode !== 'forgot_password' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 ">
                      Password
                    </label>
                    {authModalMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          openAuthModal('forgot_password');
                        }}
                        className="text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]  cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={authModalMode === 'signup' ? 'At least 6 characters' : '••••••••'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-300  rounded-xl bg-slate-50/50  text-slate-900  focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600  cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {authModalMode === 'signup' && (
                    <p className="text-[10px] text-slate-400 mt-1">Must be at least 6 characters</p>
                  )}
                </div>
              )}

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : authModalMode === 'login' ? (
                    <>
                      <span>Sign In with Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : authModalMode === 'signup' ? (
                    <>
                      <span>Create Free Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* Footer Back Link for Forgot Password */}
          {authModalMode === 'forgot_password' && !resetSuccess && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  openAuthModal('login');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600  hover:text-[#2563EB] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          )}

          {/* Bottom Switcher */}
          {authModalMode !== 'forgot_password' && (
            <div className="text-center pt-2 text-xs text-slate-500 ">
              {authModalMode === 'login' ? (
                <span>
                  New to DukaanIQ?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      openAuthModal('signup');
                    }}
                    className="font-bold text-[#2563EB] hover:text-[#1D4ED8]  underline cursor-pointer"
                  >
                    Create Free Account
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      openAuthModal('login');
                    }}
                    className="font-bold text-[#2563EB] hover:text-[#1D4ED8]  underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
