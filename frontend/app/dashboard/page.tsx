
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Zap, Cloud, Code } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [ideas, setIdeas] = useState<any[]>([]); // Placeholder for ideas data

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        } else {
            // Fetch ideas here
            // For now, mock
            setIdeas([
                { id: 1, title: 'AI Code Assistant', description: 'A VS Code extension that uses Gemini to write code.' },
                { id: 2, title: 'Sustainable Garden API', description: 'Public API for plant care data.' },
            ]);
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.user_metadata?.full_name || 'Innovator'}!</h1>
                    <p className="text-slate-500 mt-1">Here's what's happening with your projects.</p>
                </div>
                <Link href="/create-idea" className="btn-primary flex items-center gap-2 self-start md:self-auto">
                    <Zap size={18} />
                    <span>New Project</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Cloud size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900">{ideas.length}</h3>
                        <p className="text-sm text-slate-500">Active Projects</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Code size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900">12</h3>
                        <p className="text-sm text-slate-500">Contributions</p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-4">Your Recent Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map((idea) => (
                    <div key={idea.id} className="saas-card p-5 hover:shadow-md cursor-pointer transition-all">
                        <h3 className="font-bold text-lg text-slate-900 mb-2">{idea.title}</h3>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{idea.description}</p>
                        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                            <span>Last updated 2 days ago</span>
                            <span className="font-bold text-blue-600">View Details &rarr;</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
