// Communities Management Logic - Modern Redesign

window.initCommunities = async function () {
    console.log('Initializing Communities Page...');
    fetchCommunities();

    const createForm = document.getElementById('create-community-form');
    if (createForm) {
        // Prevent duplicate listeners
        const newForm = createForm.cloneNode(true);
        createForm.parentNode.replaceChild(newForm, createForm);
        newForm.addEventListener('submit', handleCreateCommunity);
    }
};

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
            grid.innerHTML = `
            <div class="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-400 text-4xl">
                     <ion-icon name="people-circle-outline"></ion-icon>
                </div>
                <h3 class="text-slate-900 font-bold mb-1 text-lg">No Communities Yet</h3>
                <p class="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Be the pioneer! Create the first community to bring people together.</p>
                <button onclick="document.getElementById('create-community-modal').classList.remove('hidden')" class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg">Start a Community</button>
            </div>`;
            return;
        }

        grid.innerHTML = communities.map((comm, index) => {
            const isMember = myMemberships.includes(comm.id);

            // Generate deterministic visual style based on ID or Index
            const styles = [
                'from-blue-500 to-indigo-600',
                'from-purple-500 to-pink-600',
                'from-emerald-400 to-teal-600',
                'from-orange-400 to-red-500',
                'from-cyan-400 to-blue-500'
            ];
            const bgGradient = styles[index % styles.length];
            const initials = comm.name.substring(0, 2).toUpperCase();

            // Simulate tags
            const tags = ['Tech', 'Innovation', 'Growth'];
            const randomTag = tags[index % tags.length];

            return `
            <div class="group relative bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                
                <!-- Card Header with Gradient -->
                <div class="h-24 bg-gradient-to-r ${bgGradient} relative">
                    <div class="absolute -bottom-6 left-6">
                        <div class="w-16 h-16 rounded-2xl bg-white p-1 shadow-md">
                            <div class="w-full h-full rounded-xl bg-slate-50 flex items-center justify-center text-xl font-bold text-slate-700 border border-slate-100">
                                ${initials}
                            </div>
                        </div>
                    </div>
                    
                    ${isMember ? `
                    <div class="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <ion-icon name="checkmark-circle"></ion-icon> Member
                    </div>
                    ` : ''}
                </div>

                <!-- Content -->
                <div class="pt-8 px-6 pb-6 flex-1 flex flex-col">
                    <div class="mb-4">
                        <div class="flex justify-between items-start">
                            <h3 class="text-xl font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors mb-1">${comm.name}</h3>
                        </div>
                        <span class="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200">${randomTag}</span>
                    </div>

                    <p class="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">${comm.description || 'Welcome to our community! Join us to connect, share, and grow together.'}</p>

                    <!-- Stats & Action -->
                    <div class="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                        <div class="flex items-center gap-2 text-slate-500 text-xs font-medium">
                            <ion-icon name="people" class="text-lg"></ion-icon> 
                            <span>${comm.members_count || 0} Members</span>
                        </div>

                        ${isMember ? `
                             <a href="community.html?id=${comm.id}" class="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors flex items-center gap-2">
                                View
                                <ion-icon name="arrow-forward"></ion-icon>
                             </a>
                        ` : `
                             <button onclick="joinCommunity('${comm.id}')" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center gap-2">
                                Join Group
                             </button>
                        `}
                    </div>
                </div>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error fetching communities:', error);
        grid.innerHTML = '<div class="col-span-full text-center text-red-500 py-10 bg-red-50 rounded-xl">Error loading communities. Please try again.</div>';
    }
}

async function handleCreateCommunity(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-create-comm');
    const originalText = btn.innerHTML;

    // Custom Loading State
    btn.innerHTML = '<ion-icon name="sync" class="animate-spin text-lg"></ion-icon> Creating...';
    btn.disabled = true;
    btn.classList.add('opacity-75', 'cursor-not-allowed');

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
            .select()
            .single();

        if (error) throw error;

        // Creator joins automatically
        await supabase
            .from('community_members')
            .insert({
                community_id: data.id,
                user_id: user.id
            });

        showToast('Community created successfully!', 'success');

        // Reset and Close
        const form = document.getElementById('create-community-form');
        form.reset();
        document.getElementById('create-community-modal').classList.add('hidden');

        // Refresh Grid
        fetchCommunities();

    } catch (error) {
        console.error('Create error:', error);
        showToast(error.message || 'Error creating community', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
}

// Global window functions for inline onclicks
window.joinCommunity = async function (id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = 'auth.html'; return; }

    try {
        const { error } = await supabase.from('community_members').insert({ community_id: id, user_id: user.id });
        if (error) throw error;

        // Optimistic UI Update (optional, but fetching is safer for counts)
        showToast('Welcome to the community!', 'success');
        fetchCommunities();

    } catch (error) {
        showToast('You are already a member or an error occurred.', 'info');
        console.error(error);
    }
};

window.leaveCommunity = async function (id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (!confirm('Are you sure you want to leave this community?')) return;

    try {
        const { error } = await supabase.from('community_members').delete().match({ community_id: id, user_id: user.id });
        if (error) throw error;
        showToast('You have left the community.', 'info');
        fetchCommunities();
    } catch (error) {
        showToast('Error leaving community', 'error');
    }
};
