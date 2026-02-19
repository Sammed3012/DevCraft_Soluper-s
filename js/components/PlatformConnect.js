/**
 * Platform Connect Component
 * Renders a grid or list of external platform links with modern UI
 */

const PLATFORMS = [
    { name: 'GitHub', url: 'https://github.com', icon: 'logo-github', color: 'from-gray-700 to-gray-900', desc: 'Build & Showcase Code' },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'logo-linkedin', color: 'from-blue-600 to-blue-800', desc: 'Professional Network' },
    { name: 'Unstop', url: 'https://unstop.com', icon: 'trophy', color: 'from-blue-500 to-cyan-500', desc: 'Find Hackathons' },
    { name: 'Devfolio', url: 'https://devfolio.co', icon: 'code-slash', color: 'from-indigo-500 to-purple-600', desc: 'Web3 Hackathons' },
    { name: 'Kaggle', url: 'https://kaggle.com', icon: 'bar-chart', color: 'from-sky-400 to-blue-500', desc: 'Data Science' },
    { name: 'LeetCode', url: 'https://leetcode.com', icon: 'terminal', color: 'from-yellow-500 to-orange-500', desc: 'Coding Practice' },
    { name: 'Hashnode', url: 'https://hashnode.com', icon: 'document-text', color: 'from-blue-600 to-indigo-600', desc: 'Tech Blogging' }
];

function renderPlatformGrid(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            ${PLATFORMS.map(p => `
                <a href="${p.url}" target="_blank" class="block group relative">
                    <div class="absolute inset-0 bg-gradient-to-br ${p.color} rounded-2xl blur opacity-25 group-hover:opacity-75 transition-opacity duration-300"></div>
                    <div class="relative h-full bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-2 transition-transform duration-300">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg">
                            <ion-icon name="${p.icon}" class="text-xl text-white"></ion-icon>
                        </div>
                        <div>
                            <h4 class="font-bold text-white text-sm">${p.name}</h4>
                            <p class="text-[10px] text-slate-400 leading-tight mt-1">${p.desc}</p>
                        </div>
                    </div>
                </a>
            `).join('')}
        </div>
    `;
}

function renderPlatformPills(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="flex flex-wrap gap-3">
            ${PLATFORMS.map(p => `
                <a href="${p.url}" target="_blank" class="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 hover:border-white/20 hover:bg-slate-700 transition-all group">
                    <ion-icon name="${p.icon}" class="text-lg text-slate-400 group-hover:text-white transition-colors"></ion-icon>
                    <span class="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">${p.name}</span>
                    <ion-icon name="arrow-out-outline" class="text-xs text-slate-500 group-hover:text-slate-300"></ion-icon>
                </a>
            `).join('')}
        </div>
    `;
}

// Expose globally
window.renderPlatformGrid = renderPlatformGrid;
window.renderPlatformPills = renderPlatformPills;
