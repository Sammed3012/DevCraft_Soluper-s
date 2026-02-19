// Core Matching Logic - Enhanced V2 (Intelligent Engine)

window.loadMatches = async function (ideaId) {
    const container = document.getElementById('matches-container');
    if (!container) return;

    // Loading State
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center w-full py-8 text-slate-400 animate-pulse">
            <div class="w-8 h-8 rounded-full border-2 border-slate-300 border-t-green-500 animate-spin mb-2"></div>
            <span class="text-xs font-medium">Analyzing compatibility...</span>
        </div>
    `;

    try {
        console.log("Fetching matches for idea:", ideaId);
        // CALL NEW V2 RPC (Intelligent Matching)
        const { data: matches, error } = await supabase.rpc('match_users_to_idea_v2', { target_idea_id: ideaId });

        if (error) {
            console.error('RPC Error:', error);
            // If the V2 RPC fails (e.g., not run yet), try falling back or showing a helpful error
            if (error.code === 'PGRST202') { // Function not found
                console.warn("RPC function match_users_to_idea_v2 not found. Please run upgrade.sql");
                container.innerHTML = `
                    <div class="w-full text-center py-6 text-red-400 border border-dashed border-red-200 rounded-lg bg-red-50">
                        <ion-icon name="warning-outline" class="text-2xl mb-1"></ion-icon>
                        <p class="text-xs">System Upgrade Required</p>
                        <p class="text-[9px] mt-1 text-slate-500">Please run upgrade.sql in Supabase.</p>
                    </div>`;
                return;
            }
            throw error;
        }

        console.log("Matches found:", matches);

        if (!matches || matches.length === 0) {
            container.innerHTML = `
            <div class="w-full text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-lg">
                <ion-icon name="telescope-outline" class="text-2xl mb-1"></ion-icon>
                <p class="text-xs">No perfect matches found yet.</p>
            </div>`;
            return;
        }

        // Render Matches
        container.innerHTML = matches.map(user => {
            const score = Math.round(user.match_score);
            let color = 'text-green-500';
            let msg = 'Perfect Match';

            if (score < 80) { color = 'text-teal-500'; msg = 'Great Match'; }
            if (score < 60) { color = 'text-yellow-500'; msg = 'Potential'; }

            // SVG Circle Logic
            const radius = 18;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (score / 100) * circumference;

            // Safe property access
            const fullName = user.full_name || 'Anonymous';
            const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`;
            const role = user.role || 'Member';
            const matchedSkills = user.matched_skills || [];
            const missingSkills = user.missing_skills || [];

            return `
            <div class="flex-shrink-0 w-64 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                
                <!-- Match Badge -->
                <div class="absolute top-3 right-3 flex flex-col items-center group-hover:scale-110 transition-transform">
                    <div class="relative w-12 h-12 flex items-center justify-center">
                        <svg class="w-full h-full transform -rotate-90">
                            <!-- Track -->
                            <circle cx="24" cy="24" r="${radius}" stroke="currentColor" stroke-width="3" fill="transparent" class="text-slate-100" />
                            <!-- Progress -->
                            <circle cx="24" cy="24" r="${radius}" stroke="currentColor" stroke-width="3" fill="transparent" 
                                class="${color} transition-all duration-1000 ease-out" 
                                stroke-dasharray="${circumference}" 
                                stroke-dashoffset="${offset}" 
                                style="stroke-linecap: round;" />
                        </svg>
                        <span class="absolute text-[10px] font-bold text-slate-700">${score}%</span>
                    </div>
                </div>

                <!-- User Info -->
                <div class="flex items-center gap-3 mb-4">
                    <img src="${avatarUrl}" 
                        class="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover bg-slate-100">
                    <div>
                        <h4 class="font-bold text-slate-900 text-sm truncate w-32 leading-tight">${fullName}</h4>
                        <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">${role}</span>
                    </div>
                </div>

                <!-- Skill Analysis -->
                <div class="mb-4 space-y-2">
                    <div class="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        <ion-icon name="checkmark-circle" class="text-green-500"></ion-icon> Matched
                    </div>
                    <div class="flex flex-wrap gap-1">
                        ${matchedSkills.slice(0, 3).map(s =>
                `<span class="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-md border border-green-100 font-medium">${s}</span>`
            ).join('')}
                        ${matchedSkills.length > 3 ? `<span class="text-[9px] text-slate-400">+${matchedSkills.length - 3}</span>` : ''}
                    </div>

                    ${missingSkills.length > 0 ? `
                    <div class="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 mb-1">
                        <ion-icon name="alert-circle" class="text-orange-400"></ion-icon> Missing
                    </div>
                    <div class="flex flex-wrap gap-1 opacity-70">
                         ${missingSkills.slice(0, 2).map(s =>
                `<span class="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100 line-through decoration-slate-300">${s}</span>`
            ).join('')}
                    </div>` : ''}
                </div>

                <!-- Action -->
                <button class="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                    <ion-icon name="paper-plane-outline"></ion-icon>
                    Invite to Team
                </button>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Matching Engine Error:', error);
        container.innerHTML = '<div class="text-xs text-red-400 text-center w-full py-4 bg-red-50 rounded-lg">Matching Engine Error (See Console)</div>';
    }
};
