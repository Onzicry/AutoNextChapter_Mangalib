let lastChapterNotificationShown = false;
let notificationTimeout;
let scriptActive = true;

function showPageNotification(message) {
    const oldNotifications = document.querySelectorAll('.mangalib-notification');
    oldNotifications.forEach(n => n.remove());
    clearTimeout(notificationTimeout);
    
    const notification = document.createElement('div');
    notification.className = 'mangalib-notification';
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        z-index: 999999;
        font-family: Arial, sans-serif;
        font-size: 16px;
        backdrop-filter: blur(5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        animation: fadeIn 0.3s ease-out;
        max-width: 90%;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.2);
        word-break: break-word;
        white-space: nowrap;
    `;

    notification.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .mangalib-notification {
            animation: fadeIn 0.3s ease-out;
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    notificationTimeout = setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function checkMobileLastChapter() {
    const mobileNextBtn = document.querySelector('.aew_br.aew_n2');
    if (mobileNextBtn) {
        const btnText = mobileNextBtn.textContent.trim();

        if (btnText.includes('На страницу тайтла') || btnText.includes('Вернуться')) {
            if (!lastChapterNotificationShown) {
                lastChapterNotificationShown = true;
                scriptActive = false;
                showPageNotification('📖 Это последняя глава!');
                return true;
            }
        }
    }
    return false;
}

function findNextChapterButton() {
    if (checkMobileLastChapter()) {
        return null;
    }

    const desktopNextBtn = document.querySelector('.aa5_br:not(.aa5_aa6)');
    if (desktopNextBtn) {
        if ((desktopNextBtn.textContent.includes('На страницу тайтла') ||
             desktopNextBtn.textContent.includes('Вернуться')) &&
            !lastChapterNotificationShown) {
            lastChapterNotificationShown = true;
            scriptActive = false;
            showPageNotification('📖 Это последняя глава!');
            return null;
        }
        if (desktopNextBtn.href) return desktopNextBtn.href;
    }

    const mobileNextBtn = document.querySelector('.aew_br.aew_n2');
    if (mobileNextBtn && mobileNextBtn.href) {
        return mobileNextBtn.href;
    }

    return null;
}

function isAtEndOfPage() {
    if (!scriptActive) return false;

    const scrollPosition = window.scrollY || window.pageYOffset;
    const pageHeight = document.body.scrollHeight - window.innerHeight;
    const threshold = Math.min(50, window.innerHeight * 0.05);
    return scrollPosition >= pageHeight - threshold;
}

function checkAndRedirect() {
    if (!scriptActive) return;

    if (isAtEndOfPage()) {
        const nextChapterUrl = findNextChapterButton();
        if (nextChapterUrl) {
            setTimeout(() => {
                if (isAtEndOfPage()) {
                    window.location.href = nextChapterUrl;
                }
            }, 500);
        }
    }
}

function init() {
    // Загрузка настроек из хранилища
    chrome.storage.sync.get(['scriptActive'], function(result) {
        scriptActive = result.scriptActive !== undefined ? result.scriptActive : true;
    });

    checkMobileLastChapter();

    const eventConfig = { passive: true };
    window.addEventListener('scroll', checkAndRedirect, eventConfig);
    window.addEventListener('load', checkAndRedirect, eventConfig);
    window.addEventListener('touchend', checkAndRedirect, eventConfig);
    window.addEventListener('touchmove', checkAndRedirect, eventConfig);

    if (!/Mobi|Android/i.test(navigator.userAgent)) {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') checkAndRedirect();
        });
    }

    console.log('Mangalib Auto Next (Mobile Support) loaded');
}

init();

// Слушаем сообщения от popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "toggleScript") {
        scriptActive = request.active;
        showPageNotification(scriptActive ? 'Расширение включено' : 'Расширение выключено');
    }
});