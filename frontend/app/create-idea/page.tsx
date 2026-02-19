
'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Image as ImageIcon, X } from 'lucide-react';

export default function CreateIdeaPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'General',
        tags: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        setError(null);

        try {
            let imageUrl = null;

            // Upload image if exists
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('idea-images')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('idea-images')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            // Insert Idea
            const { error: insertError } = await supabase
                .from('ideas')
                .insert({
                    user_id: user.id,
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                    image_url: imageUrl
                });

            if (insertError) throw insertError;

            router.push('/dashboard');

        } catch (err: any) {
            setError(err.message || 'Failed to create project');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
                <div className="mb-8 border-b border-slate-100 pb-4">
                    <h1 className="text-2xl font-bold text-slate-900">Create New Project</h1>
                    <p className="text-slate-500 text-sm mt-1">Share your idea with the world.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Project Title</label>
                        <input
                            type="text"
                            required
                            className="saas-input"
                            placeholder="e.g. AI Task Manager"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Category</label>
                        <select
                            className="saas-input"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="General">General</option>
                            <option value="Fintech">Fintech</option>
                            <option value="EdTech">EdTech</option>
                            <option value="Health">Health</option>
                            <option value="AI/ML">AI/ML</option>
                            <option value="Web3">Web3</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Description</label>
                        <textarea
                            required
                            className="saas-input min-h-[120px]"
                            placeholder="Describe your project..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Tags (comma separated)</label>
                        <input
                            type="text"
                            className="saas-input"
                            placeholder="react, typescript, ai"
                            value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Cover Image</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={e => setImageFile(e.target.files?.[0] || null)}
                            />
                            {imageFile ? (
                                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                                    <ImageIcon size={20} />
                                    {imageFile.name}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setImageFile(null);
                                        }}
                                        className="z-10 bg-white rounded-full p-1 text-slate-400 hover:text-red-500"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center text-slate-400">
                                    <ImageIcon size={24} className="mx-auto mb-2" />
                                    <span className="text-xs">Click to upload image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2.5 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary flex items-center gap-2 px-8 py-2.5"
                        >
                            {submitting && <Loader2 className="animate-spin" size={18} />}
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
