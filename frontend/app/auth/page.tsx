
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Loader2, PlayCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/utils/supabase';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                // --- LOGIN ---
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });

                if (signInError) throw signInError;

                // Redirect to Dashboard on success (AuthContext will pick up session change)
                router.push('/dashboard');
                router.refresh();

            } else {
                // --- SIGNUP ---
                const { error: signUpError, data } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                        },
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (signUpError) throw signUpError;

                if (data.user && data.session) {
                    // Auto login if email confirmation is disabled
                    setMessage('Account created successfully! Redirecting...');
                    setTimeout(() => {
                        router.push('/dashboard');
                        router.refresh();
                    }, 1000);
                } else if (data.user && !data.session) {
                    // If email confirmation is enabled
                    setMessage('Account created! Please check your email to confirm your account before logging in.');
                    setFormData({ ...formData, password: '' });
                }
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            // Helpful error messages
            if (err.message.includes('Invalid login credentials')) {
                setError('Invalid email or password. Please try again.');
            } else if (err.message.includes('User already registered')) {
                setError('This email is already registered. Please sign in instead.');
            } else {
                setError(err.message || 'An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 relative overflow-hidden bg-slate-50">

            {/* Background Decor */}
            <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8 animate-fade-in relative z-10">

                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
                        <PlayCircle size={24} fill="currentColor" className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        {isLogin ? 'Welcome Back' : 'Join OpenConnect'}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {isLogin ? 'Sign in to access your dashboard' : 'Start your innovation journey today'}
                    </p>
                </div>

                {/* Auth Toggle Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Global Messages */}
                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-start gap-2 animate-fade-in">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0"></div>
                        <span>{error}</span>
                    </div>
                )}

                {message && (
                    <div className="mb-6 p-3 bg-green-50 border border-green-100 text-green-700 text-xs rounded-lg flex items-start gap-2 animate-fade-in">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0"></div>
                        <span>{message}</span>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                    {/* Full Name Field (Signup Only) */}
                    {!isLogin && (
                        <div className="space-y-1.5 animate-fade-in">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    required={!isLogin}
                                    placeholder="John Doe"
                                    className="saas-input pl-10"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="email"
                                required
                                placeholder="name@example.com"
                                className="saas-input pl-10"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                className="saas-input pl-10 pr-10"
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {!isLogin && (
                            <p className="text-[10px] text-slate-400 mt-1">Must be at least 6 characters long.</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed group transition-all"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-slate-400">
                    By continuing, you agree to our <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
                </div>
            </div>
        </div>
    );
}
