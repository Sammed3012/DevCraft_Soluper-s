
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Mail, Link as LinkIcon, Edit3, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        bio: '',
        github_url: '',
        linkedin_url: '',
        twitter_url: '',
        website_url: ''
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        } else if (user) {
            fetchProfile();
        }
    }, [user, loading, router]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (error) throw error;
            setProfile(data);
            setFormData({
                full_name: data.full_name || '',
                bio: data.bio || '',
                github_url: data.github_url || '',
                linkedin_url: data.linkedin_url || '',
                twitter_url: data.twitter_url || '',
                website_url: data.website_url || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    bio: formData.bio,
                    github_url: formData.github_url,
                    linkedin_url: formData.linkedin_url,
                    twitter_url: formData.twitter_url,
                    website_url: formData.website_url,
                })
                .eq('id', user?.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
            fetchProfile();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error updating profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading || !profile) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">

                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative"></div>

                <div className="px-8 pb-8">
                    <div className="relative -mt-12 mb-6 flex justify-between items-end">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-md">
                                {profile.avatar_url ? (
                                    <Image
                                        src={profile.avatar_url}
                                        alt={profile.full_name || 'User'}
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                        <User size={32} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Edit3 size={16} />
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-1">{profile.full_name || 'Unnamed User'}</h1>
                            <p className="text-slate-500 text-sm flex items-center gap-2">
                                <Mail size={14} />
                                {profile.email || user?.email}
                            </p>
                        </div>

                        {!isEditing ? (
                            <div className="max-w-2xl">
                                <p className="text-slate-600 leading-relaxed text-sm mb-6">
                                    {profile.bio || "No bio added yet."}
                                </p>

                                <div className="flex gap-4">
                                    {profile.github_url && (
                                        <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 rounded-lg text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 transition-colors">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                                        </a>
                                    )}
                                    {profile.linkedin_url && (
                                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 rounded-lg text-blue-600 hover:text-blue-700 border border-slate-200 hover:border-slate-300 transition-colors">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                                        </a>
                                    )}
                                    {profile.twitter_url && (
                                        <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 rounded-lg text-blue-400 hover:text-blue-500 border border-slate-200 hover:border-slate-300 transition-colors">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                                        </a>
                                    )}
                                    {profile.website_url && (
                                        <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 transition-colors">
                                            <LinkIcon size={20} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSave} className="space-y-6 max-w-2xl bg-slate-50 p-6 rounded-xl border border-slate-200">
                                {message && (
                                    <div className={`p-3 text-sm rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                        {message.text}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            className="saas-input"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Website URL</label>
                                        <input
                                            type="url"
                                            className="saas-input"
                                            placeholder="https://example.com"
                                            value={formData.website_url}
                                            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Bio</label>
                                    <textarea
                                        className="saas-input min-h-[100px]"
                                        placeholder="Tell us about yourself..."
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Social Links</h3>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">GitHub URL</label>
                                        <input
                                            type="url"
                                            className="saas-input"
                                            placeholder="https://github.com/username"
                                            value={formData.github_url}
                                            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">LinkedIn URL</label>
                                        <input
                                            type="url"
                                            className="saas-input"
                                            placeholder="https://linkedin.com/in/username"
                                            value={formData.linkedin_url}
                                            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Twitter URL</label>
                                        <input
                                            type="url"
                                            className="saas-input"
                                            placeholder="https://twitter.com/username"
                                            value={formData.twitter_url}
                                            onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        {saving && <Loader2 className="animate-spin" size={16} />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
