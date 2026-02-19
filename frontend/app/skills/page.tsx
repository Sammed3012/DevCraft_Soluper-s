
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2, Award, Zap } from 'lucide-react';

export default function SkillsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');
    const [adding, setAdding] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Common skills for suggestion
    const commonSkills = [
        'React', 'Next.js', 'Typescript', 'Node.js', 'Tailwind CSS',
        'Python', 'Supabase', 'PostgreSQL', 'Figma', 'UI/UX Design'
    ];

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        } else if (user) {
            fetchSkills();
        }
    }, [user, loading, router]);

    const fetchSkills = async () => {
        try {
            setFetching(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('skills')
                .eq('id', user?.id)
                .single();

            if (error) throw error;
            setSkills(data.skills || []);
        } catch (error) {
            console.error('Error fetching skills:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleAddSkill = async (skillToAdd: string = newSkill) => {
        if (!skillToAdd.trim()) return;
        if (skills.includes(skillToAdd.trim())) {
            setNewSkill('');
            return;
        }

        setAdding(true);
        const updatedSkills = [...skills, skillToAdd.trim()];

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ skills: updatedSkills })
                .eq('id', user?.id);

            if (error) throw error;

            setSkills(updatedSkills);
            setNewSkill('');
        } catch (error) {
            console.error('Error adding skill:', error);
        } finally {
            setAdding(false);
        }
    };

    const removeSkill = async (skillToRemove: string) => {
        const updatedSkills = skills.filter(s => s !== skillToRemove);
        setSkills(updatedSkills); // Optimistic update

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ skills: updatedSkills })
                .eq('id', user?.id);

            if (error) throw error;
        } catch (error) {
            console.error('Error removing skill:', error);
            setSkills(skills); // Revert on error
        }
    };

    if (loading || fetching) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="text-yellow-500 fill-current" />
                    Skills Dashboard
                </h1>
                <p className="text-slate-500 mt-2">Manage your expertise and showcase what you can do.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Skills List */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Award size={20} className="text-blue-600" />
                            Your Skills
                        </h2>

                        {skills.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                <p className="text-slate-400 text-sm">No skills added yet. Add some below!</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <div key={skill} className="group flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100 transition-all hover:bg-blue-100 hover:border-blue-200">
                                        {skill}
                                        <button
                                            onClick={() => removeSkill(skill)}
                                            className="text-blue-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Skill</h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="saas-input flex-1"
                                placeholder="e.g. Graphic Design"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                            />
                            <button
                                onClick={() => handleAddSkill()}
                                disabled={adding || !newSkill.trim()}
                                className="btn-primary flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {adding ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                Add
                            </button>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Suggested Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {commonSkills.filter(s => !skills.includes(s)).map(skill => (
                                    <button
                                        key={skill}
                                        onClick={() => handleAddSkill(skill)}
                                        className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-1"
                                    >
                                        <Plus size={12} />
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2">Why add skills?</h3>
                        <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                            Adding skills helps our AI match you with the perfect projects and collaborators. The more specific you are, the better your recommendations.
                        </p>
                        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-white h-full rounded-full" style={{ width: `${Math.min((skills.length / 10) * 100, 100)}%` }}></div>
                        </div>
                        <p className="text-xs text-indigo-200 mt-2 font-medium">
                            {skills.length >= 5 ? 'Great profile strength!' : 'Add at least 5 skills for better matching.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
