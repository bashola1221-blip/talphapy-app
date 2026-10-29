// This script automatically adds the bottom navigation bar AND the PWA install prompt
document.addEventListener("DOMContentLoaded", function() {
    // --- 1. BOTTOM NAVIGATION BAR ---
    const navHTML = `
    <style>
        .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: #15264d;
            display: flex;
            justify-content: space-around;
            padding: 12px 0;
            border-top: 1px solid rgba(255,255,255,0.1);
            z-index: 1000;
        }
        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: #94a3b8;
            text-decoration: none;
            font-size: 12px;
            font-weight: 600;
            gap: 4px;
            transition: color 0.2s;
        }
        .nav-item.active, .nav-item:hover {
            color: #f0c040;
        }
        .nav-icon {
            font-size: 20px;
        }
        body {
            padding-bottom: 80px !important;
        }
    </style>
    <div class="bottom-nav">
        <a href="index.html" class="nav-item">
            <span class="nav-icon">🏠</span>
            Home
        </a>
        <a href="season1.html" class="nav-item">
            <span class="nav-icon">📘</span>
            Lessons
        </a>
        <a href="leaderboard.html" class="nav-item">
            <span class="nav-icon">🏆</span>
            Leaderboard
        </a>
        <a href="profile.html" class="nav-item">
            <span class="nav-icon">👤</span>
            Profile
        </a>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', navHTML);

    // --- 2. PWA INSTALL PROMPT ---
    // Check if the user has already dismissed the prompt
    if (localStorage.getItem('pwa_prompt_dismissed') === 'true') return;

    // Check if the app is already installed/running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        return; 
    }

    let deferredPrompt;

    // Listen for the browser telling us the app is installable
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the default mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        
        // Show our custom banner
        showInstallBanner();
    });

    function showInstallBanner() {
        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.innerHTML = `
            <style>
                #pwa-install-banner {
                    position: fixed;
                    bottom: 70px; /* Just above the bottom nav */
                    left: 10px;
                    right: 10px;
                    background: linear-gradient(135deg, #15264d, #0a1a3a);
                    border: 1px solid #f0c040;
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    z-index: 1100;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                    animation: slideUp 0.5s ease-out;
                }
                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .pwa-text {
                    color: #fff;
                    font-size: 14px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .pwa-btn {
                    background: #f0c040;
                    color: #0a1a3a;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 14px;
                    cursor: pointer;
                }
                .pwa-close {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0 8px;
                }
            </style>
            <div class="pwa-text">
                <span style="font-size: 24px;">📱</span>
                Install app for a better experience
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button class="pwa-btn" id="install-btn">Install</button>
                <button class="pwa-close" id="close-btn">✖</button>
            </div>
        `;
        document.body.appendChild(banner);

        document.getElementById('install-btn').addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
                banner.remove();
            }
        });

        document.getElementById('close-btn').addEventListener('click', () => {
            banner.remove();
            // Remember that they dismissed it so we don't annoy them again
            localStorage.setItem('pwa_prompt_dismissed', 'true');
        });
    }
});
