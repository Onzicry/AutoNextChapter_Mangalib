document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const statusText = document.getElementById('statusText');

    // Загружаем текущее состояние
    chrome.storage.sync.get(['scriptActive'], function(result) {
        const isActive = result.scriptActive !== undefined ? result.scriptActive : true;
        toggleSwitch.checked = isActive;
        statusText.textContent = isActive ? 'Включено' : 'Выключено';
    });

    // Обработка изменения переключателя
    toggleSwitch.addEventListener('change', function() {
        const isActive = this.checked;
        chrome.storage.sync.set({ scriptActive: isActive });
        statusText.textContent = isActive ? 'Включено' : 'Выключено';
        
        // Отправляем сообщение в content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "toggleScript",
                active: isActive
            });
        });
    });
});