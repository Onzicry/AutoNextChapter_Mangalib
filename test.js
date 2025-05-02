// ==UserScript==
// @name         Mangalib Auto Next Chapter (Mobile Support)
// @namespace    https://github.com/Onzicry/AutoNextChapter_Mangalib
// @homepageURL  https://github.com/Onzicry/AutoNextChapter_Mangalib
// @version      1.5.5
// @description  Автоматический переход на следующую главу (ПК + мобильная версия)
// @copyright    2025, Onzicry
// @author       Onzicry
// @match        https://mangalib.me/*/read*
// @match        https://mangalib.me/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let lastChapterNotificationShown = false;
    let notificationTimeout;
    let scriptActive = true;

    function showPageNotification(message) {
        // Удаляем старые уведомления
        const oldNotifications = document.querySelectorAll('.mangalib-notification');
        oldNotifications.forEach(n => n.remove());
        clearTimeout(notificationTimeout);

        // Создаем новое уведомление
        const notification = document.createElement('div');
        notification.className = 'mangalib-notification';

        // Стили для мобильных и десктопных устройств
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

        // Добавляем анимацию
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

        // Автоматическое скрытие через 5 секунд
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

        // Проверка десктопной версии
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

        // Мобильная версия (если не последняя глава)
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
        const threshold = Math.min(50, window.innerHeight * 0.05); // Уменьшенный порог для мобильных
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

    // Инициализация
    function init() {
        // Проверяем сразу при загрузке
        checkMobileLastChapter();

        // Добавляем обработчики событий
        const eventConfig = { passive: true };
        window.addEventListener('scroll', checkAndRedirect, eventConfig);
        window.addEventListener('load', checkAndRedirect, eventConfig);
        window.addEventListener('touchend', checkAndRedirect, eventConfig);
        window.addEventListener('touchmove', checkAndRedirect, eventConfig);

        // Для десктопов - обработка клавиатуры
        if (!/Mobi|Android/i.test(navigator.userAgent)) {
            window.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') checkAndRedirect();
            });
        }

        console.log('Mangalib Auto Next (Mobile Support) loaded');
    }

    // Запускаем скрипт
    init();
})();