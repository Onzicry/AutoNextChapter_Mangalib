// ==UserScript==
// @name         Mangalib Auto Next Chapter (Auto)
// @namespace    https://github.com/Onzicry/AutoNextChapter_Mangalib
// @homepageURL  https://github.com/Onzicry/AutoNextChapter_Mangalib
// @version      1.3
// @description  Автоматический переход на следующую главу
// @copyright    2025, Onzicry
// @author       Onzicry
// @match        https://mangalib.me/*/read*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Функция для поиска кнопки следующей главы
    function findNextChapterButton() {
        // Ищем кнопку "Следующая глава" (класс aa5_br без aa5_aa6)
        const nextBtn = document.querySelector('.aa5_br:not(.aa5_aa6)');
        if (nextBtn && nextBtn.href) {
            return nextBtn.href;
        }
        return null;
    }

    // Проверяем, достигнут ли конец страницы
    function isAtEndOfPage() {
        const scrollPosition = window.scrollY || window.pageYOffset;
        const pageHeight = document.body.scrollHeight - window.innerHeight;
        return scrollPosition >= pageHeight - 100; // 100px от конца
    }

    // Основная функция перехода
    function checkAndRedirect() {
        if (isAtEndOfPage()) {
            const nextChapterUrl = findNextChapterButton();
            if (nextChapterUrl) {
                setTimeout(() => {
                    window.location.href = nextChapterUrl; // Автопереход без подтверждения
                }, 400); // Задержка 1.5 сек
            }
        }
    }

    // Слушаем прокрутку и загрузку страницы
    window.addEventListener('scroll', checkAndRedirect);
    window.addEventListener('load', checkAndRedirect);

    // Горячая клавиша → (стрелка вправо) для принудительного перехода
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') checkAndRedirect();
    });

    console.log('Mangalib Auto Next (Auto) loaded');
})();