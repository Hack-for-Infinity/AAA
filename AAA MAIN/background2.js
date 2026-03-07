class FocusStateManager {
    constructor() {
        this.focusState = new Map();
    }
    toggle(tabId) {
        const newState = !(this.focusState.get(tabId) ?? false);
        this.focusState.set(tabId, newState);
        return newState;
    }
    get(tabId) {
        return this.focusState.get(tabId) ?? false;
    }
    clear(tabId) {
        this.focusState.delete(tabId);
    }
}

const stateManager = new FocusStateManager();

const handleToggleFocus = async (tabId, sendResponse) => {
    try {
        const isNowOn = stateManager.toggle(tabId);
        await chrome.scripting.executeScript({
            target: { tabId },
            ...(isNowOn 
                ? { files: ['content-focus.js'] }
                : { func: () => window.__neuroFocusMode?.destroy?.() || (document.body.classList.remove('neuro-focus-mode'), document.querySelectorAll('[data-focus-hidden]').forEach(el => (el.style.display = '', el.removeAttribute('data-focus-hidden')))) }
            )
        });
        sendResponse({ on: isNowOn, success: true });
    } catch (error) {
        console.error('Toggle focus error:', error);
        sendResponse({ error: error.message, success: false });
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const tabId = request.tabId || sender.tab.id;
    switch (request.action) {
        case 'toggleFocus':
            handleToggleFocus(tabId, sendResponse);
            break;
        case 'getState':
            sendResponse({ on: stateManager.get(tabId) });
            break;
        default:
            sendResponse({ error: 'Unknown action' });
    }
    return true;
});

chrome.tabs.onRemoved.addListener(tabId => stateManager.clear(tabId));