document.addEventListener('DOMContentLoaded', () => {
  const tabQuery = () => chrome.tabs.query({active: true, currentWindow: true});
  let isProcessing = false;
  
  document.getElementById('bionic').onclick = () => tabQuery().then(tabs => 
    chrome.runtime.sendMessage({action: 'bionic', tabId: tabs[0].id}));
  
  document.getElementById('focus').onclick = () => tabQuery().then(tabs => 
    chrome.runtime.sendMessage({action: 'focus', tabId: tabs[0].id}));
  
  document.getElementById('summarize').onclick = () => {
    if (isProcessing) {
      alert('⏳ Already processing... please wait');
      return;
    }
    
    chrome.storage.sync.get('apiKey', data => {
      if (!data.apiKey) return alert('❌ Set OpenAI key first');
      
      const statusEl = document.getElementById('status');
      const resultEl = document.getElementById('result');
      statusEl.textContent = '⏳ Summarizing...';
      statusEl.style.color = '#666';
      resultEl.classList.remove('show');
      isProcessing = true;
      
      tabQuery().then(tabs => {
        chrome.runtime.sendMessage({
          action: 'summarize', 
          tabId: tabs[0].id,
          apiKey: data.apiKey
        }, (response) => {
          if (response && response.success) {
            statusEl.textContent = '✅ Summary Generated!';
            statusEl.style.color = '#0066cc';
            resultEl.innerHTML = response.summary.replace(/\n/g, '<br>');
            resultEl.classList.add('show');
          } else {
            statusEl.textContent = `❌ ${response?.error || 'Unknown error'}`;
            statusEl.style.color = '#cc0000';
          }
          isProcessing = false;
        });
      });
    });
  };
  
  document.getElementById('save-key').onclick = () => {
    const key = document.getElementById('api-key').value;
    if (!key) {
      alert('❌ Enter API key first');
      return;
    }
    chrome.storage.sync.set({apiKey: key});
    alert('✅ API key saved');
  };
  
  chrome.storage.sync.get(['apiKey'], (result) => {
    if (result.apiKey) document.getElementById('api-key').value = result.apiKey;
  });
});