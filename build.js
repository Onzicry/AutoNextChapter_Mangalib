// ==UserScript==
// @name         Mangalib Auto Next Chapter (Mobile Support)
// @namespace    https://github.com/Onzicry/AutoNextChapter_Mangalib
// @homepageURL  https://github.com/Onzicry/AutoNextChapter_Mangalib
// @version      1.4
// @description  Автоматический переход на следующую главу (ПК + мобильная версия)
// @copyright    2025, Onzicry
// @author       Onzicry
// @match        https://mangalib.me/*/read*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Функция для поиска кнопки следующей главы (поддержка ПК и мобильной версии)
    function findNextChapterButton() {
        // Десктопная версия
        const desktopNextBtn = document.querySelector('.aa5_br:not(.aa5_aa6)');
        if (desktopNextBtn?.href) return desktopNextBtn.href;

        // Мобильная версия
        const mobileNextBtn = document.querySelector('.aew_br.aew_n2');
        if (mobileNextBtn?.href) return mobileNextBtn.href;

        // Альтернативные селекторы (на будущее)
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

    // Улучшенная проверка конца страницы (работает на любых устройствах)
    function isAtEndOfPage() {
        const scrollPosition = window.scrollY || window.pageYOffset;
        const pageHeight = document.body.scrollHeight - window.innerHeight;
        const threshold = Math.min(100, window.innerHeight * 0.1); // Динамический порог
        return scrollPosition >= pageHeight - threshold;
    }

    // Оптимизированный переход с минимальной задержкой
    function checkAndRedirect() {
        if (isAtEndOfPage()) {
            const nextChapterUrl = findNextChapterButton();
            if (nextChapterUrl) {
                setTimeout(() => {
                    // Проверяем, не прокрутили ли страницу назад во время задержки
                    if (isAtEndOfPage()) {
                        window.location.href = nextChapterUrl;
                    }
                }, 400); // Оптимальная задержка для мобильных устройств
            }
        }
    }

    // Универсальные обработчики событий
    const eventConfig = { passive: true };
    window.addEventListener('scroll', checkAndRedirect, eventConfig);
    window.addEventListener('load', checkAndRedirect, eventConfig);
    window.addEventListener('touchend', checkAndRedirect, eventConfig); // Для сенсорных устройств

    // Горячие клавиши (только для десктопов)
    if (!/Mobi|Android/i.test(navigator.userAgent)) {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') checkAndRedirect();
        });
    }

    console.log('Mangalib Auto Next (Mobile Support) loaded');
})();