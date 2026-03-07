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

const performSummarization = async (apiKey) => {
    try {
        console.log('performSummarization called');
        
        const cloned = document.documentElement.cloneNode(true);
        const unwanted = cloned.querySelectorAll('script, style, noscript');
        unwanted.forEach(el => el.remove());
        const text = (cloned.body?.innerText || cloned.innerText || '').slice(0, 5000).trim();

        if (!text) throw new Error('No text found on page');

        console.log('Sending to OpenAI API...');
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ 
                    role: 'user', 
                    content: `Summarize in exactly 5 bullet points:\n\n${text}` 
                }],
                temperature: 0.5,
                max_tokens: 300
            })
        });

        console.log('API Response status:', res.status);
        
        if (!res.ok) {
            const errorData = await res.json();
            console.error('API Error:', errorData);
            
            if (res.status === 429) {
                throw new Error('Rate limited. Please wait a moment before trying again.');
            }
            throw new Error(`API Error ${res.status}: ${errorData.error?.message || 'Unknown'}`);
        }
        
        const data = await res.json();
        console.log('Summarization successful');
        return { success: true, summary: data.choices[0].message.content };
    } catch (error) {
        console.error('Summarization error:', error);
        return { success: false, error: error.message };
    }
};
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request.action, 'from tab:', sender.tab?.id);
    
    const tabId = request.tabId || sender.tab.id;
    
    if (request.action === 'bionic') {
        console.log('Executing bionic reading on tab:', tabId);
        chrome.scripting.executeScript({
            target: { tabId },
            files: ['content-bionic.js']
        });
        sendResponse({done: true});
    } 
    else if (request.action === 'focus') {
        console.log('Executing focus mode on tab:', tabId);
        handleToggleFocus(tabId, sendResponse);
    } 
    else if (request.action === 'summarize') {
        console.log('Starting summarization on tab:', tabId);
        chrome.scripting.executeScript({
            target: { tabId },
            function: performSummarization,
            args: [request.apiKey]
        }, (results) => {
            console.log('Execution results:', results);
            if (results && results[0] && results[0].result) {
                console.log(' Sending response back to popup');
                sendResponse(results[0].result);
            } else {
                console.error(' No result from injection');
                sendResponse({ success: false, error: 'Injection failed - no result' });
            }
        });
    } else {
        console.warn('Unknown action:', request.action);
        sendResponse({ error: 'Unknown action' });
    }
    return true;
});

chrome.tabs.onRemoved.addListener(tabId => stateManager.clear(tabId));
