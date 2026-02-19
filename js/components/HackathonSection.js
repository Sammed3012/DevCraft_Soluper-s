/**
 * Hackathon Section Component
 * Displays an active hackathon card with Unstop integration
 */

function renderHackathonSection() {
    return `
    <div class="glass p-1 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-white/10 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in mb-8 group">
        <div class="bg-slate-900/90 backdrop-blur-xl rounded-xl p-6 relative overflow-hidden">
            
            <!-- Glow Effect -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>

            <!-- Header -->
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="w-12 h-12 rounded-lg bg-white p-2 flex items-center justify-center shadow-md">
                    <img src="https://d8it4huxumps7.cloudfront.net/uploads/images/unstop/branding-new/logo_black.svg" alt="Unstop Logo" class="w-full h-full object-contain">
                </div>
                <span class="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30 flex items-center gap-1 animate-pulse">
                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                    Live
                </span>
            </div>

            <!-- Content -->
            <div class="relative z-10 mb-6">
                <h3 class="text-xl font-bold text-white mb-2 leading-tight">National Innovation Challenge 2026</h3>
                <p class="text-slate-400 text-sm">Join 50,000+ students in the ultimate hackathon. Solve real-world problems and win big!</p>
            </div>

            <!-- Action -->
            <a href="https://unstop.com" target="_blank" class="block w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-center text-sm transition-all shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2 group-hover:gap-3">
                View on Unstop
                <ion-icon name="arrow-forward" class="text-lg"></ion-icon>
            </a>

        </div>
    </div>
    `;
}

// Attach to window to be accessible globally
window.renderHackathonSection = renderHackathonSection;
