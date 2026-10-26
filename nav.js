// This script automatically adds the bottom navigation bar to any page!
document.addEventListener("DOMContentLoaded", function() {
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
        /* Add padding to body so content isn't hidden behind the nav */
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
        <a href="#" class="nav-item" onclick="alert('Leaderboard coming soon!')">
            <span class="nav-icon">🏆</span>
            Leaderboard
        </a>
        <a href="#" class="nav-item" onclick="alert('Profile coming soon!')">
            <span class="nav-icon">👤</span>
            Profile
        </a>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', navHTML);
});
