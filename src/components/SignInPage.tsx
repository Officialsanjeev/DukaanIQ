import React, { useState } from 'react';
import { useApp, SEED_USERS } from '../context/AppContext';
import { DukaanIqLogo } from './DukaanIqLogo';
import {
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface SignInPageProps {
  initialMode?: 'signin' | 'signup' | 'forgot';
}

export const SignInPage: React.FC<SignInPageProps> = ({ initialMode = 'signin' }) => {
  const {
    login,
    signup,
    sendPasswordReset,
    loginWithGoogle,
    loginWithDemo,
    setActiveView,
  } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('Apex Tech Store');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  // 1. Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      setActiveView('dashboard');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Email + Password Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'forgot') {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      setIsLoading(true);
      try {
        await sendPasswordReset(email.trim());
        setResetSent(true);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Could not send reset email. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        await login(email.trim(), password);
        setActiveView('dashboard');
      } else {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        await signup(name.trim(), email.trim(), password, businessName);
        setActiveView('dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Instant Demo 1-Click login
  const handleDemoLogin = async (role: 'owner' | 'manager' | 'cashier' = 'cashier') => {
    setIsLoading(true);
    try {
      await loginWithDemo(role);
      setActiveView('dashboard');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Demo access failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F9]  text-[#101828]  flex flex-col justify-between font-sans">
      {/* Top Navbar */}
      <nav className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-[#E8EBF2]  bg-white ">
        <div onClick={() => setActiveView('home')} className="cursor-pointer">
          <DukaanIqLogo size="sm" />
        </div>
        <button
          onClick={() => setActiveView('home')}
          className="h-9 px-3.5 bg-[#F2F4F7]  hover:bg-[#E8EBF2] text-[#101828]  text-xs font-semibold rounded-[10px] flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </nav>

      {/* Main Form Center Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-white  border border-[#E8EBF2]  rounded-[16px] shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-[#101828] ">
              {mode === 'signin'
                ? 'Sign in to your shop'
                : mode === 'signup'
                ? 'Create retail account'
                : 'Reset your password'}
            </h1>
            <p className="text-xs text-[#667085] ">
              {mode === 'signin'
                ? 'Welcome back! Enter your details to access DukaanIQ.'
                : mode === 'signup'
                ? 'Get started with fast billing, GST invoices, and stock tracking.'
                : 'Enter your email and we will send a password reset link.'}
            </p>
          </div>

          {/* Mode Switch Tabs (Sign In / Sign Up) */}
          {mode !== 'forgot' && (
            <div className="flex rounded-[10px] bg-[#F2F4F7]  p-1 border border-[#E8EBF2] ">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-[8px] transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white  text-[#2563EB] shadow-xs'
                    : 'text-[#667085]  hover:text-[#101828]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-[8px] transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white  text-[#2563EB] shadow-xs'
                    : 'text-[#667085]  hover:text-[#101828]'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-[#FDECEC] border border-[#E5484D]/30 text-[#E5484D] rounded-[10px] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Reset Sent Message */}
          {resetSent && (
            <div className="p-3.5 bg-[#E6F6EC] border border-[#12A150]/30 text-[#12A150] rounded-[10px] text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Password Reset Email Sent</span>
              </div>
              <p className="text-[11px] text-[#12A150]/90">
                We sent a password reset link to <span className="font-semibold">{email}</span>. Please check your inbox.
              </p>
            </div>
          )}

          {/* 1. Google Sign In Button */}
          {mode !== 'forgot' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-[40px] bg-white  border border-[#E4E7EC]  hover:bg-[#F9FAFB] active:bg-[#F2F4F7] text-[#101828]  text-xs font-semibold rounded-[10px] flex items-center justify-center gap-3 cursor-pointer shadow-xs transition-colors focus:outline-hidden focus:ring-3 focus:ring-[#93B4FA]"
              >
                {/* Official Google G SVG logo */}
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.347 2.825.957 4.039l3.007-2.332z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#E8EBF2] " />
                <span className="text-[11px] text-[#98A2B3] uppercase font-medium">
                  or email and password
                </span>
                <div className="flex-1 h-px bg-[#E8EBF2] " />
              </div>
            </div>
          )}

          {/* 2. Email + Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block font-semibold text-[#101828]  mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sanjeev Singh"
                      className="w-full h-10 pl-9 pr-3 bg-[#F9FAFB]  border border-[#E8EBF2]  rounded-[10px] text-xs text-[#101828]  placeholder-[#98A2B3] focus:bg-white  focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#93B4FA]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#101828]  mb-1">
                    Store / Shop Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Delhi Flagship Store"
                      className="w-full h-10 pl-9 pr-3 bg-[#F9FAFB]  border border-[#E8EBF2]  rounded-[10px] text-xs text-[#101828]  placeholder-[#98A2B3] focus:bg-white  focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#93B4FA]/40"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold text-[#101828]  mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@store.in"
                  className="w-full h-10 pl-9 pr-3 bg-[#F9FAFB]  border border-[#E8EBF2]  rounded-[10px] text-xs text-[#101828]  placeholder-[#98A2B3] focus:bg-white  focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#93B4FA]/40"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#101828] ">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg(null);
                      }}
                      className="text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full h-10 pl-9 pr-10 bg-[#F9FAFB]  border border-[#E8EBF2]  rounded-[10px] text-xs text-[#101828]  placeholder-[#98A2B3] focus:bg-white  focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#93B4FA]/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#101828] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[40px] bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] active:scale-[0.98] disabled:opacity-50 text-white font-medium text-xs rounded-[10px] flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all focus:outline-hidden focus:ring-3 focus:ring-[#93B4FA]"
            >
              <span>
                {isLoading
                  ? 'Please wait...'
                  : mode === 'signin'
                  ? 'Sign In to Dashboard'
                  : mode === 'signup'
                  ? 'Create Retail Account'
                  : 'Send Reset Link'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setResetSent(false);
                  setErrorMsg(null);
                }}
                className="w-full py-2 text-center text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
              >
                Back to Sign In
              </button>
            )}
          </form>

          {/* Small "Try Demo" Option at Bottom */}
          <div className="pt-3 border-t border-[#E8EBF2] ">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#667085] ">
                Need to explore first?
              </span>
              <button
                type="button"
                onClick={() => setDemoOpen(!demoOpen)}
                className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                {demoOpen ? 'Hide Demo' : 'Try Demo Roles (1-Click)'}
              </button>
            </div>

            {demoOpen && (
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {SEED_USERS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleDemoLogin(u.role)}
                    className="p-2 rounded-[8px] bg-[#F9FAFB]  border border-[#E8EBF2]  hover:border-[#2563EB] text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-[11px] font-bold text-[#101828]  group-hover:text-[#2563EB] truncate">
                      {u.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-[#667085]  capitalize">
                      {u.role}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#667085]  border-t border-[#E8EBF2] ">
        © 2026 DukaanIQ Retail India. All store data stays safe in your account.
      </footer>
    </div>
  );
};
