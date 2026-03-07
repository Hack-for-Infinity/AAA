chrome.runtime.onMessage.addListener((req, sender, sendResp) => {
  if (req.action === 'summarize') {
    summarize(req.apiKey);
  }
});

async function summarize(apiKey) {
  const text = Array.from(document.querySelectorAll('p, h1, h2, h3, li'))
    .map(el => el.textContent).join('\n').slice(0, 4000);
  
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{role: 'user', content: `Condense this page into exactly 5 bullet points:\n${text}`}]
      })
    });
    const data = await resp.json();
    const summary = data.choices[0].message.content;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:20%;left:20%;width:60%;background:#fff;border:2px solid #000;padding:20px;z-index:9999;font-size:16px;line-height:1.5;';
    overlay.innerHTML = `<h3>AI Summary</h3><ul>${summary.split('\n').map(line => `<li>${line}</li>`).join('')}</ul><button onclick="this.parentNode.remove()">Close</button>`;
    document.body.appendChild(overlay);
  } catch (e) {
    alert('Summary failed: ' + e.message);
  }
}
