document.addEventListener('DOMContentLoaded', () => {
  const tabQuery = () => chrome.tabs.query({active: true, currentWindow: true});
  let isProcessing = false;
  
  // Reading tools
  document.getElementById('bionic').onclick = () => tabQuery().then(tabs => 
    chrome.runtime.sendMessage({action: 'bionic', tabId: tabs[0].id}));
  
  document.getElementById('focus').onclick = () => tabQuery().then(tabs => 
    chrome.runtime.sendMessage({action: 'focus', tabId: tabs[0].id}));
  
  // Font handling
  document.getElementById('applyFont').onclick = () => {
    const font = document.getElementById('fontFamily').value;
    const statusEl = document.getElementById('status');
    statusEl.textContent = '⏳ Applying font...';
    
    tabQuery().then(tabs => {
      if (font === 'OpenDyslexic-Regular') {
        const fontUrl = chrome.runtime.getURL('fonts/OpenDyslexic-Regular.woff2');
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          func: changeFontD,
          args: [font, fontUrl]
        }, () => {
          statusEl.textContent = '✅ OpenDyslexic font applied';
          setTimeout(() => { statusEl.textContent = ''; }, 2000);
        });
      } else {
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          func: changeFont,
          args: [font]
        }, () => {
          statusEl.textContent = `✅ ${font} font applied`;
          setTimeout(() => { statusEl.textContent = ''; }, 2000);
        });
      }
    });
  };
  
  document.getElementById('resetFont').onclick = () => {
    tabQuery().then(tabs => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: resetFont
      }, () => {
        const statusEl = document.getElementById('status');
        statusEl.textContent = '✅ Font reset to default';
        setTimeout(() => { statusEl.textContent = ''; }, 2000);
      });
    });
  };
  
  // Summarize functionality
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
  
  // API key management
  document.getElementById('save-key').onclick = () => {
    const key = document.getElementById('api-key').value;
    if (!key) {
      alert('❌ Enter API key first');
      return;
    }
    chrome.storage.sync.set({apiKey: key});
    alert('✅ API key saved');
  };
  
  // Load saved API key
  chrome.storage.sync.get(['apiKey'], (result) => {
    if (result.apiKey) document.getElementById('api-key').value = result.apiKey;
  });
});

// Font change functions (these run in the page context)
function changeFont(font) {
  // Remove any existing font styles
  const oldDyslexicStyle = document.getElementById('dyslexic-style');
  if (oldDyslexicStyle) oldDyslexicStyle.remove();
  
  const oldRegularStyle = document.getElementById('regular-font-style');
  if (oldRegularStyle) oldRegularStyle.remove();
  
  // Apply new font
  setTimeout(() => {
    const style = document.createElement('style');
    style.id = 'regular-font-style';
    style.textContent = `* { font-family: '${font}', sans-serif !important; }`;
    document.documentElement.appendChild(style);
  }, 100);
}

function changeFontD(font, fontUrl) {
  // Remove any existing font styles
  const oldRegularStyle = document.getElementById('regular-font-style');
  if (oldRegularStyle) oldRegularStyle.remove();
  
  const oldDyslexicStyle = document.getElementById('dyslexic-style');
  if (oldDyslexicStyle) oldDyslexicStyle.remove();
  
  // Apply OpenDyslexic font
  setTimeout(() => {
    const style = document.createElement('style');
    style.id = 'dyslexic-style';
    style.textContent = `
      @font-face {
        font-family: 'OpenDyslexic-Regular';
        src: url('${fontUrl}') format('woff2');
      }
      * { font-family: 'OpenDyslexic-Regular', sans-serif !important; }
    `;
    document.documentElement.appendChild(style);
  }, 100);
}

function resetFont() {
  const oldDyslexicStyle = document.getElementById('dyslexic-style');
  if (oldDyslexicStyle) oldDyslexicStyle.remove();
  
  const oldRegularStyle = document.getElementById('regular-font-style');
  if (oldRegularStyle) oldRegularStyle.remove();
}
