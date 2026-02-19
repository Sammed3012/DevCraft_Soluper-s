// Communities Management Logic - Modern Redesign

document.addEventListener('DOMContentLoaded', async () => {
    fetchCommunities();

    const createForm = document.getElementById('create-community-form');
    if (createForm) {
        createForm.addEventListener('submit', handleCreateCommunity);
    }
});

async function fetchCommunities() {
    const grid = document.getElementById('communities-grid');
    if (!grid) return;

    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data: communities, error } = await supabase
            .from('communities')
            .select('*')
            .order('members_count', { ascending: false });

        if (error) throw error;

        // Fetch user memberships
        let myMemberships = [];
        if (user) {
            const { data: members } = await supabase
                .from('community_members')
                .select('community_id')
                .eq('user_id', user.id);
            if (members) myMemberships = members.map(m => m.community_id);
        }

        if (communities.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center text-slate-500 py-10">No communities found. Be the first to create one!</div>';
            return;
        }

        grid.innerHTML = communities.map(comm => {
            const isMember = myMemberships.includes(comm.id);
            return `
            <div class="bg-white p-6 hover:shadow-lg transition-all border border-slate-200 rounded-2xl group flex flex-col h-full animate-fade-in">
                <div class="flex justify-between items-start mb-4">
                    <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-700 shadow-sm border border-slate-200">
                        ${comm.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span class="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-50 rounded-lg flex items-center gap-1 border border-slate-100">
                        <ion-icon name="people"></ion-icon> ${comm.members_count || 0}
                    </span>
                </div>
                
                <h3 class="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">${comm.name}</h3>
                <p class="text-slate-500 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">${comm.description || 'No description available.'}</p>
                
                <button 
                    onclick="${isMember ? `leaveCommunity('${comm.id}')` : `joinCommunity('${comm.id}')`}" 
                    class="w-full py-2.5 rounded-xl font-bold text-sm transition-all ${isMember ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500 border border-slate-200' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md transform active:scale-95'}"
                >
                    ${isMember ? 'Joined' : 'Join Community'}
                </button>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error fetching communities:', error);
        grid.innerHTML = '<div class="col-span-full text-center text-red-500 py-10">Error loading communities.</div>';
    }
}

async function handleCreateCommunity(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-create-comm');
    // Using simple loading state toggle since utils might handle loading differently or we just want manual control here for simplicity
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div> Creating...';
    btn.disabled = true;

    const name = document.getElementById('comm-name').value;
    const description = document.getElementById('comm-desc').value;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }

        const { data, error } = await supabase
            .from('communities')
            .insert({
                name,
                description,
                created_by: user.id,
                members_count: 1
            })
            .select() // return created
            .single();

        if (error) throw error;

        // Add creator as member
        await supabase
            .from('community_members')
            .insert({
                community_id: data.id,
                user_id: user.id
            });

        showToast('Community created!', 'success');
        document.getElementById('create-community-modal').classList.add('hidden');
        document.getElementById('create-community-form').reset();
        fetchCommunities(); // Reload grid

    } catch (error) {
        console.error('Create error:', error);
        showToast(error.message || 'Error creating community', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Join/Leave logic remains mostly same but using window functions to ensure scope
window.joinCommunity = async function (id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = 'auth.html'; return; }

    try {
        const { error } = await supabase.from('community_members').insert({ community_id: id, user_id: user.id });
        if (error) throw error;

        showToast('Joined community!', 'success');
        fetchCommunities();

    } catch (error) {
        showToast('Error joining', 'error');
        console.error(error);
    }
};

window.leaveCommunity = async function (id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!confirm('Leave this community?')) return;

    try {
        const { error } = await supabase.from('community_members').delete().match({ community_id: id, user_id: user.id });
        if (error) throw error;
        showToast('Left community', 'success');
        fetchCommunities();
    } catch (error) {
        showToast('Error leaving', 'error');
    }
};
