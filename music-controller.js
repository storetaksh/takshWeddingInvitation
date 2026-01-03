class MusicController {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.init();
    }

    init() {
        try {
            // Use global weddingData
            const data = window.weddingData;

            if (data && data.music && data.music.url) {
                this.setupAudio(data.music.url, data.music.autoplay);
                this.createButton();
            }
        } catch (e) {
            console.error("Music init failed", e);
        }
    }

    setupAudio(url, autoplay) {
        this.audio = new Audio(url);
        this.audio.loop = true;

        // Try autoplay
        if (autoplay) {
            const playPromise = this.audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.isPlaying = true;
                    this.updateUI();
                }).catch(error => {
                    console.log("Autoplay blocked. Waiting for user interaction.");
                    this.isPlaying = false;
                    this.updateUI();

                    // Add one-time listener to document to unlock audio on first interaction
                    const unlock = () => {
                        this.play();
                        document.removeEventListener('click', unlock);
                        document.removeEventListener('touchstart', unlock);
                    };

                    document.addEventListener('click', unlock, { once: true });
                    document.addEventListener('touchstart', unlock, { once: true });
                });
            }
        }
    }

    createButton() {
        const btn = document.createElement('button');
        btn.id = 'music-control-btn';
        btn.className = 'music-fab';
        // Icon SVG: A simple music note
        btn.innerHTML = `
            <svg class="music-icon" viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <div class="music-waves">
                <span></span><span></span><span></span>
            </div>
        `;

        btn.onclick = () => this.toggle();
        document.body.appendChild(btn);
    }

    play() {
        if (!this.audio) return;
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updateUI();
        }).catch(err => {
            console.error("Playback failed:", err);
        });
    }

    pause() {
        if (!this.audio) return;
        this.audio.pause();
        this.isPlaying = false;
        this.updateUI();
    }

    toggle() {
        if (this.isPlaying) this.pause();
        else this.play();
    }

    updateUI() {
        const btn = document.getElementById('music-control-btn');
        if (btn) {
            if (this.isPlaying) {
                btn.classList.add('playing');
                btn.title = "Pause Music";
            } else {
                btn.classList.remove('playing');
                btn.title = "Play Music";
            }
        }
    }
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MusicController());
} else {
    new MusicController();
}
