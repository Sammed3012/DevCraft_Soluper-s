/**
 * REUSABLE VIDEO PLAYER COMPONENT
 * 
 * Handles rendering of responsive video iframe or HTML5 video.
 */

export class VideoPlayer {
    constructor(containerId, videoUrl) {
        this.containerId = containerId;
        this.videoUrl = videoUrl;
        this.playerId = `${containerId}-player`;
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Video container ${this.containerId} not found`);
            return;
        }

        // Determine type (very basic check)
        const isMp4 = this.videoUrl.endsWith('.mp4');

        let html = '';
        if (isMp4) {
            html = `
                <video 
                    id="${this.playerId}"
                    class="absolute inset-0 w-full h-full rounded-lg shadow-lg"
                    controls
                    autoplay
                    src="${this.videoUrl}">
                    Your browser does not support the video tag.
                </video>
            `;
        } else {
            // Assume YouTube/Embed
            // Ensure autoplay is on if not present
            let src = this.videoUrl;
            if (src.includes('youtube.com') || src.includes('youtu.be')) {
                if (!src.includes('autoplay')) {
                    src += (src.includes('?') ? '&' : '?') + 'autoplay=1';
                }
            }

            html = `
                <iframe 
                    id="${this.playerId}"
                    class="absolute inset-0 w-full h-full rounded-lg shadow-lg"
                    src="${src}"
                    title="Video Player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        }

        container.innerHTML = html;
    }

    stop() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = ''; // Remove player to stop video
        }
    }
}
