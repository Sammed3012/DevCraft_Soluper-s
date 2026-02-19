
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Lightbulb, TrendingUp, Users } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;
  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-white pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
        <div className="container relative z-10 px-4 mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Beta Access Open</span>
          </div>

          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-7xl">
            Build the future with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">OpenConnect</span>
          </h1>

          <p className="mb-10 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            The premier platform for innovators to showcase projects, find collaborators, and accelerate growth. Join thousands of builders today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              Get Started Free <ArrowRight size={20} />
            </Link>
            <Link href="/demos" className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm transition-all hover:border-slate-300 flex items-center justify-center gap-2">
              Watch a Demo
            </Link>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full bg-slate-50 py-24 border-t border-slate-200">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to ship</h2>
            <p className="text-slate-500 text-lg">Powerful tools to manage your projects, skills, and collaborations all in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Lightbulb size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Project Showcase</h3>
              <p className="text-slate-500 leading-relaxed">Share your ideas with a global community. Get feedback, upvotes, and traction from day one.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Find Collaborators</h3>
              <p className="text-slate-500 leading-relaxed">Connect with skilled developers, designers, and creators who share your vision.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Skill Growth</h3>
              <p className="text-slate-500 leading-relaxed">Track your skills, get AI-powered recommendations, and level up your career.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 bg-white relative overflow-hidden">
        <div className="container px-4 mx-auto text-center relative z-10">
          <div className="bg-blue-600 rounded-3xl p-12 md:p-16 text-white shadow-2xl shadow-blue-200 max-w-5xl mx-auto overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to start building?</h2>
              <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">Join OpenConnect today and turn your ideas into reality. It&apos;s free to get started.</p>
              <Link href="/auth" className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-all transform hover:scale-105 active:scale-95">
                Create a Free Account
              </Link>
            </div>

            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
