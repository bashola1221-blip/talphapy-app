// nav.js - Navigation, PWA Install, and Manual Reminder Trigger
document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. BOTTOM NAVIGATION BAR ---
    const navHTML = `
    <style>
        .bottom-nav {
            position: fixed; bottom: 0; left: 0; width: 100%;
            background: #15264d; display: flex; justify-content: space-around;
            padding: 12px 0; border-top: 1px solid rgba(255,255,255,0.1); z-index: 1000;
        }
        .nav-item {
            display: flex; flex-direction: column; align-items: center;
            color: #94a3b8; text-decoration: none; font-size: 12px; font-weight: 600;
            gap: 4px; transition: color 0.2s;
        }
        .nav-item.active, .nav-item:hover { color: #f0c040; }
        .nav-icon { font-size: 20px; }
        body { padding-bottom: 80px !important; }

        @media (min-width: 768px) {
            .app-container, .login-box, .admin-box, .container { max-width: 900px !important; margin: 0 auto; }
            .bottom-nav { max-width: 900px; left: 50%; transform: translateX(-50%); border-radius: 12px 12px 0 0; border: 1px solid rgba(255,255,255,0.1); border-bottom: none; }
        }
    </style>
    <div class="bottom-nav">
        <a href="index.html" class="nav-item"><span class="nav-icon">🏠</span>Home</a>
        <a href="season1.html" class="nav-item"><span class="nav-icon">📘</span>Lessons</a>
        <a href="leaderboard.html" class="nav-item"><span class="nav-icon">🏆</span>Leaderboard</a>
        <a href="profile.html" class="nav-item"><span class="nav-icon">👤</span>Profile</a>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', navHTML);

    // --- 2. PWA INSTALL PROMPT ---
    if (localStorage.getItem('pwa_prompt_dismissed') !== 'true' && !window.matchMedia('(display-mode: standalone)').matches) {
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            showInstallBanner();
        });

        function showInstallBanner() {
            const banner = document.createElement('div');
            banner.id = 'pwa-install-banner';
            banner.innerHTML = `
                <style>
                    #pwa-install-banner {
                        position: fixed; bottom: 70px; left: 10px; right: 10px;
                        background: linear-gradient(135deg, #15264d, #0a1a3a);
                        border: 1px solid #f0c040; border-radius: 12px; padding: 16px;
                        display: flex; align-items: center; justify-content: space-between;
                        z-index: 1100; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                        animation: slideUp 0.5s ease-out;
                    }
                    @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                    .pwa-text { color: #fff; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
                    .pwa-btn { background: #f0c040; color: #0a1a3a; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer; }
                    .pwa-close { background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 0 8px; }
                    @media (min-width: 768px) { #pwa-install-banner { max-width: 400px; left: auto; right: 20px; bottom: 90px; } }
                </style>
                <div class="pwa-text"><span style="font-size: 24px;">📱</span> Install app for a better experience</div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="pwa-btn" id="install-btn">Install</button>
                    <button class="pwa-close" id="close-btn">✖</button>
                </div>
            `;
            document.body.appendChild(banner);

            document.getElementById('install-btn').addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    await deferredPrompt.userChoice;
                    deferredPrompt = null;
                    banner.remove();
                }
            });
            document.getElementById('close-btn').addEventListener('click', () => {
                banner.remove();
                localStorage.setItem('pwa_prompt_dismissed', 'true');
            });
        }
    }

    // --- 3. MANUAL REMINDER MODAL (Triggered by Lessons) ---
    window.triggerReminderModal = function() {
        const savedTime = localStorage.getItem('userReminderTime');
        const hasDismissed = localStorage.getItem('reminder_prompt_dismissed');

        // Only show if they haven't set a time AND haven't dismissed it
        if (!savedTime && hasDismissed !== 'true') {
            showReminderModal();
        }
    };

    function showReminderModal() {
        if (document.getElementById('reminder-modal-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'reminder-modal-overlay';
        overlay.innerHTML = `
            <style>
                #reminder-modal-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center;
                    z-index: 3000; padding: 20px; backdrop-filter: blur(4px);
                }
                .reminder-modal {
                    background: linear-gradient(180deg, #1a2c54 0%, #15264d 100%);
                    padding: 32px 24px; border-radius: 20px; width: 100%; max-width: 400px;
                    text-align: center; border: 1px solid rgba(240, 192, 64, 0.3);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .reminder-modal h2 { color: #ffffff; margin-bottom: 8px; font-size: 24px; }
                .reminder-modal p { color: #94a3b8; font-size: 15px; margin-bottom: 20px; line-height: 1.5; }
                .reminder-input {
                    width: 100%; padding: 14px; margin-bottom: 16px; border-radius: 12px;
                    background: #0d1425; border: 1px solid rgba(255,255,255,0.1);
                    color: white; font-size: 16px; outline: none; text-align: center;
                }
                .reminder-btn {
                    width: 100%; padding: 16px; border-radius: 12px; font-weight: 700;
                    font-size: 16px; border: none; cursor: pointer; margin-bottom: 12px;
                    background: #f0c040; color: #0a1a3a; transition: transform 0.1s;
                }
                .reminder-btn:active { transform: scale(0.97); }
                .reminder-skip {
                    background: transparent; color: #94a3b8; font-size: 14px;
                    border: none; cursor: pointer; padding: 8px;
                }
            </style>
            <div class="reminder-modal">
                <h2>🔥 Keep your streak alive!</h2>
                <p>Want a daily reminder to practice? Pick a time that works for you.</p>
                <input type="time" id="quick-reminder-time" class="reminder-input" value="18:00">
                <button onclick="quickSaveReminder()" class="reminder-btn">Yes, Remind Me</button>
                <button onclick="dismissReminder()" class="reminder-skip">No thanks, I'll remember</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    window.quickSaveReminder = async function() {
        const time = document.getElementById('quick-reminder-time').value;
        if (time) {
            localStorage.setItem('userReminderTime', time);
            
            if ('Notification' in window && Notification.permission !== 'granted') {
                await Notification.requestPermission();
            }
            
            document.getElementById('reminder-modal-overlay').remove();
            alert('Awesome! We will remind you at ' + time + ' every day.');
        }
    };

    window.dismissReminder = function() {
        localStorage.setItem('reminder_prompt_dismissed', 'true');
        document.getElementById('reminder-modal-overlay').remove();
    };

    // --- 4. DAILY REMINDER BACKGROUND TIMER ---
    async function setupDailyReminder() {
        const reminderTimeKey = 'userReminderTime';
        const lastNotifiedKey = 'lastNotifiedDate';

        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;

        async function checkAndNotify() {
            const preferredTime = localStorage.getItem(reminderTimeKey);
            if (!preferredTime) return; 

            const lastNotified = localStorage.getItem(lastNotifiedKey);
            const now = new Date();
            const todayDate = now.toISOString().split('T')[0]; 

            if (lastNotified === todayDate) return;

            const [prefHour, prefMinute] = preferredTime.split(':').map(Number);
            const prefTimeToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), prefHour, prefMinute, 0);

            if (now >= prefTimeToday) {
                if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then(registration => {
                        registration.active.postMessage({
                            type: 'SHOW_REMINDER',
                            payload: {
                                title: '🐍 Time to code!',
                                body: 'Keep your streak alive. A quick 5-minute lesson will do!',
                            }
                        });
                    });
                }
                localStorage.setItem(lastNotifiedKey, todayDate);
            }
        }

        setInterval(checkAndNotify, 60000); 
        checkAndNotify(); 
    }

    setupDailyReminder();
});
