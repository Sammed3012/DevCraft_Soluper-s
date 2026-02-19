
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import { Play, Loader2, Video, Search } from 'lucide-react';

type Demo = {
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    profiles: {
        full_name: string;
        avatar_url: string;
    }
};

export default function DemosPage() {
    const { user, loading } = useAuth();
    const [demos, setDemos] = useState<Demo[]>([]);
    const [fetching, setFetching] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchDemos();
    }, []);

    const fetchDemos = async () => {
        setFetching(true);
        try {
            const { data, error } = await supabase
                .from('demos')
                .select(`
                    id,
                    title,
                    description,
                    video_url,
                    thumbnail_url,
                    profiles:user_id ( full_name, avatar_url )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDemos((data as any) || []);
        } catch (error) {
            console.error('Error fetching demos:', error);
            // Fallback mock data if table doesn't exist yet or is empty
            setDemos([
                {
                    id: '1',
                    title: 'OpenConnect Demo',
                    description: 'A platform connecting developers and innovators.',
                    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Rick Roll as placeholder
                    thumbnail_url: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&q=80&w=300&ixlib=rb-4.0.3',
                    profiles: { full_name: 'Dev Team', avatar_url: '' }
                },
                {
                    id: '2',
                    title: 'AI Portfolio Builder',
                    description: 'Automated portfolio generation using GPT-4.',
                    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                    thumbnail_url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=300&ixlib=rb-4.0.3',
                    profiles: { full_name: 'Sarah Smith', avatar_url: '' }
                }
            ]);
        } finally {
            setFetching(false);
        }
    };

    const filteredDemos = demos.filter(demo =>
        demo.title.toLowerCase().includes(search.toLowerCase()) ||
        demo.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Play className="text-red-500 fill-current" />
                        Watch Demos
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">See what the community is building.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                        type="search"
                        placeholder="Search demos..."
                        className="saas-input pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {fetching ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDemos.map(demo => (
                        <div key={demo.id} className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                            <div className="relative aspect-video bg-slate-100 overflow-hidden">
                                <img
                                    src={demo.thumbnail_url || 'https://via.placeholder.com/300x200?text=No+Thumbnail'}
                                    alt={demo.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-all duration-300">
                                        <Play className="text-slate-900 fill-current ml-1" size={20} />
                                    </div>
                                </div>
                                <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded uppercase tracking-wide backdrop-blur-sm">
                                    Video
                                </span>
                            </div>

                            <div className="p-5">
                                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{demo.title}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">{demo.description}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                                            {demo.profiles?.avatar_url ? (
                                                <img src={demo.profiles.avatar_url} alt={demo.profiles.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-500 text-[8px] font-bold">
                                                    {demo.profiles?.full_name?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-slate-600">{demo.profiles?.full_name || 'Anonymous'}</span>
                                    </div>
                                    <button className="text-xs font-bold text-blue-600 hover:underline">Watch Now</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
