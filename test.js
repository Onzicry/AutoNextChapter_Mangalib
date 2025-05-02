// ==UserScript==
// @name         Mangalib Auto Next Chapter (Mobile Support)
// @namespace    https://github.com/Onzicry/AutoNextChapter_Mangalib
// @homepageURL  https://github.com/Onzicry/AutoNextChapter_Mangalib
// @version      1.5
// @description  Автоматический переход на следующую главу (ПК + мобильная версия)
// @copyright    2025, Onzicry
// @author       Onzicry
// @match        https://mangalib.me/*/read*
// @match        https://mangalib.me/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let notificationShown = false; // Флаг для отслеживания показа уведомления

    // Функция для отображения уведомления на странице
    function showPageNotification(message) {
        if (notificationShown) return;
        notificationShown = true;

        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '30px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        notification.style.color = 'white';
        notification.style.padding = '12px 24px';
        notification.style.borderRadius = '25px';
        notification.style.zIndex = '99999';
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.fontSize = '14px';
        notification.style.backdropFilter = 'blur(5px)';
        notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        notification.style.animation = 'fadeIn 0.5s ease-out';
        notification.style.maxWidth = '80%';
        notification.style.textAlign = 'center';
        notification.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        notification.textContent = message;

        // Добавляем стили для анимации
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    // Функция для поиска кнопки следующей главы
    function findNextChapterButton() {
        // Десктопная версия
        const desktopNextBtn = document.querySelector('.aa5_br:not(.aa5_aa6)');
        if (desktopNextBtn) {
            // Проверяем текст кнопки
            if (desktopNextBtn.textContent.includes('На страницу тайтла')) {
                showPageNotification('Вы достигли последней главы.');
                return null;
            }
            if (desktopNextBtn?.href) return desktopNextBtn.href;
        }

        // Мобильная версия
        const mobileNextBtn = document.querySelector('.aew_br.aew_n2');
        if (mobileNextBtn?.href) return mobileNextBtn.href;

        // Альтернативные селекторы
        const fallbackSelectors = [
            '.reader-bottom-panel__next a',
            '.next-chapter',
            '[data-next-chapter]'
        ];

        for (const selector of fallbackSelectors) {
            const btn = document.querySelector(selector);
            if (btn?.href) return btn.href;
        }

        return null;
    }

    // Остальной код без изменений
    function isAtEndOfPage() {
        const scrollPosition = window.scrollY || window.pageYOffset;
        const pageHeight = document.body.scrollHeight - window.innerHeight;
        const threshold = Math.min(100, window.innerHeight * 0.1);
        return scrollPosition >= pageHeight - threshold;
    }

    function checkAndRedirect() {
        if (isAtEndOfPage()) {
            const nextChapterUrl = findNextChapterButton();
            if (nextChapterUrl) {
                setTimeout(() => {
                    if (isAtEndOfPage()) {
                        window.location.href = nextChapterUrl;
                    }
                }, 400);
            }
        }
    }

    const eventConfig = { passive: true };
    window.addEventListener('scroll', checkAndRedirect, eventConfig);
    window.addEventListener('load', checkAndRedirect, eventConfig);
    window.addEventListener('touchend', checkAndRedirect, eventConfig);

    if (!/Mobi|Android/i.test(navigator.userAgent)) {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') checkAndRedirect();
        });
    }

    console.log('Mangalib Auto Next (Mobile Support) loaded');
})();