
'use client';

import Link from 'next/link';
import { User, LogOut, Menu, X, LayoutDashboard, Flag, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase'; // Direct import avoiding context for simplicity in this component if desired, but context is better.
// Assuming AuthContext is available based on previous step
import { Session } from '@supabase/supabase-js';

const Header = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/auth';
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 transition-transform group-hover:scale-105">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <span className="tracking-tight">OpenConnect</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                    <Link href="/dashboard" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        <LayoutDashboard size={16} />
                        Dashboard
                    </Link>
                    <Link href="/demos" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        <Flag size={16} />
                        Demos
                    </Link>
                    <Link href="/skills" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        <Zap size={16} />
                        Skills
                    </Link>
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    {session ? (
                        <>
                            <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-50">
                                <div className="bg-slate-100 p-1.5 rounded-full">
                                    <User size={16} />
                                </div>
                                <span>Profile</span>
                            </Link>
                            <button onClick={handleSignOut} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-all active:scale-95">
                                <LogOut size={16} />
                                <span>Sign Out</span>
                            </button>
                        </>
                    ) : (
                        <Link href="/auth" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95 transform">
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden p-2 text-slate-600 hover:text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 shadow-xl absolute w-full left-0 top-16 flex flex-col gap-2 z-40 animate-fade-in-down">
                    <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                        <LayoutDashboard size={18} />
                        Dashboard
                    </Link>
                    <Link href="/demos" className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                        <Flag size={18} />
                        Demos
                    </Link>
                    <Link href="/skills" className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                        <Zap size={18} />
                        Skills
                    </Link>
                    <div className="h-px bg-slate-100 my-2"></div>
                    {session ? (
                        <>
                            <Link href="/profile" className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                <User size={18} />
                                Profile
                            </Link>
                            <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="flex w-full items-center gap-3 p-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                <LogOut size={18} />
                                <span>Sign Out</span>
                            </button>
                        </>
                    ) : (
                        <Link href="/auth" className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-md" onClick={() => setIsMenuOpen(false)}>
                            Sign In
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
