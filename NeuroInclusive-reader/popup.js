document.addEventListener('DOMContentLoaded', () => {
  const tabQuery = () => chrome.tabs.query({active: true, currentWindow: true});
  
  document.getElementById('bionic').onclick = () => tabQuery().then(tabs => 
    chrome.runtime.sendMessage({action: 'bionic', tabId: tabs[0].id}));
  
  document.getElementById('focus').onclick = () => tabQuery().then(tabs => 
    chrome.runtime.sendMessage({action: 'focus', tabId: tabs[0].id}));
  
  document.getElementById('summarize').onclick = () => {
    chrome.storage.sync.get('apiKey', data => {
      if (!data.apiKey) return alert('Set OpenAI key first');
      tabQuery().then(tabs => 
        chrome.tabs.sendMessage(tabs[0].id, {action: 'summarize', apiKey: data.apiKey}));
    });
  };
  
  document.getElementById('save-key').onclick = () => {
    const key = document.getElementById('api-key').value;
    chrome.storage.sync.set({apiKey: key});
    alert('Key saved');
  };
});
